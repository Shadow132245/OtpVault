import sys
import os
import shutil

def patch_biometric(android_dir):
    overlay = os.path.join(
        os.path.dirname(__file__),
        "..",
        "src-tauri",
        "android-overlay",
        "java",
        "com",
        "otpvault",
        "desktop",
        "BiometricCallback.java",
    )
    target = os.path.join(
        android_dir,
        "app",
        "src",
        "main",
        "java",
        "com",
        "otpvault",
        "desktop",
        "BiometricCallback.java",
    )

    os.makedirs(os.path.dirname(target), exist_ok=True)
    shutil.copyfile(overlay, target)
    print(f"Copied {overlay} -> {target}")

    rules = os.path.join(android_dir, "app", "proguard-rules.pro")
    keep_rule = "-keep class com.otpvault.desktop.BiometricCallback { *; }"
    with open(rules, "r", encoding="utf-8") as f:
        content = f.read()

    if keep_rule not in content:
        with open(rules, "a", encoding="utf-8") as f:
            f.write("\n# The BiometricPrompt callback class and its native hook are looked up by\n")
            f.write("# their exact names from Rust at runtime; never rename or strip them.\n")
            f.write(keep_rule + "\n")
        print(f"Added proguard keep rule to {rules}")
    else:
        print("Proguard keep rule already present")

if __name__ == "__main__":
    android_dir = sys.argv[1]
    patch_biometric(android_dir)