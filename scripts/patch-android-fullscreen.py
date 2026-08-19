import sys
import glob
import os

def patch_main_activity(android_dir):
    pattern = os.path.join(android_dir, "app/src/main/java/**/MainActivity.kt")
    files = glob.glob(pattern, recursive=True)
    if not files:
        pattern = os.path.join(android_dir, "app/src/main/java/**/MainActivity.java")
        files = glob.glob(pattern, recursive=True)
    if not files:
        print("WARNING: MainActivity not found, skipping fullscreen patch")
        return

    main_activity = files[0]
    with open(main_activity, "r") as f:
        content = f.read()

    if "enableEdgeToEdge" in content or "SYSTEM_UI_FLAG" in content:
        print("Fullscreen patch already applied")
        return

    if main_activity.endswith(".kt"):
        imports_to_add = [
            "import android.os.Build",
            "import android.view.View",
            "import android.view.WindowInsetsController",
            "import android.view.WindowManager",
        ]
        for imp in imports_to_add:
            if imp not in content:
                content = content.replace("import android.os.Bundle", f"{imp}\nimport android.os.Bundle")

        patch = """
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            window.insetsController?.let {
                it.hide(android.view.WindowInsets.Type.statusBars() or android.view.WindowInsets.Type.navigationBars())
                it.systemBarsBehavior = WindowInsetsController.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
            }
        } else {
            @Suppress("DEPRECATION")
            window.decorView.systemUiVisibility = (
                View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                or View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                or View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                or View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                or View.SYSTEM_UI_FLAG_FULLSCREEN
                or View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
            )
        }
        window.statusBarColor = android.graphics.Color.TRANSPARENT
        window.navigationBarColor = android.graphics.Color.TRANSPARENT"""

        if "setContentView" in content:
            content = content.replace("setContentView", patch + "\n        setContentView")
        elif "onCreate" in content:
            lines = content.split("\n")
            for i, line in enumerate(lines):
                if "super.onCreate" in line:
                    lines.insert(i + 1, patch)
                    break
            content = "\n".join(lines)

    with open(main_activity, "w") as f:
        f.write(content)
    print(f"Patched {main_activity} for fullscreen")

if __name__ == "__main__":
    android_dir = sys.argv[1]
    patch_main_activity(android_dir)
