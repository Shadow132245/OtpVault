param(
  [Parameter(Mandatory=$true)]
  [string]$MsiPath,

  [string]$BannerBmp,

  [string]$DialogBmp
)

$ErrorActionPreference = 'Stop'

if (-not (Test-Path $MsiPath)) {
  throw "MSI not found at $MsiPath"
}

$projectRoot = Split-Path -Parent (Split-Path -Parent $PSCommandPath)

if (-not $BannerBmp) { $BannerBmp = Join-Path $projectRoot 'installer\wix\banner.bmp' }
if (-not $DialogBmp) { $DialogBmp = Join-Path $projectRoot 'installer\wix\dialog.bmp' }

if (-not (Test-Path $BannerBmp)) { throw "Banner BMP not found at $BannerBmp" }
if (-not (Test-Path $DialogBmp)) { throw "Dialog BMP not found at $DialogBmp" }

Write-Host "Branding MSI: $MsiPath"

$installer = New-Object -ComObject WindowsInstaller.Installer
$db = $installer.GetType().InvokeMember('OpenDatabase', 'InvokeMethod', $null, $installer, @($MsiPath, 1))

function Update-Binary {
  param([string]$Name, [string]$FilePath)
  Write-Host "  Updating '$Name' ..."
  $sql = "UPDATE `Binary` SET `Data` = ? WHERE `Name` = '$Name'"
  $view = $db.GetType().InvokeMember('OpenView', 'InvokeMethod', $null, $db, $sql)
  $record = $installer.CreateRecord(1)
  $record.GetType().InvokeMember('SetStream', 'InvokeMethod', $null, $record, @(1, $FilePath))
  $view.GetType().InvokeMember('Execute', 'InvokeMethod', $null, $view, $record)
}

Update-Binary -Name 'WixUI_Bmp_Banner' -FilePath $BannerBmp
Update-Binary -Name 'WixUI_Bmp_Dialog' -FilePath $DialogBmp

$db.GetType().InvokeMember('Commit', 'InvokeMethod', $null, $db, $null)
Write-Host "MSI branded successfully."
