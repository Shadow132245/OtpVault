Add-Type -AssemblyName System.Drawing

$w = 1200
$h = 630
$bmp = New-Object System.Drawing.Bitmap($w, $h)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = 'HighQuality'
$g.TextRenderingHint = 'AntiAliasGridFit'

# Dark background
$g.Clear([System.Drawing.Color]::FromArgb(11, 13, 26))

# Top accent gradient bar
$top = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
  (New-Object System.Drawing.Point(0, 0)), (New-Object System.Drawing.Point($w, 0)),
  [System.Drawing.Color]::FromArgb(99, 102, 241),
  [System.Drawing.Color]::FromArgb(79, 70, 229)
)
$g.FillRectangle($top, 0, 0, $w, 4)

# Shield icon (simple polygon)
$shield = New-Object System.Drawing.Drawing2D.GraphicsPath
$cx, $cy = 220, 200
$s = 50
$shield.AddPolygon(@(
  (New-Object System.Drawing.Point($cx, $cy - $s)),
  (New-Object System.Drawing.Point($cx + $s, $cy - $s * 0.4)),
  (New-Object System.Drawing.Point($cx + $s, $cy + $s * 0.3)),
  (New-Object System.Drawing.Point($cx, $cy + $s * 0.9)),
  (New-Object System.Drawing.Point($cx - $s, $cy + $s * 0.3)),
  (New-Object System.Drawing.Point($cx - $s, $cy - $s * 0.4))
))
$iconBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
  (New-Object System.Drawing.Point($cx - $s, $cy - $s)),
  (New-Object System.Drawing.Point($cx + $s, $cy + $s)),
  [System.Drawing.Color]::FromArgb(129, 140, 248),
  [System.Drawing.Color]::FromArgb(99, 102, 241)
)
$g.FillPath($iconBrush, $shield)

# Checkmark inside shield
$pen = New-Object System.Drawing.Pen([System.Drawing.Color]::White, 5)
$pen.StartCap = 'Round'
$pen.EndCap = 'Round'
$g.DrawLine($pen, $cx - 15, $cy, $cx - 4, $cy + 14)
$g.DrawLine($pen, $cx - 4, $cy + 14, $cx + 18, $cy - 10)

# Title
$fontTitle = New-Object System.Drawing.Font('Segoe UI', 52, [System.Drawing.FontStyle]::Bold)
$brushWhite = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
$g.DrawString('OtpVault', $fontTitle, $brushWhite, 280, 145)

# Subtitle
$fontSub = New-Object System.Drawing.Font('Segoe UI', 22, [System.Drawing.FontStyle]::Regular)
$brushGray = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(148, 163, 184))
$g.DrawString('Secure 2FA Authenticator', $fontSub, $brushGray, 284, 215)

# Tagline chips
$chipY = 300
$chips = @('Zero-Knowledge', 'Encrypted Cloud Backup', 'Open Source')
$chipX = 284
foreach ($chip in $chips) {
  $sz = $g.MeasureString($chip, $fontSub)
  $rx = $chipX - 12
  $ry = $chipY - 6
  $rw = $sz.Width + 24
  $rh = $sz.Height + 12
  $rcBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(30, 99, 102, 241))
  $rcPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(60, 99, 102, 241), 1)
  $g.FillRectangle($rcBrush, $rx, $ry, $rw, $rh)
  $g.DrawRectangle($rcPen, $rx, $ry, $rw, $rh)
  $g.DrawString($chip, (New-Object System.Drawing.Font('Segoe UI', 16, [System.Drawing.FontStyle]::Semibold)), (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(129, 140, 248))), $chipX, $chipY)
  $chipX += $rw + 16
}

# Bottom tagline
$fontTag = New-Object System.Drawing.Font('Segoe UI', 14, [System.Drawing.FontStyle]::Regular)
$brushTag = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(71, 85, 105))
$tagline = 'Built with Rust + Tauri  •  MIT License  •  otpvault1.vercel.app'
$tagSz = $g.MeasureString($tagline, $fontTag)
$g.DrawString($tagline, $fontTag, $brushTag, ($w - $tagSz.Width) / 2, $h - 50)

# URL at bottom-right
$urlFont = New-Object System.Drawing.Font('Segoe UI', 12, [System.Drawing.FontStyle]::Regular)
$urlBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(55, 65, 81))
$url = 'otpvault1.vercel.app'
$urlSz = $g.MeasureString($url, $urlFont)
$g.DrawString($url, $urlFont, $urlBrush, $w - $urlSz.Width - 30, $h - 30)

$bmp.Save('landing/og-image.png', [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose()
$bmp.Dispose()
Write-Host 'og-image.png generated successfully.'
