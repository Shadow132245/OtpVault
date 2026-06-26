param(
  [Parameter(Mandatory=$true)]
  [string]$MsiPath,
  [string]$BannerBmp = "$PSScriptRoot\..\installer\wix\banner.bmp",
  [string]$DialogBmp = "$PSScriptRoot\..\installer\wix\dialog.bmp"
)

$ErrorActionPreference = 'Stop'

Write-Host "Patching MSI: $MsiPath"

# Resolve paths
$MsiPath = Resolve-Path $MsiPath
$BannerBmp = Resolve-Path $BannerBmp
$DialogBmp = Resolve-Path $DialogBmp

Write-Host "  Banner: $BannerBmp"
Write-Host "  Dialog: $DialogBmp"

# Open MSI in transaction mode (1)
$installer = New-Object -ComObject WindowsInstaller.Installer
$db = $installer.GetType().InvokeMember('OpenDatabase', 'InvokeMethod', $null, $installer, @($MsiPath, 1))

function Update-Binary {
  param([string]$Name, [string]$FilePath)
  Write-Host "  Updating '$Name' from $FilePath ..."
  $sql = "UPDATE `Binary` SET `Data` = ? WHERE `Name` = '$Name'"
  $view = $db.GetType().InvokeMember('OpenView', 'InvokeMethod', $null, $db, $sql)
  $record = $installer.CreateRecord(1)
  $record.GetType().InvokeMember('SetStream', 'InvokeMethod', $null, $record, @(1, $FilePath))
  $view.GetType().InvokeMember('Execute', 'InvokeMethod', $null, $view, $record)
  Write-Host "    OK"
}

Update-Binary -Name 'WixUI_Bmp_Banner' -FilePath $BannerBmp
Update-Binary -Name 'WixUI_Bmp_Dialog' -FilePath $DialogBmp

# Commit changes
$db.GetType().InvokeMember('Commit', 'InvokeMethod', $null, $db, $null)
Write-Host "MSI patched successfully!"
