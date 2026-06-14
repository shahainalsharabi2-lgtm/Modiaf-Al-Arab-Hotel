@echo off
chcp 65001 >nul
echo فتح إعدادات Render لاستبدال المشروع...
start https://dashboard.render.com/
echo.
echo انسخ Connection String من: deploy\neon.connection.json
echo الحقل: dotnetConnectionString
echo.
powershell -NoProfile -Command "$n = Get-Content '%~dp0neon.connection.json' -Raw | ConvertFrom-Json; Set-Clipboard -Value $n.dotnetConnectionString; Write-Host 'تم نسخ Connection String إلى الحافظة!' -ForegroundColor Green"
pause
