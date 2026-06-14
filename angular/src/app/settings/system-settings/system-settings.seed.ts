export type SystemSettingControlType = 'toggle' | 'select';

export interface SystemSettingRowDto {
  id: number;
  name: string;
  controlType: SystemSettingControlType;
  toggleValue?: boolean;
  selectValue?: string;
  selectOptions?: string[];
}

const ROOM_STATUS_OPTIONS = ['متسخ', 'نظيف', 'متاحة', 'الرجاء من المستخدم اختيار الحالة'];
const CASHIER_PRICE_OPTIONS = ['لكل صنف', 'لكل فاتورة'];
const ROOM_CARD_COLOR_OPTIONS = ['لون حالة الغرفة فقط', 'لون حسب نوع الغرفة'];

/** 67 إعداد نظام ثابت مطابق لشاشة Ultimate */
export const SYSTEM_SETTINGS_SEED: SystemSettingRowDto[] = [
  { id: 1, name: 'تفعيل تنبيهات النظام', controlType: 'toggle', toggleValue: true },
  { id: 2, name: 'تفعيل العملات المتعددة', controlType: 'toggle', toggleValue: false },
  { id: 7, name: 'إعادة غرفة مغلقة', controlType: 'toggle', toggleValue: true },
  { id: 8, name: 'تفعيل نقل الغرف برمز سعر مختلف', controlType: 'toggle', toggleValue: true },
  { id: 9, name: 'تفعيل نقل الغرف بنوع غرفة مختلف', controlType: 'toggle', toggleValue: true },
  { id: 13, name: 'تفعيل الأوفر بوكنج', controlType: 'toggle', toggleValue: true },
  { id: 15, name: 'ترحيل إيجار عند التسكين', controlType: 'toggle', toggleValue: true },
  { id: 27, name: 'استخدام الغرف المركبة', controlType: 'toggle', toggleValue: false },
  { id: 32, name: 'حذف الخدمات المرحلة مع الإيجار عند إلغاء ترحيل الإيجار', controlType: 'toggle', toggleValue: false },
  { id: 36, name: 'السماح بالحجز للملفات الشخصية أو الشركات المدرجة في القائمة السوداء', controlType: 'toggle', toggleValue: true },
  { id: 37, name: 'ترقيم القيود المحاسبية حسب اليوم (رقم واحد لكل يوم)', controlType: 'toggle', toggleValue: true },
  { id: 39, name: 'عرض بيانات بطاقة النزيل في شاشة التسكين', controlType: 'toggle', toggleValue: false },
  { id: 40, name: 'تفعيل الحد الأعلى والحد الأدنى لتسعيرة الغرف', controlType: 'toggle', toggleValue: false },
  { id: 47, name: 'استخدام الإشراف الداخلي', controlType: 'toggle', toggleValue: false },
  { id: 49, name: 'استخدام المراجع الليلي', controlType: 'toggle', toggleValue: false },
  { id: 57, name: 'استخدام الرسائل النصية SMS', controlType: 'toggle', toggleValue: false },
  { id: 59, name: 'السماح بإلغاء الخدمات عند استخدام إلغاء التسكين', controlType: 'toggle', toggleValue: false },
  { id: 60, name: 'إستخدام إلغاء التسكين', controlType: 'toggle', toggleValue: true },
  { id: 61, name: 'إستخدام الحد الأعلى لإقفال الكاشير', controlType: 'toggle', toggleValue: false },
  { id: 62, name: 'استخدام الدفع المقدم من التسكين', controlType: 'toggle', toggleValue: false },
  { id: 70, name: 'استخدام الفحص والترتيب في الاشراف الداخلي', controlType: 'toggle', toggleValue: false },
  { id: 73, name: 'تكوين قيود ايراد الايجار حسب أنواع الغرف', controlType: 'toggle', toggleValue: false },
  { id: 75, name: 'تفعيل الوصول المبكر', controlType: 'toggle', toggleValue: true },
  { id: 78, name: 'استخدام التوجيه في النظام', controlType: 'toggle', toggleValue: false },
  { id: 79, name: 'تفعيل المغادرة المتأخرة مع تكلفه', controlType: 'toggle', toggleValue: false },
  { id: 80, name: 'تسوية الكسور آليا عند اغلاق الغرفة', controlType: 'toggle', toggleValue: false },
  { id: 81, name: 'تفعيل استخدام RC', controlType: 'toggle', toggleValue: false },
  { id: 84, name: 'تفعيل الترقية! نقل الغرفة وتغيير رمز السعر مع الاحتفاظ بالسعر القديم', controlType: 'toggle', toggleValue: true },
  { id: 85, name: 'تفعيل خيارات الفاتورة الإلكترونية', controlType: 'toggle', toggleValue: true },
  { id: 88, name: 'استخدام تعارض الغرف في الاشراف الداخلي', controlType: 'toggle', toggleValue: true },
  { id: 92, name: 'استثناء الوقت في عرض المتاح في الحجز والتسكين', controlType: 'toggle', toggleValue: false },
  { id: 96, name: 'عرض رمز نوع الغرفه في مخطط الغرف', controlType: 'toggle', toggleValue: false },
  { id: 98, name: 'السماح بتعديل نوع الفاتورة الضريبيه عند الخروج', controlType: 'toggle', toggleValue: true },
  { id: 101, name: 'السماح بالاغلاق اليدوي لليوم في اي وقت', controlType: 'toggle', toggleValue: true },
  { id: 102, name: 'تفعيل الربط مع شموس السعودية', controlType: 'toggle', toggleValue: false },
  { id: 106, name: 'تفعيل الربط مع منصة السياحة السعودية', controlType: 'toggle', toggleValue: false },
  { id: 107, name: 'إخفاء العلامة العشرية في مخطط الغرف', controlType: 'toggle', toggleValue: false },
  { id: 108, name: 'استخدام الفئات العمرية للأطفال', controlType: 'toggle', toggleValue: true },
  { id: 110, name: 'استخدام حالة التشبيك في حالات الإشراف الداخلي للغرف', controlType: 'toggle', toggleValue: false },
  { id: 111, name: 'استخدام حالة الاستلام في حالات الإشراف الداخلي للغرف', controlType: 'toggle', toggleValue: false },
  {
    id: 112,
    name: 'حالة الغرفة بعد إلغاء التسكين',
    controlType: 'select',
    selectValue: 'متسخ',
    selectOptions: ROOM_STATUS_OPTIONS,
  },
  {
    id: 113,
    name: 'حالة الغرفة بعد النقل لغرفة أخرى',
    controlType: 'select',
    selectValue: 'متسخ',
    selectOptions: ROOM_STATUS_OPTIONS,
  },
  {
    id: 114,
    name: 'حالة الغرفة بعد المغادرة',
    controlType: 'select',
    selectValue: 'متسخ',
    selectOptions: ROOM_STATUS_OPTIONS,
  },
  {
    id: 115,
    name: 'تسكين الغرف المتسخة',
    controlType: 'select',
    selectValue: 'الرجاء من المستخدم اختيار الحالة',
    selectOptions: ROOM_STATUS_OPTIONS,
  },
  { id: 177, name: 'ترحيل القيود المحاسبيه حسب الفوترة', controlType: 'toggle', toggleValue: true },
  { id: 200, name: 'تفعيل سياسات الدفع المقدم', controlType: 'toggle', toggleValue: true },
  { id: 202, name: 'تفعيل الترحيل الصفري', controlType: 'toggle', toggleValue: true },
  { id: 203, name: 'استخدام مواسم الأسعار إجباري', controlType: 'toggle', toggleValue: true },
  { id: 204, name: 'تفعيل التسعير على مستوى الشخص', controlType: 'toggle', toggleValue: true },
  { id: 205, name: 'تفعيل تعديل تسعير الحجز', controlType: 'toggle', toggleValue: true },
  {
    id: 206,
    name: 'إضافة رقم المبنى لرقم الغرفة تلقائي في حالة وجود أكثر من مبنى لنفس الفندق',
    controlType: 'toggle',
    toggleValue: true,
  },
  {
    id: 207,
    name: 'تسوية فواتير الشركات تلقائياً عند المغادرة اذا كان هناك رصيد',
    controlType: 'toggle',
    toggleValue: false,
  },
  { id: 208, name: 'عرض المهام حسب الموظف الدخل في النظام', controlType: 'toggle', toggleValue: true },
  { id: 209, name: 'سبب نقل الغرف اجباري', controlType: 'toggle', toggleValue: true },
  { id: 210, name: 'السماح بتسكين غرف من نوع آخر في المجموعات', controlType: 'toggle', toggleValue: false },
  {
    id: 211,
    name: 'استخدام اثبات فارق الاستحقاق الخاص بالألوتمنت بشكل يومي',
    controlType: 'toggle',
    toggleValue: true,
  },
  { id: 212, name: 'تفعيل الحجز النهاري', controlType: 'toggle', toggleValue: true },
  { id: 214, name: 'البقاء في شاشة الحجز بعد الحفظ', controlType: 'toggle', toggleValue: true },
  { id: 215, name: 'استخدام المساعد الذكي', controlType: 'toggle', toggleValue: true },
  {
    id: 217,
    name: 'تفعيل التوقيع الرقمي لعقد الإقامة عند الشيك-إن المباشر',
    controlType: 'toggle',
    toggleValue: true,
  },
  {
    id: 218,
    name: 'تغيير حالة الغرفة المشغولة إلى متسخة ضمن إجراء المراجع الليلي',
    controlType: 'toggle',
    toggleValue: true,
  },
  {
    id: 219,
    name: 'طريقة تعديل سعر خدمات الكاشير',
    controlType: 'select',
    selectValue: 'لكل صنف',
    selectOptions: CASHIER_PRICE_OPTIONS,
  },
  { id: 220, name: 'عرض القيود المحاسبية في المراجع الليلي', controlType: 'toggle', toggleValue: false },
  { id: 221, name: 'تفعيل التمديد بدون رسوم', controlType: 'toggle', toggleValue: false },
  {
    id: 222,
    name: 'طريقة تلوين بطاقة الغرفة في مخطط الغرف',
    controlType: 'select',
    selectValue: 'لون حالة الغرفة فقط',
    selectOptions: ROOM_CARD_COLOR_OPTIONS,
  },
  { id: 250, name: 'إصدار مفتاح تلقائي عند التسكين', controlType: 'toggle', toggleValue: false },
  { id: 251, name: 'إصدار مفتاح تلقائي عند نقل الغرفة', controlType: 'toggle', toggleValue: false },
];
