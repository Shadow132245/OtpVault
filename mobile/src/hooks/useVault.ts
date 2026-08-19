import { useCallback } from 'react'
import { useAuthStore } from '@/stores/useAuthStore'
import * as storage from '@/services/storage'
import * as neon from '@/services/neon'
import { generateSalt, encryptVault, decryptVault } from '@/services/crypto'
import { useBiometrics } from '@/hooks/useBiometrics'

export function useVault() {
  const store = useAuthStore()
  const biometrics = useBiometrics()

  const init = useCallback(async () => {
    const exists = await storage.isInitialized()
    store.setInitialized(exists)
    if (exists) {
      const email = await storage.loadEmail()
      store.setEmail(email)
      const bioEnabled = await storage.isBiometricsEnabled()
      store.setBiometricsEnabled(bioEnabled)
      return true
    }
    return false
  }, [])

  const signUp = useCallback(async (email: string, password: string) => {
    const localEmail = await storage.loadEmail()
    if (localEmail && localEmail.toLowerCase() === email.toLowerCase()) {
      throw new Error('This email is already registered on this device. Please sign in instead.')
    }
    if (localEmail && localEmail.toLowerCase() !== email.toLowerCase()) {
      throw new Error('A different account is already set up on this device.')
    }

    const exists = await neon.checkEmailExists(email)
    if (exists) {
      throw new Error('This email is already registered. Please sign in instead.')
    }

    const salt = generateSalt()
    const emptyVault = JSON.stringify({ version: 1, accounts: [] })
    const encrypted = await encryptVault(emptyVault, password, salt)

    await storage.saveEmail(email)
    await storage.saveSalt(salt)
    await storage.saveTestPayload(encrypted.substring(0, 100))
    await storage.saveVaultType('password')
    await storage.saveVaultData(encrypted)

    store.setEmail(email)

    try {
      await neon.uploadVault(email, salt, encrypted.substring(0, 100), encrypted)
    } catch {
      // non-fatal
    }

    store.setUnlocked(true)
    store.setInitialized(true)
  }, [])

  const signIn = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      const localSalt = await storage.loadSalt()
      let salt: string
      let encryptedVault: string

      if (localSalt) {
        salt = localSalt
        encryptedVault = (await storage.loadVaultData()) || ''
      } else {
        const row = await neon.fetchVault(email)
        salt = row.salt
        encryptedVault = row.encryptedVault
        await storage.saveEmail(email)
        await storage.saveSalt(salt)
        await storage.saveTestPayload(row.testPayload)
        await storage.saveVaultData(encryptedVault)
      }

      const decrypted = await decryptVault(encryptedVault, password, salt)
      const data = JSON.parse(decrypted)
      store.setEmail(email)
      store.setAccounts(data.accounts || [])
      store.setUnlocked(true)
      store.setInitialized(true)
      return true
    } catch {
      return false
    }
  }, [])

  const unlockWithBiometrics = useCallback(async (): Promise<boolean> => {
    const bioEnabled = await storage.isBiometricsEnabled()
    if (!bioEnabled) return false

    const authed = await biometrics.authenticate()
    if (!authed) return false

    const remembered = await storage.loadRememberMe()
    if (!remembered) return false

    return signIn(remembered.email, remembered.password)
  }, [])

  const lock = useCallback(async () => store.setUnlocked(false), [])

  const signOut = useCallback(async () => {
    await storage.clearRememberMe()
    await storage.setBiometricsEnabled(false)
    store.reset()
  }, [])

  const saveRememberMe = useCallback(async (email: string, password: string) => {
    await storage.saveRememberMe(email, password)
  }, [])

  const toggleBiometrics = useCallback(async (enabled: boolean) => {
    await storage.setBiometricsEnabled(enabled)
    store.setBiometricsEnabled(enabled)
  }, [])

  return { init, signUp, signIn, unlockWithBiometrics, lock, signOut, saveRememberMe, toggleBiometrics }
}
