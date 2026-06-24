# ملخص هيكلية UltimateOtelPremio — ABP + Angular + ASP.NET Core

*Ultimate Otel Premio — نظام إدارة فنادق — مرجع بناء Modular Monolith*

---

## 1. نظرة عامة

**UltimateOtelPremio** هو مشروع مرجعي لبناء أنظمة الفنادق باستخدام:

| التقنية | الدور |
|---------|-------|
| **ABP Framework** | إطار DDD + Modular Monolith |
| **ASP.NET Core** | API وطبقات الباك-اند |
| **Entity Framework Core** | ORM وقاعدة البيانات |
| **Angular** | واجهة المستخدم (SPA) |
| **OpenIddict** | مصادقة OAuth2 / OpenID Connect |

النمط المعماري: **Modular Monolith** — تطبيق واحد قابل للنشر، لكنه مقسّم إلى **وحدات أعمال مستقلة** (Modules) لكل مجال وظيفي.

---

## 2. هيكل المجلدات الرئيسي

```
UltimateOtelPremio/
├── host/                          ← نقاط التشغيل (المضيف)
│   ├── Ultimate.OtelPremio.HttpApi.Host      ← API الرئيسي
│   ├── Ultimate.OtelPremio.AuthServer        ← خادم المصادقة
│   ├── Ultimate.OtelPremio.DbMigrator        ← ترحيل قاعدة البيانات
│   ├── Ultimate.OtelPremio.Host.Shared       ← إعدادات مشتركة
│   └── Ultimate.OtelPremio.SaaS.HttpApi.Host ← API للتعددية SaaS
├── modules/                       ← وحدات الأعمال (14+ مجال)
│   ├── Reservatios/               ← الحجوزات
│   ├── FrontDesk/                 ← الاستقبال
│   ├── RoomsManagement/           ← إدارة الغرف
│   ├── HouseKeeping/              ← التدبير المنزلي
│   ├── NightAudit/                ← التدقيق الليلي
│   ├── RevenueManagement/         ← الإيرادات والمحاسبة
│   ├── ProfileManagement/         ← ملفات الضيوف / CRM
│   ├── BackOffice/                ← الإدارة والإعدادات
│   ├── ChannelManagement/         ← قنوات الحجز
│   ├── EInvoice / Laundry         ← فواتير إلكترونية / مغسلة
│   └── SaaS                       ← تعدد الفنادق / المستأجرين
├── src/                           ← طبقة التطبيق الأساسية (إن وُجدت)
├── test/                          ← اختبارات
└── Solution Items/
```

---

## 3. طبقات كل وحدة (Module) — نمط ABP القياسي

كل وحدة في `modules/` تتكون من **6 مشاريع** (.csproj):

| # | المشروع | المسؤولية |
|---|---------|-----------|
| 1 | `*.Domain.Shared` | ثوابت، أكواد أخطاء، تعدادات، إعدادات مشتركة |
| 2 | `*.Domain` | Entities، واجهات Repository، منطق المجال |
| 3 | `*.Application.Contracts` | DTOs، واجهات `I*AppService`، صلاحيات |
| 4 | `*.Application` | `*AppService`، AutoMapper، Handlers |
| 5 | `*.EntityFrameworkCore` | DbContext، Repositories، Migrations |
| 6 | `*.HttpApi` | Controllers (اختياري — أو Conventional API) |

### مثال: وحدة Reservatios (الحجوزات)

```
modules/Reservatios/
├── Ultimate.OtelPremio.Reservatios.Domain.Shared/
│   ├── ReservationsErrorCodes.cs
│   └── ReservationsConsts
├── Ultimate.OtelPremio.Reservatios.Domain/
│   ├── Reservations/Reservation.cs
│   ├── Blocks/Block.cs
│   └── Repositories/IBlockRepository.cs
├── Ultimate.OtelPremio.Reservatios.Application.Contracts/
│   ├── Dtos/BookingTypeDto.cs
│   ├── Dtos/Blocks/
│   ├── Dtos/Reservation/
│   └── Services/IBlockAppService.cs
├── Ultimate.OtelPremio.Reservatios.Application/
│   ├── Services/BookingTypeAppService.cs
│   ├── ReservationsApplicationAutoMapperProfile.cs
│   └── Handlers/
├── Ultimate.OtelPremio.Reservatios.EntityFrameworkCore/
│   ├── EntityFrameworkCore/ReservationsDbContext.cs
│   └── Repositories/BlockRepository.cs
└── Ultimate.OtelPremio.Reservatios.HttpApi/
    └── Controllers/
```

---

## 4. وحدات الأعمال (Business Modules)

