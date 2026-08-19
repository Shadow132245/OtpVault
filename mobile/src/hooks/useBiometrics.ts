import * as LocalAuthentication from 'expo-local-authentication'

export function useBiometrics() {
  const authenticate = async (): Promise<boolean> => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync()
      if (!hasHardware) return false
      const enrolled = await LocalAuthentication.isEnrolledAsync()
      if (!enrolled) return false
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Unlock OtpVault',
        fallbackLabel: 'Use passcode',
        disableDeviceFallback: false,
      })
      return result.success
    } catch {
      return false
    }
  }

  const isAvailable = async (): Promise<boolean> => {
    try {
      const has = await LocalAuthentication.hasHardwareAsync()
      const enrolled = await LocalAuthentication.isEnrolledAsync()
      return has && enrolled
    } catch {
      return false
    }
  }

  return { authenticate, isAvailable }
}
