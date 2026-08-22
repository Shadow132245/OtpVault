import sys
import re
import os

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

main_activity_path = sys.argv[2] if len(sys.argv) > 2 else None
if main_activity_path and os.path.exists(main_activity_path):
    with open(main_activity_path, "r") as f:
        kt_content = f.read()

    if "requestNeededPermissions" not in kt_content:
        kt_content = """package com.otpvault.desktop

import android.Manifest
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import androidx.activity.enableEdgeToEdge
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat

class MainActivity : TauriActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    enableEdgeToEdge()
    super.onCreate(savedInstanceState)
    requestNeededPermissions()
  }

  private fun requestNeededPermissions() {
    val permissions = mutableListOf(
      Manifest.permission.CAMERA,
    )

    if (Build.VERSION.SDK_INT <= Build.VERSION_CODES.S_V2) {
      permissions.add(Manifest.permission.READ_EXTERNAL_STORAGE)
      permissions.add(Manifest.permission.WRITE_EXTERNAL_STORAGE)
    }

    val notGranted = permissions.filter {
      ContextCompat.checkSelfPermission(this, it) != PackageManager.PERMISSION_GRANTED
    }

    if (notGranted.isNotEmpty()) {
      ActivityCompat.requestPermissions(this, notGranted.toTypedArray(), 1)
    }
  }
}
"""
        with open(main_activity_path, "w") as f:
            f.write(kt_content)
        print("MainActivity.kt patched with runtime permission requests")
    else:
        print("MainActivity.kt already has permission requests")
