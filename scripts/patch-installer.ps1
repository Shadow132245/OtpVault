param(
  [Parameter(Mandatory=$true)]
  [ValidateSet('x64','x86')]
  [string]$Arch
)

$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent (Split-Path -Parent $PSCommandPath)

# Determine arch-specific paths
$archSuffix = if ($Arch -eq 'x64') { 'x64' } else { 'x86' }
$rustTarget = if ($Arch -eq 'x64') { 'x86_64-pc-windows-gnu' } else { 'i686-pc-windows-gnu' }
$targetBase = Join-Path $projectRoot 'src-tauri\target'
$targetDir = Join-Path (Join-Path $targetBase $rustTarget) 'release'
if (-not (Test-Path $targetDir)) { $targetDir = Join-Path $targetBase 'release' }

$msiPath = Join-Path $targetDir "bundle\msi\OtpVault_0.1.0_$archSuffix`_en-US.msi"
if (-not (Test-Path $msiPath)) {
  # Fallback: maybe MSI is directly in target dir
  $msiPath = Join-Path $targetDir "OtpVault_0.1.0_$archSuffix`_en-US.msi"
}

$outputMsi = Join-Path $projectRoot "OtpVault_0.1.0_$archSuffix`_en-US.msi"
$bannerBmp = Join-Path $projectRoot 'installer\wix\banner.bmp'
$dialogBmp = Join-Path $projectRoot 'installer\wix\dialog.bmp'

Write-Host "Patching MSI for $Arch ..."
Write-Host "  Source: $msiPath"
Write-Host "  Output: $outputMsi"

if (-not (Test-Path $msiPath)) {
  throw "MSI not found at $msiPath"
}
if (-not (Test-Path $bannerBmp)) {
  throw "Banner BMP not found at $bannerBmp"
}
if (-not (Test-Path $dialogBmp)) {
  throw "Dialog BMP not found at $dialogBmp"
}

# Copy MSI to output location first, then patch it in place
Copy-Item -Path $msiPath -Destination $outputMsi -Force

# Patch using Windows Installer COM API (direct Binary table replacement)
$installer = New-Object -ComObject WindowsInstaller.Installer
$db = $installer.GetType().InvokeMember('OpenDatabase', 'InvokeMethod', $null, $installer, @($outputMsi, 1))

function Update-Binary {
  param([string]$Name, [string]$FilePath)
  Write-Host "  Updating '$Name' ..."
  $sql = "UPDATE `Binary` SET `Data` = ? WHERE `Name` = '$Name'"
  $view = $db.GetType().InvokeMember('OpenView', 'InvokeMethod', $null, $db, $sql)
  $record = $installer.CreateRecord(1)
  $record.GetType().InvokeMember('SetStream', 'InvokeMethod', $null, $record, @(1, $FilePath))
  $view.GetType().InvokeMember('Execute', 'InvokeMethod', $null, $view, $record)
}

Update-Binary -Name 'WixUI_Bmp_Banner' -FilePath $bannerBmp
Update-Binary -Name 'WixUI_Bmp_Dialog' -FilePath $dialogBmp

$db.GetType().InvokeMember('Commit', 'InvokeMethod', $null, $db, $null)
Write-Host "MSI branded successfully: $outputMsi"
