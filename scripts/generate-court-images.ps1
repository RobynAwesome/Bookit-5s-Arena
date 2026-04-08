Add-Type -AssemblyName System.Drawing

$outputDir = Join-Path $PSScriptRoot "..\public\images\courts"
New-Item -ItemType Directory -Force -Path $outputDir | Out-Null

$jpegCodec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() |
  Where-Object { $_.MimeType -eq "image/jpeg" }
$encoder = [System.Drawing.Imaging.Encoder]::Quality

$variants = @(
  @{
    File = "court-1.jpg"
    SkyTop = "#8ed1ff"
    SkyBottom = "#dff7ff"
    SunColor = "#fff3b0"
    GlowColor = "#fff7d6"
    Ridge = "#4d6f63"
    RidgeFar = "#7da195"
    TurfA = "#2a8c3f"
    TurfB = "#35a84a"
    Fence = "#35544d"
    Accent = "#16a34a"
    Boards = "#f5f7fa"
    Mood = "Sunrise"
  },
  @{
    File = "court-2.jpg"
    SkyTop = "#67b8ff"
    SkyBottom = "#e6f9ff"
    SunColor = "#fff6c2"
    GlowColor = "#eefbff"
    Ridge = "#49645d"
    RidgeFar = "#83a69d"
    TurfA = "#2c9341"
    TurfB = "#39ad50"
    Fence = "#3e5d56"
    Accent = "#0f766e"
    Boards = "#ffffff"
    Mood = "Midday"
  },
  @{
    File = "court-3.jpg"
    SkyTop = "#6a7bd7"
    SkyBottom = "#f8c78f"
    SunColor = "#ffd58a"
    GlowColor = "#ffedd0"
    Ridge = "#4f4c66"
    RidgeFar = "#867792"
    TurfA = "#2e8746"
    TurfB = "#38a958"
    Fence = "#534f63"
    Accent = "#ea580c"
    Boards = "#fff7ed"
    Mood = "GoldenHour"
  },
  @{
    File = "court-4.jpg"
    SkyTop = "#0f1b38"
    SkyBottom = "#2a4067"
    SunColor = "#dbeafe"
    GlowColor = "#93c5fd"
    Ridge = "#1f2937"
    RidgeFar = "#334155"
    TurfA = "#256b39"
    TurfB = "#2f8d48"
    Fence = "#64748b"
    Accent = "#22c55e"
    Boards = "#e2e8f0"
    Mood = "Floodlights"
  }
)

function New-Brush([string]$hex) {
  return New-Object System.Drawing.SolidBrush ([System.Drawing.ColorTranslator]::FromHtml($hex))
}

function New-Pen([string]$hex, [float]$width) {
  return New-Object System.Drawing.Pen ([System.Drawing.ColorTranslator]::FromHtml($hex)), $width
}

