import os
from PIL import Image

script_dir = os.path.dirname(os.path.abspath(__file__))
wix_dir = os.path.join(script_dir, '..', 'installer', 'wix')

# Verify and create previews
for name in ['banner', 'dialog']:
    img = Image.open(os.path.join(wix_dir, f'{name}.bmp'))
    img.save(os.path.join(wix_dir, f'{name}-preview.png'))
    
    # Count white pixel clusters (text)
    white_pixels = 0
    for y in range(img.height):
        for x in range(img.width):
            if img.getpixel((x, y)) == (255, 255, 255):
                white_pixels += 1
    total = img.width * img.height
    print(f'{name}: {white_pixels} white pixels / {total} total ({white_pixels*100//total}%)')

    # Count unique colors
    colors = set()
    for x in range(0, img.width, 5):
        for y in range(0, img.height, 5):
            colors.add(img.getpixel((x, y)))
    print(f'  Unique colors (sampled): {len(colors)}')

# Banner specific
banner = Image.open(os.path.join(wix_dir, 'banner.bmp'))
print(f'\nBanner OV badge area (375-445, 8-50):')
for y in range(8, 50):
    white = sum(1 for x in range(375, 445) if banner.getpixel((x, y)) == (255, 255, 255))
    if white > 0:
        print(f'  y={y}: {white} white pixels')

# Dialog specific  
dialog = Image.open(os.path.join(wix_dir, 'dialog.bmp'))
print(f'\nDialog OV logo area (265-375, 85-195):')
for y in range(85, 195):
    white = sum(1 for x in range(265, 375) if dialog.getpixel((x, y)) == (255, 255, 255))
    if white > 3:
        print(f'  y={y}: {white} white pixels')

print(f'\nDialog OtpVault text area (250-380, 205-215):')
for y in range(200, 220):
    white = sum(1 for x in range(250, 380) if dialog.getpixel((x, y)) == (255, 255, 255))
    if white > 0:
        print(f'  y={y}: {white} white pixels')
