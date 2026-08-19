import * as SecureStore from 'expo-secure-store'

const KEYS = {
  SALT: 'vault_salt',
  TEST_PAYLOAD: 'vault_test',
  VAULT_TYPE: 'vault_type',
  EMAIL: 'vault_email',
  REMEMBER: 'vault_remember',
  VAULT_DATA: 'vault_data',
  BIOMETRICS_ENABLED: 'biometrics_enabled',
}

export async function saveEmail(email: string): Promise<void> {
  await SecureStore.setItemAsync(KEYS.EMAIL, email)
}

export async function loadEmail(): Promise<string | null> {
  return SecureStore.getItemAsync(KEYS.EMAIL)
}

export async function saveSalt(salt: string): Promise<void> {
  await SecureStore.setItemAsync(KEYS.SALT, salt)
}

export async function loadSalt(): Promise<string | null> {
  return SecureStore.getItemAsync(KEYS.SALT)
}

export async function saveTestPayload(payload: string): Promise<void> {
  await SecureStore.setItemAsync(KEYS.TEST_PAYLOAD, payload)
}

export async function loadTestPayload(): Promise<string | null> {
  return SecureStore.getItemAsync(KEYS.TEST_PAYLOAD)
}

export async function saveVaultType(type: string): Promise<void> {
  await SecureStore.setItemAsync(KEYS.VAULT_TYPE, type)
}

export async function isInitialized(): Promise<boolean> {
  return (await SecureStore.getItemAsync(KEYS.SALT)) !== null
}

export async function saveRememberMe(email: string, password: string): Promise<void> {
  await SecureStore.setItemAsync(KEYS.REMEMBER, JSON.stringify({ email, password }))
}

export async function loadRememberMe(): Promise<{ email: string; password: string } | null> {
  const val = await SecureStore.getItemAsync(KEYS.REMEMBER)
  if (!val) return null
  try {
    return JSON.parse(val)
  } catch {
    return null
  }
}

export async function clearRememberMe(): Promise<void> {
  await SecureStore.deleteItemAsync(KEYS.REMEMBER)
}

export async function saveVaultData(data: string): Promise<void> {
  await SecureStore.setItemAsync(KEYS.VAULT_DATA, data)
}

export async function loadVaultData(): Promise<string | null> {
  return SecureStore.getItemAsync(KEYS.VAULT_DATA)
}

export async function setBiometricsEnabled(enabled: boolean): Promise<void> {
  await SecureStore.setItemAsync(KEYS.BIOMETRICS_ENABLED, enabled ? 'true' : 'false')
}

export async function isBiometricsEnabled(): Promise<boolean> {
  return (await SecureStore.getItemAsync(KEYS.BIOMETRICS_ENABLED)) === 'true'
}

export async function clearAll(): Promise<void> {
  for (const key of Object.values(KEYS)) {
    try {
      await SecureStore.deleteItemAsync(key)
    } catch {
      // ignore
    }
  }
}
