namespace Modiaf.Al.Arab.Hotel.UiTranslations;

/// <summary>مسار مجلد ملفات الترجمة (<c>ar.json</c>, <c>tr.json</c>, <c>zh-Hans.json</c>).</summary>
public class UiTranslationsOptions
{
    /// <summary>المسار الكامل لمجلد JSON (يُضبط من HttpApi.Host عند التشغيل).</summary>
    public string RootDirectory { get; set; } = string.Empty;

    /// <summary>
    /// مسار اختياري لمجلد "المصدر" داخل الكود (مثل Domain.Shared/Localization).
    /// عند ضبطه، سيكتب الحفظ إلى هذا المسار أيضاً (مفيد للتطوير المحلي + Git).
    /// </summary>
    public string? SourceDirectory { get; set; }
}
