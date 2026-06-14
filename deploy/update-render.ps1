# Requires: Render API key from https://dashboard.render.com/u/settings#api-keys
# Usage:  $env:RENDER_API_KEY = "rnd_..." ; .\deploy\update-render.ps1

$ErrorActionPreference = "Stop"

if (-not $env:RENDER_API_KEY) {
    Write-Host "Set RENDER_API_KEY first (Render Dashboard -> Account Settings -> API Keys)" -ForegroundColor Red
    exit 1
}

$repoRoot = Split-Path $PSScriptRoot -Parent
$neonPath = Join-Path $repoRoot "deploy\neon.connection.json"
$neon = Get-Content $neonPath -Raw | ConvertFrom-Json

$headers = @{
    Authorization = "Bearer $($env:RENDER_API_KEY)"
    Accept        = "application/json"
    "Content-Type" = "application/json"
}

$apiBase = "https://api.render.com/v1"
$serviceName = "hotel-api"
$apiUrl = "https://hotel-api-fo0z.onrender.com"
$clientUrl = "https://hotel-management.shahainalsharabi2.workers.dev"

Write-Host "Fetching Render services..."
$services = Invoke-RestMethod -Uri "$apiBase/services?limit=50" -Headers $headers
$service = $services | ForEach-Object { $_.service } | Where-Object { $_.name -eq $serviceName -or $_.serviceDetails.url -like "*hotel-api*" } | Select-Object -First 1

if (-not $service) {
    Write-Host "Service not found. Available:" -ForegroundColor Yellow
    $services | ForEach-Object { $_.service } | ForEach-Object { Write-Host " - $($_.name) ($($_.id))" }
    exit 1
}

$serviceId = $service.id
Write-Host "Found service: $($service.name) ($serviceId)"

$envVars = @(
    @{ key = "ASPNETCORE_ENVIRONMENT"; value = "Production" }
    @{ key = "Database__Provider"; value = "PostgreSql" }
    @{ key = "ConnectionStrings__Default"; value = $neon.dotnetConnectionString }
    @{ key = "App__SelfUrl"; value = $apiUrl }
    @{ key = "AuthServer__Authority"; value = $apiUrl }
    @{ key = "App__ClientUrl"; value = $clientUrl }
    @{ key = "App__CorsOrigins"; value = $clientUrl }
    @{ key = "App__RedirectAllowedUrls"; value = $clientUrl }
)

Write-Host "Updating environment variables..."
foreach ($ev in $envVars) {
    $body = @{ envVar = @{ key = $ev.key; value = $ev.value } } | ConvertTo-Json -Depth 5
    try {
        Invoke-RestMethod -Method Put -Uri "$apiBase/services/$serviceId/env-vars/$($ev.key)" -Headers $headers -Body $body | Out-Null
        Write-Host "  OK $($ev.key)"
    } catch {
        $body = @{ envVar = @{ key = $ev.key; value = $ev.value } } | ConvertTo-Json -Depth 5
        Invoke-RestMethod -Method Post -Uri "$apiBase/services/$serviceId/env-vars" -Headers $headers -Body $body | Out-Null
        Write-Host "  ADD $($ev.key)"
    }
}

Write-Host "Triggering deploy..."
$deployBody = '{}' 
Invoke-RestMethod -Method Post -Uri "$apiBase/services/$serviceId/deploys" -Headers $headers -Body $deployBody | Out-Null
Write-Host "Deploy started. Check: https://dashboard.render.com/" -ForegroundColor Green
Write-Host "API URL: $apiUrl"
