import sys

path = sys.argv[1]

with open(path, "r") as f:
    content = f.read()

signing_block = (
    "    signingConfigs {\n"
    '        create("release") {\n'
    '            storeFile = file("otpvault.keystore")\n'
    '            storePassword = "otpvault123"\n'
    '            keyAlias = "otpvault"\n'
    '            keyPassword = "otpvault123"\n'
    "        }\n"
    "    }\n"
)

content = content.replace("    buildTypes {", signing_block + "    buildTypes {")

content = content.replace(
    'getByName("release") {\n            isMinifyEnabled',
    'getByName("release") {\n            signingConfig = signingConfigs.getByName("release")\n            isMinifyEnabled'
)

with open(path, "w") as f:
    f.write(content)

print("Patched build.gradle.kts with signing config")
