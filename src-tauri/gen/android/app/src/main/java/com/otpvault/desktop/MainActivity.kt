package com.otpvault.desktop

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
