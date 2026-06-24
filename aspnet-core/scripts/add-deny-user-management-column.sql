-- إضافة عمود DenyUserManagement لجدول المستخدمين
-- قاعدة البيانات: HotelManagementDB (LocalDB)

IF COL_LENGTH('AppHotelAppUsers', 'DenyUserManagement') IS NULL
BEGIN
    ALTER TABLE AppHotelAppUsers
    ADD DenyUserManagement bit NOT NULL CONSTRAINT DF_AppHotelAppUsers_DenyUserManagement DEFAULT (1);
END
GO

IF NOT EXISTS (
    SELECT 1 FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260623120000_Add_HotelAppUser_DenyUserManagement'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260623120000_Add_HotelAppUser_DenyUserManagement', N'10.0.2');
END
GO
