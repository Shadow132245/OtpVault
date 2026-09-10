package com.otpvault.desktop;

import android.hardware.biometrics.BiometricPrompt;

/**
 * Receives results from the platform BiometricPrompt and stores them in
 * static fields. The Rust layer polls {@link #poll()} from a JNI-attached
 * thread, so no runtime native-method registration is required.
 */
public final class BiometricCallback extends BiometricPrompt.AuthenticationCallback {

  private static volatile boolean hasResult;
  private static volatile int lastErrorCode;

  private static void onDone(int errorCode) {
    lastErrorCode = errorCode;
    hasResult = true;
  }

  @Override
  public void onAuthenticationError(int errorCode, CharSequence errString) {
    onDone(errorCode);
  }

  @Override
  public void onAuthenticationFailed() {
    // Wrong finger detected; the prompt stays open, so do nothing.
  }

  @Override
  public void onAuthenticationSucceeded(BiometricPrompt.AuthenticationResult result) {
    onDone(0);
  }

  /**
   * Returns the pending result and clears it, or -2 if there is none yet.
   * Error code 0 means success.
   */
  public static int poll() {
    if (!hasResult) {
      return -2;
    }
    hasResult = false;
    return lastErrorCode;
  }
}