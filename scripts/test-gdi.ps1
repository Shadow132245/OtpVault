Add-Type -AssemblyName System.Drawing

$bmp = New-Object System.Drawing.Bitmap(200, 100)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit

# Fill with indigo
$g.Clear([System.Drawing.Color]::FromArgb(255,99,102,241))

# Draw "TEST" in white
$font = New-Object System.Drawing.Font('Segoe UI', 24, [System.Drawing.FontStyle]::Bold)
$white = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
$g.DrawString('TEST OV', $font, $white, 20, 30)

$bmp.Save("$PSScriptRoot\..\test-gdi.bmp", [System.Drawing.Imaging.ImageFormat]::Bmp)
$g.Dispose()
$bmp.Dispose()
Write-Host "Created test-gdi.bmp"

# Now open it
Start-Process mspaint "$PSScriptRoot\..\test-gdi.bmp"
