param(
  [string]$OutputDir = "$PSScriptRoot\..\installer\wix"
)

$ErrorActionPreference = 'Stop'
New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
Add-Type -AssemblyName System.Drawing

function FillRoundedRect {
  param($g, $brush, $x, $y, $w, $h, $r)
  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $path.AddArc($x, $y, $r*2, $r*2, 180, 90) | Out-Null
  $path.AddArc($x+$w-$r*2, $y, $r*2, $r*2, 270, 90) | Out-Null
  $path.AddArc($x+$w-$r*2, $y+$h-$r*2, $r*2, $r*2, 0, 90) | Out-Null
  $path.AddArc($x, $y+$h-$r*2, $r*2, $r*2, 90, 90) | Out-Null
  $path.CloseFigure()
  $g.FillPath($brush, $path)
  $path.Dispose()
}

function New-BannerBmp {
  param([string]$Path)
  $w = 493; $h = 58

  $bmp = New-Object System.Drawing.Bitmap($w, $h)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality

  # Background gradient: #6366f1 -> #4338ca
  $bg = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    (New-Object System.Drawing.Point(0,0)), (New-Object System.Drawing.Point($w,0)),
    [System.Drawing.Color]::FromArgb(255,99,102,241),
    [System.Drawing.Color]::FromArgb(255,67,56,202))
  $g.FillRectangle($bg, 0, 0, $w, $h)

  # Subtle decorative circles (right side only)
  $dc = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(10,255,255,255))
  $g.FillEllipse($dc, 400, -20, 60, 60)
  $g.FillEllipse($dc, 440, 30, 50, 50)

  # Thin accent line at bottom
  $lineBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(25,255,255,255))
  $g.FillRectangle($lineBrush, 0, 55, $w, 3)

  # OV logo - right side where wizard won't write text
  # Wizard text is in the left ~200px area
  $lb = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    (New-Object System.Drawing.Point(380,10)), (New-Object System.Drawing.Point(420,48)),
    [System.Drawing.Color]::FromArgb(255,129,140,248),
    [System.Drawing.Color]::FromArgb(255,99,102,241))
  FillRoundedRect -g $g -brush $lb -x 390 -y 10 -w 36 -h 36 -r 9
  $font = New-Object System.Drawing.Font('Segoe UI', 14, [System.Drawing.FontStyle]::Bold)
  $white = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
  $g.DrawString('OV', $font, $white, 398, 13)

  # Version badge far right
  $vb = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(30,255,255,255))
  FillRoundedRect -g $g -brush $vb -x 440 -y 20 -w 45 -h 18 -r 9
  $fontVer = New-Object System.Drawing.Font('Segoe UI', 8)
  $verBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(178,255,255,255))
  $g.DrawString('v0.1.0', $fontVer, $verBrush, 444, 21)

  $bmp.Save($Path, [System.Drawing.Imaging.ImageFormat]::Bmp)
  $g.Dispose(); $bmp.Dispose()
  Write-Host "  Created banner.bmp (${w}x${h})"
}

function New-DialogBmp {
  param([string]$Path)
  $w = 493; $h = 312

  $bmp = New-Object System.Drawing.Bitmap($w, $h)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality

  # Split background: clean white left (for wizard text), indigo right (branding)
  $whiteBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
  $g.FillRectangle($whiteBrush, 0, 0, 220, $h)

  # Right side: subtle gradient white -> indigo
  $rightBg = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    (New-Object System.Drawing.Point(180,0)), (New-Object System.Drawing.Point($w,0)),
    [System.Drawing.Color]::FromArgb(255,248,250,252),
    [System.Drawing.Color]::FromArgb(255,238,242,255))
  $g.FillRectangle($rightBg, 180, 0, $w-180, $h)

  # Top accent line (full width)
  $accent = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    (New-Object System.Drawing.Point(0,0)), (New-Object System.Drawing.Point($w,0)),
    [System.Drawing.Color]::FromArgb(255,99,102,241),
    [System.Drawing.Color]::FromArgb(255,129,140,248))
  $g.FillRectangle($accent, 0, 0, $w, 4)

  # Large OV logo in the right/branding area
  $lb = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    (New-Object System.Drawing.Point(280,95)), (New-Object System.Drawing.Point(370,185)),
    [System.Drawing.Color]::FromArgb(255,129,140,248),
    [System.Drawing.Color]::FromArgb(255,79,70,229))
  FillRoundedRect -g $g -brush $lb -x 280 -y 95 -w 80 -h 80 -r 20

  $fontLogo = New-Object System.Drawing.Font('Segoe UI', 30, [System.Drawing.FontStyle]::Bold)
  $white = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
  $g.DrawString('OV', $fontLogo, $white, 289, 105)

  # Decorative circles in branding area
  $dc = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(15,99,102,241))
  $g.FillEllipse($dc, 260, 210, 120, 120)
  $g.FillEllipse($dc, 340, 230, 80, 80)

  # "OtpVault" text below logo (subtle, branding only)
  $fontName = New-Object System.Drawing.Font('Segoe UI', 13, [System.Drawing.FontStyle]::Bold)
  $nameBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255,79,70,229))
  $g.DrawString('OtpVault', $fontName, $nameBrush, 295, 185)

  # Tagline
  $fontTag = New-Object System.Drawing.Font('Segoe UI', 8)
  $tagBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(180,79,70,229))
  $g.DrawString('Secure 2FA Authenticator', $fontTag, $tagBrush, 293, 202)

  # Bottom dots
  $dl = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255,226,232,240))
  $da = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255,99,102,241))
  $g.FillEllipse($dl, 237, 298, 6, 6)
  $g.FillEllipse($da, 243, 298, 6, 6)
  $g.FillEllipse($dl, 250, 298, 6, 6)

  $bmp.Save($Path, [System.Drawing.Imaging.ImageFormat]::Bmp)
  $g.Dispose(); $bmp.Dispose()
  Write-Host "  Created dialog.bmp (${w}x${h})"
}

Write-Host "Generating MSI wizard-compatible bitmaps..."
New-BannerBmp -Path (Join-Path $OutputDir "banner.bmp")
New-DialogBmp -Path (Join-Path $OutputDir "dialog.bmp")
Write-Host "Done!"
