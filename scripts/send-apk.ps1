param(
  [Parameter(Mandatory=$true)][string]$Token,
  [Parameter(Mandatory=$true)][string]$Chat,
  [ValidateSet('debug','release')][string]$BuildType = 'debug'
)

$ErrorActionPreference = 'Stop'
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.SecurityProtocolType]::Tls12

$repoRoot = Split-Path -Parent $PSScriptRoot
$androidDir = Join-Path $repoRoot 'android'
$apkDir = Join-Path $androidDir ("app/build/outputs/apk/{0}" -f $BuildType)

# 1) Build split APKs
Push-Location $androidDir
try {
  $gradleCmd = if (Test-Path .\gradlew) { '.\gradlew' } else { 'gradlew' }
  $task = if ($BuildType -eq 'debug') { 'assembleDebug' } else { 'assembleRelease' }
  Write-Host ("[send-apk] Running {0}" -f $task)
  & $gradleCmd $task
}
finally { Pop-Location }

if(!(Test-Path $apkDir)){
  throw "APK directory not found: $apkDir"
}

# 2) Pick the smallest per-ABI APK
$apkFiles = Get-ChildItem -Path $apkDir -Filter "*-$BuildType.apk" -File | Where-Object { $_.Name -match 'arm|x86' }
if(-not $apkFiles){
  # fallback to any APK
  $apkFiles = Get-ChildItem -Path $apkDir -Filter "*.apk" -File
}
if(-not $apkFiles){
  throw "No APK files found in $apkDir"
}
# Prefer arm64-v8a, else the smallest
$preferred = $apkFiles | Where-Object { $_.Name -match 'arm64-v8a' } | Select-Object -First 1
$selected = if ($preferred) { $preferred } else { $apkFiles | Sort-Object Length | Select-Object -First 1 }

# 3) Send via existing telegram script
$telegramScript = Join-Path $PSScriptRoot 'send-telegram.ps1'
if(!(Test-Path $telegramScript)){
  throw "Helper not found: $telegramScript"
}
Write-Host ("[send-apk] Sending {0} to Telegram..." -f $selected.Name)
& $telegramScript -Token $Token -Chat $Chat -ApkPath $selected.FullName
