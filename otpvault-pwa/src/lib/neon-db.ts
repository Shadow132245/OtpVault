import { ENCRYPTED_CONNSTR, IV, AUTH_TAG, SALT } from './connstr'

const PASSPHRASE = 'o7pV@ult_2024!secure#'

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < hex.length; i += 2)
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16)
  return bytes
}

async function deriveKey(salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    'raw', enc.encode(PASSPHRASE), 'PBKDF2', false, ['deriveKey']
  )
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 600000, hash: 'SHA-512' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt']
  )
}

async function decryptConnStr(): Promise<string> {
  const key = await deriveKey(hexToBytes(SALT))
  const iv = hexToBytes(IV)
  const authTag = hexToBytes(AUTH_TAG)
  const encrypted = hexToBytes(ENCRYPTED_CONNSTR)

  const combined = new Uint8Array(encrypted.length + authTag.length)
  combined.set(encrypted)
  combined.set(authTag, encrypted.length)

  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv, additionalData: null, tagLength: 128 },
    key,
    combined
  )

  return new TextDecoder().decode(decrypted)
}

function getEndpoint(hostname: string): string {
  return `https://${hostname}/sql`
}

function parseHostname(connStr: string): string {
  const u = new URL(connStr.replace('postgresql://', 'https://'))
  return u.hostname
}

let cache: { endpoint: string; connStr: string } | null = null

async function ensureInit() {
  if (cache) return cache
  const connStr = await decryptConnStr()
  const hostname = parseHostname(connStr)
  const endpoint = getEndpoint(hostname)
  cache = { endpoint, connStr }
  return cache
}

export async function query(
  sql: string,
  params: any[] = []
): Promise<any[]> {
  const { endpoint, connStr } = await ensureInit()

  const resp = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Neon-Connection-String': connStr,
    },
    body: JSON.stringify({ query: sql, params }),
  })

  if (!resp.ok) {
    const text = await resp.text()
    throw new Error(`Neon query failed (${resp.status}): ${text}`)
  }

  const data = await resp.json()
  return data.rows || []
}
