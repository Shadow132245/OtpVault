import { argon2id } from 'hash-wasm'

const SALT_SIZE = 32
const NONCE_SIZE = 12
const KEY_SIZE = 32

function randomBytes(size: number): Uint8Array {
  const arr = new Uint8Array(size)
  crypto.getRandomValues(arr)
  return arr
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')
}

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16)
  }
  return bytes
}

function base64UrlEncode(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function base64UrlDecode(str: string): Uint8Array {
  str = str.replace(/-/g, '+').replace(/_/g, '/')
  while (str.length % 4) str += '='
  return Uint8Array.from(atob(str), c => c.charCodeAt(0))
}

const VAULT_KEYS = {
  salt: 'vault_salt',
  testPayload: 'vault_test',
  vaultType: 'vault_type',
  email: 'vault_email',
  vaultData: 'vault_data',
  rememberMe: 'vault_remember',
}

function getStore() {
  return {
    set(key: string, value: string) {
      localStorage.setItem(key, value)
    },
    get(key: string): string | null {
      return localStorage.getItem(key)
    },
    delete(key: string) {
      localStorage.removeItem(key)
    },
  }
}

export async function deriveKey(password: string, salt: Uint8Array): Promise<Uint8Array> {
  const key = await argon2id({
    password,
    salt: bytesToHex(salt),
    parallelism: 1,
    iterations: 3,
    memorySize: 65536,
    hashLength: KEY_SIZE,
    outputType: 'binary',
  })
  return key
}

export async function encrypt(plaintext: Uint8Array, key: Uint8Array): Promise<string> {
  const nonce = randomBytes(NONCE_SIZE)
  const aesKey = await crypto.subtle.importKey('raw', key, { name: 'AES-GCM' }, false, ['encrypt'])
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: nonce },
    aesKey,
    plaintext
  )
  const result = new Uint8Array(nonce.length + encrypted.byteLength)
  result.set(nonce)
  result.set(new Uint8Array(encrypted), nonce.length)
  return base64UrlEncode(result)
}

export async function decrypt(encryptedB64: string, key: Uint8Array): Promise<Uint8Array> {
  const data = base64UrlDecode(encryptedB64)
  if (data.length < NONCE_SIZE) throw new Error('Data too short')
  const nonce = data.slice(0, NONCE_SIZE)
  const ciphertext = data.slice(NONCE_SIZE)
  const aesKey = await crypto.subtle.importKey('raw', key, { name: 'AES-GCM' }, false, ['decrypt'])
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: nonce },
    aesKey,
    ciphertext
  )
  return new Uint8Array(decrypted)
}

export async function initializeVault(password: string): Promise<{ salt: Uint8Array; testPayload: Uint8Array }> {
  const salt = randomBytes(SALT_SIZE)
  const key = await deriveKey(password, salt)
  const testPayload = await encrypt(new TextEncoder().encode('OTPVAULT_INIT'), key)

  const store = getStore()
  store.set(VAULT_KEYS.salt, bytesToHex(salt))
  store.set(VAULT_KEYS.testPayload, testPayload)
  store.set(VAULT_KEYS.vaultType, 'password')

  return { salt, testPayload: new TextEncoder().encode('OTPVAULT_INIT') }
}

export async function unlockVault(password: string): Promise<boolean> {
  const store = getStore()
  const saltHex = store.get(VAULT_KEYS.salt)
  if (!saltHex) return false
  const salt = hexToBytes(saltHex)
  const key = await deriveKey(password, salt)
  const storedTestB64 = store.get(VAULT_KEYS.testPayload)
  if (!storedTestB64) return false

  try {
    const decrypted = await decrypt(storedTestB64, key)
    const text = new TextDecoder().decode(decrypted)
    if (text !== 'OTPVAULT_INIT') return false
  } catch {
    return false
  }

  // Store session key temporarily
  sessionStorage.setItem('session_key', bytesToHex(key))
  sessionStorage.setItem('session_salt', saltHex)
  return true
}

function getSessionKey(): Uint8Array {
  const hex = sessionStorage.getItem('session_key')
  if (!hex) throw new Error('Vault is locked')
  return hexToBytes(hex)
}

export async function encryptVaultData(json: string): Promise<string> {
  const key = getSessionKey()
  return encrypt(new TextEncoder().encode(json), key)
}

export async function decryptVaultData(encryptedB64: string): Promise<string> {
  const key = getSessionKey()
  const decrypted = await decrypt(encryptedB64, key)
  return new TextDecoder().decode(decrypted)
}

export function isInitialized(): boolean {
  return getStore().get(VAULT_KEYS.salt) !== null
}

export function lockVault() {
  sessionStorage.removeItem('session_key')
  sessionStorage.removeItem('session_salt')
}

export function saveVaultData(json: string) {
  const store = getStore()
  store.set(VAULT_KEYS.vaultData, btoa(json))
}

export function loadVaultData(): string | null {
  const store = getStore()
  const b64 = store.get(VAULT_KEYS.vaultData)
  if (!b64) return null
  try {
    return atob(b64)
  } catch {
    return null
  }
}

export function saveEmail(email: string) {
  getStore().set(VAULT_KEYS.email, email)
}

export function loadEmail(): string | null {
  return getStore().get(VAULT_KEYS.email)
}

export function saveRememberMe(email: string, password: string) {
  getStore().set(VAULT_KEYS.rememberMe, JSON.stringify({ email, password }))
}

export function loadRememberMe(): { email: string; password: string } | null {
  const store = getStore()
  const val = store.get(VAULT_KEYS.rememberMe)
  if (!val) return null
  try {
    return JSON.parse(val)
  } catch {
    return null
  }
}

export function clearRememberMe() {
  getStore().delete(VAULT_KEYS.rememberMe)
}

export function clearAllData() {
  Object.values(VAULT_KEYS).forEach(key => getStore().delete(key))
}
