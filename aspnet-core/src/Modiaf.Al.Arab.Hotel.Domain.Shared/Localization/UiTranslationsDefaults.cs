using System;
using System.Collections.Generic;
using System.IO;
using System.Text;
using System.Text.Json;

namespace Modiaf.Al.Arab.Hotel.UiTranslations;

/// <summary>
/// ترجمات واجهة Angular من ملفات JSON مضمّنة في Domain.Shared/Localization.
/// </summary>
public static class UiTranslationsDefaults
{
    public static readonly string[] SupportedLocales = ["ar", "en", "fr", "id", "tr", "am"];

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        PropertyNameCaseInsensitive = true,
        WriteIndented = true,
    };

    public static string? TryReadEmbeddedLocaleJson(string locale)
    {
        var resourceName = ResolveResourceName(locale);
        if (resourceName is null)
        {
            return null;
        }

        using var stream = typeof(UiTranslationsDefaults).Assembly.GetManifestResourceStream(resourceName);
        if (stream is null)
        {
            return null;
        }

        using var reader = new StreamReader(stream, Encoding.UTF8);
        return reader.ReadToEnd();
    }

    public static string BuildCombinedPayloadJson()
    {
        var sidebarNav = new Dictionary<string, Dictionary<string, string>>();
        var brandSubtitle = new Dictionary<string, string>();
        var chrome = new Dictionary<string, Dictionary<string, string>>();
        var screenCopy = new Dictionary<string, Dictionary<string, Dictionary<string, string>>>();

        foreach (var locale in SupportedLocales)
        {
            var json = TryReadEmbeddedLocaleJson(locale);
            if (string.IsNullOrWhiteSpace(json))
            {
                continue;
            }

            using var doc = JsonDocument.Parse(json);
            var root = doc.RootElement;

            if (root.TryGetProperty("sidebarNav", out var nav) && nav.ValueKind == JsonValueKind.Object)
            {
                sidebarNav[locale] = JsonSerializer.Deserialize<Dictionary<string, string>>(nav.GetRawText(), JsonOptions)
                    ?? new Dictionary<string, string>();
            }

            if (root.TryGetProperty("brandSubtitle", out var brand) && brand.ValueKind == JsonValueKind.String)
            {
                var value = brand.GetString();
                if (!string.IsNullOrWhiteSpace(value))
                {
                    brandSubtitle[locale] = value;
                }
            }

            if (root.TryGetProperty("chrome", out var chromeEl) && chromeEl.ValueKind == JsonValueKind.Object)
            {
                chrome[locale] = JsonSerializer.Deserialize<Dictionary<string, string>>(chromeEl.GetRawText(), JsonOptions)
                    ?? new Dictionary<string, string>();
            }

            if (root.TryGetProperty("screenCopy", out var screen) && screen.ValueKind == JsonValueKind.Object)
            {
                screenCopy[locale] = JsonSerializer.Deserialize<Dictionary<string, Dictionary<string, string>>>(
                    screen.GetRawText(),
                    JsonOptions) ?? new Dictionary<string, Dictionary<string, string>>();
            }
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

    private static string? ResolveResourceName(string locale)
    {
        var suffix = $".Localization.{locale}.json";
        foreach (var name in typeof(UiTranslationsDefaults).Assembly.GetManifestResourceNames())
        {
            if (name.EndsWith(suffix, StringComparison.OrdinalIgnoreCase))
            {
                return name;
            }
        }

        return null;
    }
}
