package com.otpvault.desktop;

import android.content.DialogInterface;

/**
 * No-op listener for the BiometricPrompt negative (cancel) button, which is
 * mandatory on API 28/29 builds of the framework BiometricPrompt.
 */
public final class BiometricClick implements DialogInterface.OnClickListener {

  @Override
  public void onClick(DialogInterface dialog, int which) {
    // Cancelling is handled by the platform; nothing to do here.
  }
}