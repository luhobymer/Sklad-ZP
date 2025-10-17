param(
  [Parameter(Mandatory=$true)][string]$Token,
  [Parameter(Mandatory=$true)][string]$Chat,
  [string]$ApkPath
)

$ErrorActionPreference = 'Stop'
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.SecurityProtocolType]::Tls12

function Send-Message {
  param([Parameter(Mandatory=$true)][string]$Text)
  $url = "https://api.telegram.org/bot$Token/sendMessage"
  $body = "chat_id=$Chat&text=" + [uri]::EscapeDataString($Text)
  Write-Host ("[telegram] sendMessage -> chat={0}" -f $Chat)
  $resp = Invoke-RestMethod -Uri $url -Method Post -ContentType 'application/x-www-form-urlencoded' -Body $body
  if(-not $resp.ok){
    Write-Error ("[telegram] sendMessage failed: {0}" -f ($resp | ConvertTo-Json -Compress))
  } else {
    Write-Host ("[telegram] sendMessage ok: message_id={0}" -f $resp.result.message_id)
  }
}

function Send-Document {
  param(
    [Parameter(Mandatory=$true)][string]$Path,
    [string]$Caption
  )
  if(!(Test-Path $Path)){
    throw "APK not found: $Path"
  }
  $url = "https://api.telegram.org/bot$Token/sendDocument"
  Write-Host ("[telegram] sendDocument -> chat={0}, file={1}" -f $Chat, (Split-Path -Leaf $Path))
  $resp = Invoke-RestMethod -Uri $url -Method Post -Form @{ chat_id=$Chat; caption=$Caption; document=(Get-Item $Path) }
  if(-not $resp.ok){
    Write-Error ("[telegram] sendDocument failed: {0}" -f ($resp | ConvertTo-Json -Compress))
  } else {
    Write-Host ("[telegram] sendDocument ok: file_name={0}, message_id={1}" -f (Split-Path -Leaf $Path), $resp.result.message_id)
  }
}

# 1) Test message
try {
  Send-Message -Text "Привіт з бота ✅"
  Write-Host "[telegram] Test message sent"
} catch {
  Write-Error ("[telegram] Test message error: {0}" -f $_.Exception.Message)
  exit 2
}

# 2) APK (optional)
if($ApkPath){
  $caption = "Sklad-ZP APK " + (Get-Date -Format 'yyyy-MM-dd HH:mm')
  try {
    Send-Document -Path $ApkPath -Caption $caption
    Write-Host "[telegram] APK sent: $ApkPath"
  } catch {
    Write-Error ("[telegram] APK send error: {0}" -f $_.Exception.Message)
    exit 3
  }
}
