import sys
import os
import glob

def patch_main_activity(android_dir):
    kotlin_pattern = os.path.join(android_dir, "app/src/main/java/**/*.kt")
    kt_files = glob.glob(kotlin_pattern, recursive=True)

    main_activity = None
    for f in kt_files:
        if "MainActivity" in f:
            main_activity = f
            break

    if not main_activity:
        print("WARNING: MainActivity.kt not found")
        return

    with open(main_activity, "r") as f:
        code = f.read()

    if "systemBars" in code:
        print("Immersive mode already patched")
        return

    if "enableEdgeToEdge" not in code:
        print("WARNING: enableEdgeToEdge not found, skipping")
        return

    new_imports = "import androidx.core.view.WindowCompat\nimport androidx.core.view.WindowInsetsCompat\nimport androidx.core.view.WindowInsetsControllerCompat\n"

    code = code.replace(
        "import androidx.activity.enableEdgeToEdge",
        "import androidx.activity.enableEdgeToEdge\n" + new_imports
    )

    on_resume = """  override fun onResume() {
    super.onResume()
    try {
      val controller = WindowCompat.getInsetsController(window, window.decorView)
      controller.hide(WindowInsetsCompat.Type.systemBars())
      controller.systemBarsBehavior = WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
    } catch (_: Exception) {}
  }
"""

    full_class_end = """  }
}
"""
    full_class_end_replacement = """  }

""" + on_resume + """}
"""

    code = code.replace(full_class_end, full_class_end_replacement)

    with open(main_activity, "w") as f:
        f.write(code)
    print(f"Patched {main_activity} with immersive onResume")

    print("--- Patched file contents ---")
    with open(main_activity, "r") as f:
        print(f.read())

if __name__ == "__main__":
    android_dir = sys.argv[1]
    patch_main_activity(android_dir)