foreach ($variant in $variants) {
  $bitmap = New-Object System.Drawing.Bitmap 1600, 900
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

  $rect = New-Object System.Drawing.Rectangle 0, 0, 1600, 900
  $skyBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    $rect,
    [System.Drawing.ColorTranslator]::FromHtml($variant.SkyTop),
    [System.Drawing.ColorTranslator]::FromHtml($variant.SkyBottom),
    90
  )
  $graphics.FillRectangle($skyBrush, $rect)

  $sunGlow = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(85, [System.Drawing.ColorTranslator]::FromHtml($variant.GlowColor)))
  $sunBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.ColorTranslator]::FromHtml($variant.SunColor))
  if ($variant.Mood -eq "Floodlights") {
    $graphics.FillEllipse($sunGlow, 1100, 90, 180, 180)
    $graphics.FillEllipse($sunBrush, 1160, 130, 60, 60)
  } else {
    $graphics.FillEllipse($sunGlow, 1150, 70, 260, 260)
    $graphics.FillEllipse($sunBrush, 1225, 145, 110, 110)
  }

  $cloudBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(40, [System.Drawing.Color]::White))
  foreach ($cloud in @(
      @{ X = 160; Y = 120; W = 240; H = 70 },
      @{ X = 520; Y = 160; W = 180; H = 55 },
      @{ X = 860; Y = 120; W = 220; H = 60 }
    )) {
    $graphics.FillEllipse($cloudBrush, $cloud.X, $cloud.Y, $cloud.W, $cloud.H)
    $graphics.FillEllipse($cloudBrush, $cloud.X + 40, $cloud.Y - 20, $cloud.W * 0.55, $cloud.H)
  }

  $ridgeFarPoints = @(
    (New-Object System.Drawing.Point 0, 360),
    (New-Object System.Drawing.Point 180, 310),
    (New-Object System.Drawing.Point 360, 330),
    (New-Object System.Drawing.Point 520, 275),
    (New-Object System.Drawing.Point 680, 315),
    (New-Object System.Drawing.Point 860, 245),
    (New-Object System.Drawing.Point 1040, 300),
    (New-Object System.Drawing.Point 1210, 250),
    (New-Object System.Drawing.Point 1390, 310),
    (New-Object System.Drawing.Point 1600, 280),
    (New-Object System.Drawing.Point 1600, 520),
    (New-Object System.Drawing.Point 0, 520)
  )
  $ridgeNearPoints = @(
    (New-Object System.Drawing.Point 0, 450),
    (New-Object System.Drawing.Point 120, 410),
    (New-Object System.Drawing.Point 320, 430),
    (New-Object System.Drawing.Point 520, 360),
    (New-Object System.Drawing.Point 710, 410),
    (New-Object System.Drawing.Point 930, 335),
    (New-Object System.Drawing.Point 1100, 390),
    (New-Object System.Drawing.Point 1330, 350),
    (New-Object System.Drawing.Point 1600, 420),
    (New-Object System.Drawing.Point 1600, 560),
    (New-Object System.Drawing.Point 0, 560)
  )
  $graphics.FillPolygon((New-Brush $variant.RidgeFar), $ridgeFarPoints)
  $graphics.FillPolygon((New-Brush $variant.Ridge), $ridgeNearPoints)

  $clubhouseBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(170, 26, 32, 44))
  $graphics.FillRectangle($clubhouseBrush, 110, 420, 210, 80)
  $graphics.FillRectangle($clubhouseBrush, 960, 395, 270, 95)
  $roofPen = New-Pen $variant.Accent 5
  $graphics.DrawLine($roofPen, 110, 420, 215, 382)
  $graphics.DrawLine($roofPen, 215, 382, 320, 420)
  $graphics.DrawLine($roofPen, 960, 395, 1095, 352)
  $graphics.DrawLine($roofPen, 1095, 352, 1230, 395)

  $turfRect = New-Object System.Drawing.Rectangle 0, 430, 1600, 470
  $turfBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    $turfRect,
    [System.Drawing.ColorTranslator]::FromHtml($variant.TurfA),
    [System.Drawing.ColorTranslator]::FromHtml($variant.TurfB),
    90
  )
  $graphics.FillRectangle($turfBrush, $turfRect)

  for ($i = 0; $i -lt 10; $i++) {
    $stripeBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(28, 255, 255, 255))
    $graphics.FillRectangle($stripeBrush, 0, 430 + ($i * 47), 1600, 23)
  }

  $courtLeft = 170
  $courtTop = 485
  $courtWidth = 1260
  $courtHeight = 310
  $courtBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(160, 20, 120, 48))
  $graphics.FillRectangle($courtBrush, $courtLeft, $courtTop, $courtWidth, $courtHeight)

  $courtStripeBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(26, 255, 255, 255))
  for ($i = 0; $i -lt 12; $i++) {
    $graphics.FillRectangle($courtStripeBrush, $courtLeft, $courtTop + ($i * 26), $courtWidth, 12)
  }

  $linePen = New-Pen "#f8fafc" 6
  $graphics.DrawRectangle($linePen, $courtLeft, $courtTop, $courtWidth, $courtHeight)
  $graphics.DrawLine($linePen, 800, $courtTop, 800, $courtTop + $courtHeight)
  $graphics.DrawEllipse($linePen, 700, 575, 200, 130)
  $graphics.DrawRectangle($linePen, 170, 565, 170, 150)
  $graphics.DrawRectangle($linePen, 1260, 565, 170, 150)

  $goalPen = New-Pen "#e2e8f0" 5
  $graphics.DrawRectangle($goalPen, 120, 580, 48, 118)
  $graphics.DrawRectangle($goalPen, 1432, 580, 48, 118)

  $netPen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(90, [System.Drawing.ColorTranslator]::FromHtml($variant.Fence))), 2
  for ($x = 170; $x -le 1430; $x += 36) {
    $graphics.DrawLine($netPen, $x, 455, $x, 805)
  }
  for ($y = 455; $y -le 805; $y += 26) {
    $graphics.DrawLine($netPen, 170, $y, 1430, $y)
  }

  $postPen = New-Pen "#d1d5db" 5
  foreach ($postX in @(170, 430, 690, 950, 1210, 1430)) {
    $graphics.DrawLine($postPen, $postX, 425, $postX, 815)
  }

  $lightPolePen = New-Pen "#94a3b8" 8
  foreach ($pole in @(
      @{ X = 120; Y = 320 },
      @{ X = 1480; Y = 300 }
    )) {
    $graphics.DrawLine($lightPolePen, $pole.X, $pole.Y, $pole.X, 575)
    $graphics.DrawLine($lightPolePen, $pole.X - 26, $pole.Y + 10, $pole.X + 26, $pole.Y + 10)
    for ($i = -1; $i -le 1; $i++) {
      $graphics.FillRectangle((New-Brush "#f8fafc"), $pole.X + ($i * 16) - 6, $pole.Y - 8, 12, 18)
    }
    if ($variant.Mood -eq "Floodlights") {
      $lightGlow = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(35, 255, 255, 235))
      $graphics.FillEllipse($lightGlow, $pole.X - 100, $pole.Y - 20, 200, 140)
    }
  }

  $pathBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(160, 84, 72, 55))
  $pathPoints = @(
    (New-Object System.Drawing.Point 0, 760),
    (New-Object System.Drawing.Point 220, 720),
    (New-Object System.Drawing.Point 340, 900),
    (New-Object System.Drawing.Point 0, 900)
  )
  $graphics.FillPolygon($pathBrush, $pathPoints)

  $accentBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(150, [System.Drawing.ColorTranslator]::FromHtml($variant.Accent)))
  $graphics.FillRectangle($accentBrush, 220, 602, 18, 84)
  $graphics.FillRectangle($accentBrush, 1362, 602, 18, 84)

  $titleFont = New-Object System.Drawing.Font("Segoe UI", 20, [System.Drawing.FontStyle]::Bold)
  $subtitleFont = New-Object System.Drawing.Font("Segoe UI", 12, [System.Drawing.FontStyle]::Regular)
  $textBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(190, 255, 255, 255))
  $graphics.DrawString("5S ARENA COURT VIEW", $titleFont, $textBrush, 84, 72)
  $graphics.DrawString("Original generated artwork inspired by the Milnerton / Hellenic outdoor setting", $subtitleFont, $textBrush, 88, 104)

  $destination = Join-Path $outputDir $variant.File
  $qualityEncoder = New-Object System.Drawing.Imaging.EncoderParameters 1
  $qualityEncoder.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter($encoder, 92L)
  $bitmap.Save($destination, $jpegCodec, $qualityEncoder)

  $graphics.Dispose()
  $bitmap.Dispose()
  $skyBrush.Dispose()
  $sunGlow.Dispose()
  $sunBrush.Dispose()
  $cloudBrush.Dispose()
  $clubhouseBrush.Dispose()
  $roofPen.Dispose()
  $turfBrush.Dispose()
  $courtBrush.Dispose()
  $courtStripeBrush.Dispose()
  $linePen.Dispose()
  $goalPen.Dispose()
  $netPen.Dispose()
  $postPen.Dispose()
  $lightPolePen.Dispose()
  $pathBrush.Dispose()
  $accentBrush.Dispose()
  $titleFont.Dispose()
  $subtitleFont.Dispose()
  $textBrush.Dispose()
  $qualityEncoder.Dispose()
}
