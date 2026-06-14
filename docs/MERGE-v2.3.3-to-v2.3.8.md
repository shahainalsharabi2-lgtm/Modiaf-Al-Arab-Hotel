# دمج التحديثات من v2.3.3 → v2.3.8

*تاريخ الدمج: يونيو 2026*

## ما تم

1. **نسخ التحديثات** من المشروع المرفوع (v2.3.3) إلى v2.3.8 مع الإبقاء على:
   - `angular/yarn.lock` (مدير الحزم المحلي)
   - `DbMigrator/appsettings.secrets.json` (أسرارك المحلية)
   - **سلسلة Migrations SQL Server** الأصلية لـ v2.3.8

2. **إضافة ملفات جديدة** من v2.3.3:
   - مكوّنات العربية (arabic-locale-pick, arabic-category-grid, …)
   - خدمات (arabic-preference-category, preference-category-currency, …)
   - أدوات النشر (render.yaml, worker.ts, wrangler.toml, Dockerfile, …)
   - مستندات PDF في `docs/`
   - دعم PostgreSQL في EF (اختياري عبر `Database:Provider`)

3. **قاعدة البيانات المحلية (SQL Server):**
   - `Database:Provider` = **SqlServer** في DbMigrator و HttpApi.Host
   - migration جديد: `Add_GeneralCodeExtendedFields` (حقول فئة العربية + أسرّة room-classes)
   - ترحيلات PostgreSQL في `Migrations/PostgreSql/` (للنشر فقط — غير مُجمَّعة)
   - أرشيف SQL القديم في `Migrations/LegacySqlServer/`

## خطوات بعد الدمج

### Backend (محلي)

```powershell
cd aspnet-core\src\Modiaf.Al.Arab.Hotel.DbMigrator
dotnet run
```

```powershell
cd aspnet-core\src\Modiaf.Al.Arab.Hotel.HttpApi.Host
dotnet run
```

### Frontend (محلي)

المشروع بعد الدمج يستخدم **npm** (مثل v2.3.3) — لا تستخدم `yarn start`.

```powershell
cd angular
npm install
npm start
```

> إذا ظهر خطأ `packageManager` مع Yarn: استخدم `npm start` بدلاً من `yarn start`.

### نشر الإنتاج (PostgreSQL)

في Render / `appsettings.Production.json`:

```json
"Database": { "Provider": "PostgreSql" }
```

ثم استخدم ترحيلات `Migrations/PostgreSql/` أو شغّل DbMigrator على Render.

## ملاحظات

- **85%+** من الملفات المشتركة طُبّقت من v2.3.3.
- مجلد `ui-translations/ui-translations/` في v2.3.8 (إن وُجد) لم يُحذف — الترجمات النشطة في `ui-translations/*.json` من v2.3.3.
- للنسخ الاحتياطي قبل التحديث: زر «إنشاء نسخة» في لوحة DB.
