export async function deriveKey(password: string, salt: string): Promise<CryptoKey> {
  const enc = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  )
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: enc.encode(salt),
      iterations: 600000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
}

export async function encryptVault(vaultJson: string, password: string, salt: string): Promise<string> {
  const key = await deriveKey(password, salt)
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    new TextEncoder().encode(vaultJson)
  )
  const combined = new Uint8Array(iv.length + encrypted.byteLength)
  combined.set(iv)
  combined.set(new Uint8Array(encrypted), iv.length)
  return btoa(String.fromCharCode(...new Uint8Array(combined.buffer)))
}

export async function decryptVault(encryptedB64: string, password: string, salt: string): Promise<string> {
  const key = await deriveKey(password, salt)
  const binary = atob(encryptedB64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  const iv = bytes.slice(0, 12)
  const ciphertext = bytes.slice(12)
  const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext)
  return new TextDecoder().decode(decrypted)
}

export function generateSalt(): string {
  const salt = crypto.getRandomValues(new Uint8Array(32))
  return btoa(String.fromCharCode(...salt))
}
