import sys
import os
import glob

def patch_android(android_dir):
    manifest_path = os.path.join(android_dir, "app/src/main/AndroidManifest.xml")
    if not os.path.exists(manifest_path):
        print(f"WARNING: {manifest_path} not found")
        return

    with open(manifest_path, "r") as f:
        content = f.read()

    if "android:theme" not in content:
        print("WARNING: No theme found in manifest")
        return

    import re
    theme_match = re.search(r'android:theme="([^"]+)"', content)
    if theme_match:
        old_theme = theme_match.group(1)
        print(f"Found theme: {old_theme}")
    
    styles_dir = os.path.join(android_dir, "app/src/main/res/values")
    os.makedirs(styles_dir, exist_ok=True)
    styles_path = os.path.join(styles_dir, "styles.xml")

    fullscreen_theme = '''<?xml version="1.0" encoding="utf-8"?>
<resources>
    <style name="Theme.OtpVault.Fullscreen" parent="@android:style/Theme.DeviceDefault.NoActionBar">
        <item name="android:windowFullscreen">true</item>
        <item name="android:windowNoTitle">true</item>
        <item name="android:windowActionBar">false</item>
        <item name="android:statusBarColor">@android:color/transparent</item>
        <item name="android:navigationBarColor">@android:color/transparent</item>
        <item name="android:windowLayoutInDisplayCutoutMode">shortEdges</item>
    </style>
</resources>'''

    with open(styles_path, "w") as f:
        f.write(fullscreen_theme)
    print(f"Wrote {styles_path}")

    theme_match = re.search(r'android:theme="([^"]+)"', content)
    if theme_match:
        old_theme = theme_match.group(1)
        content = content.replace(
            f'android:theme="{old_theme}"',
            'android:theme="@style/Theme.OtpVault.Fullscreen"'
        )
        with open(manifest_path, "w") as f:
            f.write(content)
        print(f"Patched manifest theme to Theme.OtpVault.Fullscreen")

    kotlin_pattern = os.path.join(android_dir, "app/src/main/java/**/*.kt")
    java_pattern = os.path.join(android_dir, "app/src/main/java/**/*.MainActivity.java")
    kt_files = glob.glob(kotlin_pattern, recursive=True)
    
    main_activity = None
    for f in kt_files:
        if "MainActivity" in f:
            main_activity = f
            break

    if main_activity:
        with open(main_activity, "r") as f:
            code = f.read()

        if "enableEdgeToEdge" not in code and "SYSTEM_UI_FLAG" not in code:
            if "setContentView" in code:
                flags = """
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.R) {
            window.insetsController?.let {
                it.hide(android.view.WindowInsets.Type.statusBars() or android.view.WindowInsets.Type.navigationBars())
                it.systemBarsBehavior = android.view.WindowInsetsController.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
            }
        } else {
            @Suppress("DEPRECATION")
            window.decorView.systemUiVisibility = (
                android.view.View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                or android.view.View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                or android.view.View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                or android.view.View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                or android.view.View.SYSTEM_UI_FLAG_FULLSCREEN
                or android.view.View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
            )
        }"""
                code = code.replace("setContentView", flags + "\n        setContentView", 1)
                with open(main_activity, "w") as f:
                    f.write(code)
                print(f"Patched {main_activity} with immersive mode")
            else:
                print(f"WARNING: setContentView not found in {main_activity}")
        else:
            print("Immersive mode already applied to MainActivity")
    else:
        print("WARNING: MainActivity.kt not found, skipping immersive mode patch")

if __name__ == "__main__":
    android_dir = sys.argv[1]
    patch_android(android_dir)
