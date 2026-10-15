Add-Type -AssemblyName System.Drawing

$imgFile = (Resolve-Path "assets/club_seal.jpg").Path
$bmp = New-Object System.Drawing.Bitmap($imgFile)
$w = $bmp.Width
$h = $bmp.Height
Write-Host "Original Image Dimensions: $w x $h"

# Find the bounding box of the non-white pixels
# White is roughly R > 240, G > 240, B > 240
$minX = $w
$maxX = 0
$minY = $h
$maxY = 0

for ($y = 0; $y -lt $h; $y++) {
    for ($x = 0; $x -lt $w; $x++) {
        $c = $bmp.GetPixel($x, $y)
        if ($c.R -lt 230 -or $c.G -lt 230 -or $c.B -lt 230) {
            if ($x -lt $minX) { $minX = $x }
            if ($x -gt $maxX) { $maxX = $x }
            if ($y -lt $minY) { $minY = $y }
            if ($y -gt $maxY) { $maxY = $y }
        }
    }
}

Write-Host "Seal Bounding Box: X=[$minX, $maxX], Y=[$minY, $maxY]"
$circleW = $maxX - $minX + 1
$circleH = $maxY - $minY + 1
Write-Host "Circle Dimensions: $circleW x $circleH"

# We want a perfectly square image with the circle centered, and transparent background outside the circle!
$size = [Math]::Max($circleW, $circleH) + 16 # small padding
$centerX = ($minX + $maxX) / 2.0
$centerY = ($minY + $maxY) / 2.0
$radius = [Math]::Max($circleW, $circleH) / 2.0 + 2.0

$squareBmp = New-Object System.Drawing.Bitmap($size, $size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$halfSize = $size / 2.0

for ($targetY = 0; $targetY -lt $size; $targetY++) {
    for ($targetX = 0; $targetX -lt $size; $targetX++) {
        $dx = $targetX - $halfSize
        $dy = $targetY - $halfSize
        $dist = [Math]::Sqrt($dx * $dx + $dy * $dy)
        
        if ($dist -le $radius) {
            # Inside the circle seal - sample from original image
            $sourceX = [int][Math]::Round($centerX + $dx)
            $sourceY = [int][Math]::Round($centerY + $dy)
            
            if ($sourceX -ge 0 -and $sourceX -lt $w -and $sourceY -ge 0 -and $sourceY -lt $h) {
                $c = $bmp.GetPixel($sourceX, $sourceY)
                $squareBmp.SetPixel($targetX, $targetY, $c)
            } else {
                $squareBmp.SetPixel($targetX, $targetY, [System.Drawing.Color]::White)
            }
        } else {
            # Outside circle: transparent
            $squareBmp.SetPixel($targetX, $targetY, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
        }
    }
}

$bmp.Dispose()
$outPath = (Resolve-Path "assets").Path + "\club_seal_perfect.png"
$squareBmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
$squareBmp.Dispose()

Write-Host "Successfully generated: $outPath with size $size x $size (Transparent Background & Square Aspect Ratio)!"
