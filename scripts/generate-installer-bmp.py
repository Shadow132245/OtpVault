from PIL import Image, ImageDraw, ImageFont
import os

script_dir = os.path.dirname(os.path.abspath(__file__))
wix_dir = os.path.join(script_dir, '..', 'installer', 'wix')
os.makedirs(wix_dir, exist_ok=True)

def hex_rgb(h):
    h = h.lstrip('#')
    return tuple(int(h[i:i+2], 16) for i in (0, 2, 4))

def lerp(c1, c2, t):
    return tuple(int(c1[i] + (c2[i] - c1[i]) * t) for i in range(3))

def rounded_rect(draw, xy, r, fill=None):
    x1, y1, x2, y2 = xy
    draw.pieslice([x1, y1, x1+r*2, y1+r*2], 180, 270, fill=fill)
    draw.pieslice([x2-r*2, y1, x2, y1+r*2], 270, 360, fill=fill)
    draw.pieslice([x1, y2-r*2, x1+r*2, y2], 90, 180, fill=fill)
    draw.pieslice([x2-r*2, y2-r*2, x2, y2], 0, 90, fill=fill)
    draw.rectangle([x1+r, y1, x2-r-1, y2], fill=fill)
    draw.rectangle([x1, y1+r, x2-1, y2-r], fill=fill)

def get_font(size, bold=False):
    path = "C:/Windows/Fonts/segoeuib.ttf" if bold else "C:/Windows/Fonts/segoeui.ttf"
    return ImageFont.truetype(path, size)

# ─── BANNER: 493×58 ────────────────────────────────────────────────
def create_banner():
    w, h = 493, 58
    img = Image.new('RGB', (w, h))
    draw = ImageDraw.Draw(img)

    c1, c2 = hex_rgb('#6366f1'), hex_rgb('#4338ca')
    for x in range(w):
        t = x / max(w-1, 1)
        draw.line([(x, 0), (x, h-1)], fill=lerp(c1, c2, t))

    # OV badge right side
    rounded_rect(draw, [385, 8, 445, 50], 12, fill=hex_rgb('#818cf8'))
    draw.text((392, 14), "OV", fill="white", font=get_font(20, bold=True))

    # Version badge
    rounded_rect(draw, [452, 18, 488, 40], 10, fill=lerp(c2, (255,255,255), 0.1))
    draw.text((456, 23), "v0.1", fill=lerp(c2, (255,255,255), 0.7), font=get_font(10, bold=True))

    # Bottom accent
    draw.rectangle([0, h-4, w-1, h-1], fill=hex_rgb('#818cf8'))

    img.save(os.path.join(wix_dir, 'banner.bmp'))
    print(f"  banner.bmp ({w}x{h})")

# ─── DIALOG: 493×312 ──────────────────────────────────────────────
def create_dialog():
    w, h = 493, 312
    img = Image.new('RGB', (w, h))
    draw = ImageDraw.Draw(img)

    white = hex_rgb('#ffffff')
    light_bg = hex_rgb('#f8fafc')
    indigo = hex_rgb('#6366f1')

    # Pure white background (any wizard text anywhere will be readable)
    for x in range(w):
        draw.line([(x, 0), (x, h-1)], fill=white)

    # Top accent line
    for x in range(w):
        t = x / max(w-1, 1)
        col = lerp(hex_rgb('#818cf8'), indigo, t)
        draw.line([(x, 0), (x, 3)], fill=col)

    # OV logo on the FAR LEFT, vertically centered
    logo_size = 70
    lx, ly = 25, (h - logo_size) // 2
    rounded_rect(draw, [lx, ly, lx+logo_size, ly+logo_size], 16, fill=indigo)
    draw.text((lx+12, ly+12), "OV", fill="white", font=get_font(32, bold=True))

    # Thin vertical accent line next to logo
    vx = lx + logo_size + 30
    for y in range(80, h - 80):
        t = (y - 80) / (h - 160)
        col = lerp(hex_rgb('#e0e7ff'), hex_rgb('#6366f1'), t * 0.5)
        draw.line([(vx, y), (vx, y)], fill=col)
        draw.line([(vx+1, y), (vx+1, y)], fill=col)

    # Elegant subtle bottom line
    draw.rectangle([40, h-25, w-40, h-24], fill=hex_rgb('#e0e7ff'))

    img.save(os.path.join(wix_dir, 'dialog.bmp'))
    print(f"  dialog.bmp ({w}x{h})")

create_banner()
create_dialog()
print("Done!")