| الوحدة | الوظيفة في الفندق |
|--------|-------------------|
| **Reservatios** | حجوزات فردية وجماعية (Blocks)، أنواع الحجز، إلغاء، خطابات تأكيد |
| **FrontDesk** | استقبال، Check-in/out، خطة الغرف، مفاتيح الضيوف |
| **RoomsManagement** | الغرف، الأنواع، الطوابق، الحالة، الصيانة |
| **HouseKeeping** | مهام التنظيف، فحص الغرف، طلبات الصيانة |
| **NightAudit** | إقفال اليوم، مراجعة الحجوزات، حركة الغرف |
| **RevenueManagement** | الإيرادات، الفواتير، الحسابات، الترحيل المحاسبي |
| **ProfileManagement** | أفراد، شركات، وكلاء، ممثلين، القائمة السوداء |
| **BackOffice** | إعدادات النظام، التقارير، الترميز العام |
| **ChannelManagement** | ربط قنوات الحجز الإلكترونية (OTA) |
| **EInvoice** | الفوترة الإلكترونية |
| **Laundry** | خدمات المغسلة |
| **SaaS** | إدارة عدة فنادق (Multi-tenancy) |
| **ExternalService** | تكامل خدمات خارجية |

---

## 5. طبقة Host (المضيف)

### 5.1 HttpApi.Host — نقطة التشغيل الرئيسية

المجلد `host/Ultimate.OtelPremio.HttpApi.Host/` يجمع كل الوحدات ويحتوي:

| المجلد / الملف | الدور |
|----------------|-------|
| `Program.cs` | نقطة بدء التطبيق |
| `OtelPremioHttpApiHostModule.cs` | تسجيل الوحدات والإعدادات |
| `Controllers/` | Controllers إضافية |
| `EntityFrameworkCore/` | DbContext الموحّد للمضيف |
| `MultiTenancy/` | دعم تعدد الفنادق |
| `HotelIdMiddleware` | تمرير معرف الفندق في الطلبات |
| `OpenIddict/` | إعداد OAuth |
| `Reports/` | تقارير |
| `Workers/` | مهام خلفية |
| `wwwroot/` | ملفات ثابتة |

### 5.2 AuthServer

خادم مصادقة **منفصل** عن API — نمط ABP الاحترافي لفصل Identity عن Business API.

### 5.3 DbMigrator

تطبيق كونسول لتشغيل Migrations وبذور البيانات عند النشر.

---

## 6. تدفق البيانات (Data Flow)

```
Angular SPA
    ↓  HTTPS + Bearer Token
HttpApi.Host  (CORS + Swagger + Middleware)
    ↓  Conventional Controllers  /api/app/{service}
Application Layer  (*AppService)
    ↓  IRepository / Domain Services
EntityFrameworkCore  (EfCore*Repository)
    ↓
SQL Server / PostgreSQL
```

### تدفق إنشاء حجز (مثال)

```
1. Angular  →  POST /api/app/block
2. BlockController  →  BlockAppService.CreateAsync()
3. BlockAppService  →  IBlockRepository.InsertAsync()
4. BlockRepository  →  ReservationsDbContext
5. EF Core  →  جدول Blocks في قاعدة البيانات
```

---

## 7. كيانات مجال الحجوزات (Reservatios Domain)

وحدة الحجوزات تحتوي كيانات غنية (نموذج فندقي متكامل):

| الكيان | الوصف |
|--------|-------|
| `Reservation` | الحجز الرئيسي — رقم الحجز، الضيف، التواريخ، الحالة |
| `Block` | حجز جماعي / مجموعة غرف لشركة أو فعالية |
| `ReservationRoomStay` | إقامة الغرفة ضمن الحجز |
| `ReservationGuest` | بيانات الضيف المرتبط بالحجز |
| `ReservationPayment` | مدفوعات الحجز |
| `Cancellation` | إلغاء الحجز |
| `ConfirmationLetter` | خطاب التأكيد |
| `BookingType` | نوع الحجز (مباشر، شركة، وكيل…) |
| `GuaranteeType` | نوع الضمان |
| `PurposeOfStay` | غرض الإقامة |
| `ReservationPromotion` | عروض ترويجية |
| `LinkedReservation` | حجوزات مرتبطة |
| `ReservationTransport` | ترتيبات النقل |
| `ReservationComment` | ملاحظات الحجز |

**مثال كود — كيان Reservation:**

```csharp
public class Reservation : AuditedAggregateRoot<Guid>
{
    public long ReservationNo { get; set; }  // رقم الحجز
    // الضيف، الغرفة، التواريخ، المبلغ، الحالة...
}
```

---

## 8. نمط Repository + AppService

### واجهة Repository (Domain)

```csharp
public interface IBlockRepository : IRepository<Block>
{
    Task<int> GetMaxId(int hotelId);
}
```

### تنفيذ EF Core

```csharp
public class BlockRepository
    : EfCoreRepository<ReservationsDbContext, Block>, IBlockRepository
{
    public BlockRepository(IDbContextProvider<ReservationsDbContext> dbContextProvider)
        : base(dbContextProvider) { }
}
```

