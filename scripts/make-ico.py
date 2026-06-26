import struct, os, glob

icons_dir = r'C:\Users\Admin\Desktop\OtpVault\src-tauri\icons'
sizes = [32, 128, 256]
files = {32: '32x32.png', 128: '128x128.png', 256: '128x128@2x.png'}

pngs = []
for s in sizes:
    path = os.path.join(icons_dir, files[s])
    with open(path, 'rb') as f:
        data = f.read()
    pngs.append((s, data))

num_images = len(pngs)
header = struct.pack('<HHH', 0, 1, num_images)

entries = b''
offset = 6 + num_images * 16
for s, data in pngs:
    w = s if s < 256 else 0
    h = s if s < 256 else 0
    entries += struct.pack('<BBBBHHII', w, h, 0, 0, 1, 32, len(data), offset)
    offset += len(data)

with open(os.path.join(icons_dir, 'icon.ico'), 'wb') as f:
    f.write(header)
    f.write(entries)
    for _, data in pngs:
        f.write(data)

print(f'Created icon.ico with {num_images} sizes: {sizes}')
