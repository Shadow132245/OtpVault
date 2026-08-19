import sys
import re

manifest_path = sys.argv[1]

with open(manifest_path, "r") as f:
    content = f.read()

permissions_to_add = [
    "android.permission.CAMERA",
    "android.permission.READ_EXTERNAL_STORAGE",
    "android.permission.WRITE_EXTERNAL_STORAGE",
    "android.permission.READ_MEDIA_IMAGES",
]

for perm in permissions_to_add:
    if perm not in content:
        tag = f'<uses-permission android:name="{perm}" />'
        content = content.replace(
            "</manifest>",
            f"    {tag}\n</manifest>"
        )
        print(f"Added permission: {perm}")
    else:
        print(f"Already exists: {perm}")

if "android.hardware.camera" not in content:
    content = content.replace(
        "</manifest>",
        '    <uses-feature android:name="android.hardware.camera" android:required="false" />\n</manifest>'
    )
    print("Added uses-feature: camera")

with open(manifest_path, "w") as f:
    f.write(content)

print("AndroidManifest.xml patched successfully")
