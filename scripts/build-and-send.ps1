param(
  [Parameter(Mandatory=$true)][string]$Token,
  [Parameter(Mandatory=$true)][string]$Chat,
  [ValidateSet('debug','release')][string]$BuildType = 'debug'
)
$ErrorActionPreference = 'Stop'
$env:TG_BOT_TOKEN = $Token
$env:TG_CHAT_ID   = $Chat

$androidDir = Join-Path (Split-Path -Parent $PSScriptRoot) 'android'
Push-Location $androidDir
try {
  $gradle = if (Test-Path .\gradlew) { '.\gradlew' } else { 'gradlew' }
  $task = if ($BuildType -eq 'debug') { 'assembleDebug' } else { 'assembleRelease' }
  Write-Host ("[build-and-send] Starting {0} with auto Telegram send..." -f $task)
  & $gradle $task -Papk.telegram.enabled=true -Ptg.bot.token=$Token -Ptg.chat.id=$Chat -x test -x lint
}
finally { Pop-Location }
