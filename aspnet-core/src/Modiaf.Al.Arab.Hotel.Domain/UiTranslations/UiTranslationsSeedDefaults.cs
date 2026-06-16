namespace Modiaf.Al.Arab.Hotel.UiTranslations;

/// <summary>
/// ترجمات واجهة افتراضية — تُحمَّل من ملفات Domain.Shared/Localization.
/// </summary>
public static class UiTranslationsSeedDefaults
{
    /// <summary>نفس مخطط <c>UiManualTranslationsPayload</c> في الواجهة.</summary>
    public static string PayloadJson => UiTranslationsDefaults.BuildCombinedPayloadJson();

    internal static bool IsEmptyOrUnset(string? json)
    {
        if (string.IsNullOrWhiteSpace(json))
        {
            return true;
        }

        var t = json.TrimStart();
        return t == "{}" || t == "\"{}\"";
    }
}
