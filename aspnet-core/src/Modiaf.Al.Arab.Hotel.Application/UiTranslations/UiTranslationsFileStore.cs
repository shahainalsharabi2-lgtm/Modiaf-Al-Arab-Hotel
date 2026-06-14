using System;
using System.Collections.Generic;
using System.IO;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Options;
using Volo.Abp.DependencyInjection;

namespace Modiaf.Al.Arab.Hotel.UiTranslations;


public class UiTranslationsFileStore(IOptions<UiTranslationsOptions> options)
    : IUiTranslationsFileStore, ITransientDependency
{
    public static readonly string[] SupportedLocales = ["ar", "en", "fr", "tr"];

    private static readonly SemaphoreSlim IoGate = new(1, 1);

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        PropertyNameCaseInsensitive = true,
        WriteIndented = true,
    };

    public async Task<string> ReadCombinedPayloadJsonAsync(CancellationToken cancellationToken = default)
    {
        await IoGate.WaitAsync(cancellationToken).ConfigureAwait(false);
        try
        {
            return await ReadCombinedPayloadJsonCoreAsync(cancellationToken).ConfigureAwait(false);
        }
        finally
        {
            IoGate.Release();
        }
    }

    private async Task<string> ReadCombinedPayloadJsonCoreAsync(CancellationToken cancellationToken)
    {
        await EnsureLocaleFilesExistAsync(cancellationToken).ConfigureAwait(false);

        var sidebarNav = new Dictionary<string, Dictionary<string, string>>();
        var brandSubtitle = new Dictionary<string, string>();
        var chrome = new Dictionary<string, Dictionary<string, string>>();
        var screenCopy = new Dictionary<string, Dictionary<string, Dictionary<string, string>>>();

        foreach (var locale in SupportedLocales)
        {
            var path = GetLocaleFilePath(locale);
            if (!File.Exists(path))
            {
                continue;
            }

            var localeFile = await ReadLocaleFileAsync(locale, cancellationToken).ConfigureAwait(false);
            sidebarNav[locale] = localeFile.SidebarNav ?? new Dictionary<string, string>();
            brandSubtitle[locale] = localeFile.BrandSubtitle ?? string.Empty;
            chrome[locale] = localeFile.Chrome ?? new Dictionary<string, string>();
            screenCopy[locale] = localeFile.ScreenCopy ??
                                 new Dictionary<string, Dictionary<string, string>>();
        }

        var combined = new Dictionary<string, object?>();
        if (sidebarNav.Count > 0)
        {
            combined["sidebarNav"] = sidebarNav;
        }

        if (brandSubtitle.Count > 0)
        {
            combined["brandSubtitle"] = brandSubtitle;
        }

        if (chrome.Count > 0)
        {
            combined["chrome"] = chrome;
        }

        if (screenCopy.Count > 0)
        {
            combined["screenCopy"] = screenCopy;
        }

        return JsonSerializer.Serialize(combined, JsonOptions);
    }

    public async Task WriteCombinedPayloadJsonAsync(
        string payloadJson,
        CancellationToken cancellationToken = default)
    {
        await IoGate.WaitAsync(cancellationToken).ConfigureAwait(false);
        try
        {
            using var doc = JsonDocument.Parse(string.IsNullOrWhiteSpace(payloadJson) ? "{}" : payloadJson);
            var root = doc.RootElement;

            Directory.CreateDirectory(GetRootDirectory());

            foreach (var locale in SupportedLocales)
            {
                var incoming = ExtractLocaleFromCombined(root, locale);
                if (!CombinedPayloadHasLocale(root, locale))
                {
                    // payload المرسل لا يتضمن هذه اللغة — لا نمسح ملفها (مثل en.json)
                    continue;
                }

                await WriteLocaleFileAsync(locale, incoming, cancellationToken).ConfigureAwait(false);
            }
        }
        finally
        {
            IoGate.Release();
        }
    }

    private async Task EnsureLocaleFilesExistAsync(CancellationToken cancellationToken)
    {
        var root = GetRootDirectory();
        if (!Directory.Exists(root))
        {
            Directory.CreateDirectory(root);
        }

        var anyMissing = false;
        foreach (var locale in SupportedLocales)
        {
            if (!File.Exists(GetLocaleFilePath(locale)))
            {
                anyMissing = true;
                break;
            }
        }

        if (!anyMissing)
        {
            return;
        }

        var seedJson = UiTranslationsSeedDefaults.PayloadJson;
        await WriteCombinedPayloadJsonCoreAsync(seedJson, cancellationToken).ConfigureAwait(false);
    }

    private async Task WriteCombinedPayloadJsonCoreAsync(
        string payloadJson,
        CancellationToken cancellationToken)
    {
        using var doc = JsonDocument.Parse(string.IsNullOrWhiteSpace(payloadJson) ? "{}" : payloadJson);
        var root = doc.RootElement;

        Directory.CreateDirectory(GetRootDirectory());

        foreach (var locale in SupportedLocales)
        {
            var incoming = ExtractLocaleFromCombined(root, locale);
            if (!CombinedPayloadHasLocale(root, locale))
            {
                continue;
            }

            await WriteLocaleFileAsync(locale, incoming, cancellationToken).ConfigureAwait(false);
        }
    }

    private string GetRootDirectory()
    {
        if (string.IsNullOrWhiteSpace(options.Value.RootDirectory))
        {
            throw new InvalidOperationException(
                "UiTranslations:RootDirectory is not configured. Set it in HotelHttpApiHostModule.");
        }

        return options.Value.RootDirectory;
    }

    private string GetLocaleFilePath(string locale) =>
        Path.Combine(GetRootDirectory(), $"{locale}.json");

    private async Task<UiTranslationsLocaleFileDto> ReadLocaleFileAsync(
        string locale,
        CancellationToken cancellationToken)
    {
        var path = GetLocaleFilePath(locale);
        if (!File.Exists(path))
        {
            return new UiTranslationsLocaleFileDto();
        }

        return await RunWithIoRetryAsync(
            async () =>
            {
                await using var stream = new FileStream(
                    path,
                    FileMode.Open,
                    FileAccess.Read,
                    FileShare.ReadWrite | FileShare.Delete);
                var dto = await JsonSerializer
                    .DeserializeAsync<UiTranslationsLocaleFileDto>(stream, JsonOptions, cancellationToken)
                    .ConfigureAwait(false);
                return dto ?? new UiTranslationsLocaleFileDto();
            },
            cancellationToken).ConfigureAwait(false);
    }

    private async Task WriteLocaleFileAsync(
        string locale,
        UiTranslationsLocaleFileDto dto,
        CancellationToken cancellationToken)
    {
        var path = GetLocaleFilePath(locale);
        var tempPath = path + ".tmp";

        await RunWithIoRetryAsync(
            async () =>
            {
                await using (var stream = new FileStream(
                                 tempPath,
                                 FileMode.Create,
                                 FileAccess.Write,
                                 FileShare.None))
                {
                    await JsonSerializer
                        .SerializeAsync(stream, dto, JsonOptions, cancellationToken)
                        .ConfigureAwait(false);
                }

                if (File.Exists(path))
                {
                    File.Replace(tempPath, path, destinationBackupFileName: null);
                }
                else
                {
                    File.Move(tempPath, path);
                }

                return true;
            },
            cancellationToken).ConfigureAwait(false);
    }

    private static async Task<T> RunWithIoRetryAsync<T>(
        Func<Task<T>> action,
        CancellationToken cancellationToken)
    {
        const int maxAttempts = 5;
        for (var attempt = 1; attempt <= maxAttempts; attempt++)
        {
            cancellationToken.ThrowIfCancellationRequested();
            try
            {
                return await action().ConfigureAwait(false);
            }
            catch (IOException) when (attempt < maxAttempts)
            {
                await Task.Delay(50 * attempt, cancellationToken).ConfigureAwait(false);
            }
        }

        return await action().ConfigureAwait(false);
    }

    private static bool CombinedPayloadHasLocale(JsonElement root, string locale)
    {
        if (root.TryGetProperty("sidebarNav", out var sidebarNav) &&
            sidebarNav.TryGetProperty(locale, out _))
        {
            return true;
        }

        if (root.TryGetProperty("brandSubtitle", out var brandSubtitle) &&
            brandSubtitle.TryGetProperty(locale, out _))
        {
            return true;
        }

        if (root.TryGetProperty("chrome", out var chrome) &&
            chrome.TryGetProperty(locale, out _))
        {
            return true;
        }

        if (root.TryGetProperty("screenCopy", out var screenCopy) &&
            screenCopy.TryGetProperty(locale, out _))
        {
            return true;
        }

        return false;
    }

    private static UiTranslationsLocaleFileDto ExtractLocaleFromCombined(JsonElement root, string locale)
    {
        var dto = new UiTranslationsLocaleFileDto();

        if (root.TryGetProperty("sidebarNav", out var sidebarNav) &&
            sidebarNav.TryGetProperty(locale, out var navLocale) &&
            navLocale.ValueKind == JsonValueKind.Object)
        {
            dto.SidebarNav = JsonSerializer.Deserialize<Dictionary<string, string>>(navLocale.GetRawText(), JsonOptions);
        }

        if (root.TryGetProperty("brandSubtitle", out var brandSubtitle) &&
            brandSubtitle.TryGetProperty(locale, out var brandValue) &&
            brandValue.ValueKind == JsonValueKind.String)
        {
            dto.BrandSubtitle = brandValue.GetString();
        }

        if (root.TryGetProperty("chrome", out var chrome) &&
            chrome.TryGetProperty(locale, out var chromeLocale) &&
            chromeLocale.ValueKind == JsonValueKind.Object)
        {
            dto.Chrome = JsonSerializer.Deserialize<Dictionary<string, string>>(chromeLocale.GetRawText(), JsonOptions);
        }

        if (root.TryGetProperty("screenCopy", out var screenCopy) &&
            screenCopy.TryGetProperty(locale, out var screenLocale) &&
            screenLocale.ValueKind == JsonValueKind.Object)
        {
            dto.ScreenCopy = JsonSerializer.Deserialize<Dictionary<string, Dictionary<string, string>>>(
                screenLocale.GetRawText(),
                JsonOptions);
        }

        return dto;
    }
}
