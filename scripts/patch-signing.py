import sys
import re

path = sys.argv[1]

with open(path, "r") as f:
    content = f.read()

signing_block = '''    signingConfigs {
        create("release") {
            storeFile = file("otpvault.keystore")
            storePassword = "otpvault123"
            keyAlias = "otpvault"
            keyPassword = "otpvault123"
        }
    }
'''

if "signingConfigs" in content:
    print("signingConfigs already exists, skipping")
else:
    content = re.sub(
        r'(\n)([ \t]*buildTypes\s*\{)',
        r'\1' + signing_block + r'\2',
        content
    )

    content = re.sub(
        r'(getByName\("release"\)\s*\{[^}]*?isMinifyEnabled)',
        lambda m: m.group(0).replace(
            'isMinifyEnabled',
            'signingConfig = signingConfigs.getByName("release")\n            isMinifyEnabled',
            1
        ),
        content,
        count=1
    )

    with open(path, "w") as f:
        f.write(content)
    print("Patched build.gradle.kts with signing config")

with open(path, "r") as f:
    patched = f.read()

if "signingConfigs" in patched and 'signingConfig = signingConfigs.getByName("release")' in patched:
    print("Verification OK: signing config found in build.gradle.kts")
else:
    print("ERROR: signing config NOT found after patch!")
    sys.exit(1)