### AppService (Application.Contracts + Application)

```csharp
public interface IBlockAppService : IApplicationService
{
    Task<BlockDto> CreateAsync(CreateBlockDto input);
    Task<PagedResultDto<BlockDto>> GetListAsync(int hotelId, PagedInput input);
}
```

### DTO

```csharp
public class BookingTypeDto : AuditedEntityDto<int>
{
    public string Name { get; set; }
    public string FName { get; set; }
    public string Code { get; set; }
}
```

### AutoMapper Profile

```csharp
CreateMap<Reservation, ReservationDto>();
CreateMap<Block, BlockDto>()
    .ForMember(d => d.Revenue, opt => opt.Ignore());
```

---

## 9. دمج DbContext في المضيف

في ABP Modular، كل وحدة تعرّف `IReservationsDbContext` والمضيف يدمجه:

```csharp
[ReplaceDbContext(typeof(IReservationsDbContext))]
public class OtelPremioDbContext : AbpDbContext, IReservationsDbContext, ...
{
    public DbSet<Reservation> Reservations { get; set; }
    public DbSet<Block> Blocks { get; set; }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        builder.ConfigureReservations();  // من وحدة الحجوزات
        builder.ConfigureRoomsManagement();
        // ...
    }
}
```

هذا يسمح بـ **JOIN** بين كيانات وحدات مختلفة في استعلام واحد.

---

## 10. مقارنة مع مضياف العرب (Modiaf.Al.Arab.Hotel)

| الجانب | UltimateOtelPremio | Modiaf.Al.Arab.Hotel |
|--------|-------------------|----------------------|
| النمط | Modular Monolith كامل | انتقال تدريجي (بدأ بـ Reservations) |
| عدد الوحدات | 14+ وحدة | 1 وحدة + monolith |
| AuthServer | منفصل | داخل HttpApi.Host |
| Multi-tenancy | SaaS module + hotelId | غير مفعّل بعد |
| Angular | مكتبات لكل module | مجلدات feature في `app/` |

### خريطة الربط

| UltimateOtelPremio | مضياف العرب (Angular) | حالة التطبيق |
|--------------------|------------------------|--------------|
| Reservatios | `bookings/` | ✅ وحدة ABP |
| FrontDesk | `front-desk/` | ⏳ monolith |
| RoomsManagement | `rooms/` | ⏳ monolith |
| HouseKeeping | `housekeeping/` | ⏳ واجهة فقط |
| NightAudit | `night-auditor/` | ⏳ واجهة فقط |
| RevenueManagement | `cashier/`, `accounts/` | ⏳ واجهة فقط |
| ProfileManagement | `crm/` | ⏳ جزئي |
| BackOffice | `settings/`, `reports/` | ⏳ monolith |

---

## 11. خطوات البناء عند إضافة ميزة جديدة

1. **Domain** — تعريف Entity + `IRepository`
2. **Application.Contracts** — DTO + `IAppService`
3. **Application** — تنفيذ AppService + AutoMapper
4. **EntityFrameworkCore** — Repository + Configuration
5. **HttpApi** — Controller (أو الاعتماد على Conventional API)
6. **Host** — `DependsOn` للوحدة + `ReplaceDbContext`
7. **Angular** — Service + Component يستدعي `/api/app/...`
8. **DbMigrator** — Migration جديد

---

## 12. نقاط API (ABP Convention)

ABP ينشئ REST تلقائياً من App Services:

| الخدمة | المسار التقريبي |
|--------|-----------------|
| Block | `/api/app/block` |
| BookingType | `/api/app/booking-type` |
| Reservation | `/api/app/reservation` |

الصيغة العامة: `GET/POST/PUT/DELETE` → `/api/app/{kebab-case-service}/{action}`

---

## 13. ملاحظات للمطور

- **hotelId** يُمرَّر عبر Middleware في كل طلب — أساس Multi-hotel
- **Permissions** معرّفة في `Application.Contracts/Permissions/`
- **Etos** (Event Transfer Objects) للتواصل بين الوحدات عبر Domain Events
- **Handlers** في Application لمعالجة الأحداث
- **AiAssistant** مجلد موجود في بعض الوحدات — تكامل ذكاء اصطناعي
- **intercepters** في EF Core — اعتراض استعلامات (فلترة حسب الفندق)

---

## 14. التشغيل (مرجعي)

```bash
# ترحيل قاعدة البيانات
cd host/Ultimate.OtelPremio.DbMigrator
dotnet run

# API
cd host/Ultimate.OtelPremio.HttpApi.Host
dotnet run

# Angular (حسب إعداد المشروع)
cd angular
yarn start
```

---

*نهاية الملخص — UltimateOtelPremio — هيكلية ABP Modular لأنظمة الفنادق*
*يُستخدم كمرجع لبناء Modiaf.Al.Arab.Hotel*
