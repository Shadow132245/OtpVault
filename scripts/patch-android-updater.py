import sys
import os
import shutil

def patch_updater(android_dir):
    overlay_dir = os.path.join(
        os.path.dirname(__file__),
        "..",
        "src-tauri",
        "android-overlay",
        "java",
        "com",
        "otpvault",
        "desktop",
    )
    target_dir = os.path.join(
        android_dir,
        "app",
        "src",
        "main",
        "java",
        "com",
        "otpvault",
        "desktop",
    )
    os.makedirs(target_dir, exist_ok=True)

    for java_file in ("UpdateInstaller.java", "UpdateFileProvider.java"):
        overlay = os.path.join(overlay_dir, java_file)
        target = os.path.join(target_dir, java_file)
        shutil.copyfile(overlay, target)
        print(f"Copied {overlay} -> {target}")

    manifest = os.path.join(android_dir, "app", "src", "main", "AndroidManifest.xml")
    with open(manifest, "r", encoding="utf-8") as f:
        content = f.read()

    permission = '<uses-permission android:name="android.permission.REQUEST_INSTALL_PACKAGES" />'
    if "REQUEST_INSTALL_PACKAGES" not in content:
        content = content.replace("</manifest>", f"    {permission}\n</manifest>")
        print("Added permission: android.permission.REQUEST_INSTALL_PACKAGES")
    else:
        print("Permission already present: REQUEST_INSTALL_PACKAGES")

    provider = (
        '<provider\n'
        '        android:name="com.otpvault.desktop.UpdateFileProvider"\n'
        '        android:authorities="com.otpvault.desktop.updatefileprovider"\n'
        '        android:exported="false"\n'
        '        android:grantUriPermissions="true" />'
    )
    if "UpdateFileProvider" not in content:
        if "</application>" in content:
            content = content.replace("</application>", f"      {provider}\n    </application>")
        else:
            content = content.replace("</manifest>", f"      {provider}\n  </manifest>")
        print("Added provider: UpdateFileProvider")
    else:
        print("Provider already present: UpdateFileProvider")

    with open(manifest, "w", encoding="utf-8") as f:
        f.write(content)

    rules = os.path.join(android_dir, "app", "proguard-rules.pro")
    keep_classes = [
        "com.otpvault.desktop.UpdateInstaller",
        "com.otpvault.desktop.UpdateFileProvider",
    ]
    with open(rules, "r", encoding="utf-8") as f:
        rules_content = f.read()
    additions = []
    for klass in keep_classes:
        keep_rule = f"-keep class {klass} {{ *; }}"
        if keep_rule not in rules_content:
            additions.append(keep_rule)
    if additions:
        with open(rules, "a", encoding="utf-8") as f:
            f.write("\n# Updater classes are invoked from Rust by exact name; keep them.\n")
            f.write("\n".join(additions) + "\n")
        print("Added proguard keep rules for updater classes")
    else:
        print("Proguard keep rules already present")


if __name__ == "__main__":
    android_dir = sys.argv[1]
    patch_updater(android_dir)