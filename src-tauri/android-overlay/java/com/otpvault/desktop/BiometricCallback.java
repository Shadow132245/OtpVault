package com.otpvault.desktop;

import android.hardware.biometrics.BiometricPrompt;

/**
 * Receives results from the platform BiometricPrompt and forwards them to the
 * Rust layer through the native `rustCallback` method registered by Rust.
 */
public final class BiometricCallback extends BiometricPrompt.AuthenticationCallback {

  private final long pointer;

  private native void rustCallback(long pointer, int errorCode, int helpCode);

  public BiometricCallback(long pointer) {
    this.pointer = pointer;
  }

  @Override
  public void onAuthenticationError(int errorCode, CharSequence errString) {
    rustCallback(pointer, errorCode, 0);
  }

  @Override
  public void onAuthenticationFailed() {
    // Wrong finger detected; the prompt stays open, so do nothing.
  }

  @Override
  public void onAuthenticationSucceeded(BiometricPrompt.AuthenticationResult result) {
    rustCallback(pointer, 0, 0);
  }
}