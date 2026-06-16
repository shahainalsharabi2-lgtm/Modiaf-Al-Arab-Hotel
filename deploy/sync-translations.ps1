# مزامنة ترجمات الواجهة قبل النشر
# Usage:
#   .\deploy\sync-translations.ps1           # Domain.Shared -> HttpApi.Host (للنشر)
#   .\deploy\sync-translations.ps1 -ToShared   # HttpApi.Host -> Domain.Shared (بعد التعديل من الواجهة)
#   .\deploy\sync-translations.ps1 -Force      # إجبار النسخ

param(
    [switch]$ToShared,
    [switch]$Force
)

$repoRoot = Split-Path -Parent $PSScriptRoot
$nodeArgs = @("tools/sync-ui-translations-for-deploy.mjs")
if ($ToShared) { $nodeArgs += "--to-shared" }
if ($Force) { $nodeArgs += "--force" }

Push-Location $repoRoot
try {
    node @nodeArgs
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}
finally {
    Pop-Location
}
