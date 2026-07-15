import type { TotpCode } from '../types'

function base32Decode(str: string): Uint8Array {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
  str = str.replace(/[^A-Za-z2-7]/g, '').toUpperCase()
  const bytes: number[] = []
  let buffer = 0
  let bitsLeft = 0
  for (const char of str) {
    const idx = alphabet.indexOf(char)
    if (idx === -1) continue
    buffer = (buffer << 5) | idx
    bitsLeft += 5
    if (bitsLeft >= 8) {
      bitsLeft -= 8
      bytes.push((buffer >> bitsLeft) & 0xff)
      buffer &= (1 << bitsLeft) - 1
    }
  }
  return Uint8Array.from(bytes)
}

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16)
  }
  return bytes
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')
}

async function hmacSha1(key: Uint8Array, message: Uint8Array): Promise<Uint8Array> {
  const cryptoKey = await crypto.subtle.importKey('raw', key, { name: 'HMAC', hash: 'SHA-1' }, false, ['sign'])
  const sig = await crypto.subtle.sign('HMAC', cryptoKey, message)
  return new Uint8Array(sig)
}

async function hmacSha256(key: Uint8Array, message: Uint8Array): Promise<Uint8Array> {
  const cryptoKey = await crypto.subtle.importKey('raw', key, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const sig = await crypto.subtle.sign('HMAC', cryptoKey, message)
  return new Uint8Array(sig)
}

async function hmacSha512(key: Uint8Array, message: Uint8Array): Promise<Uint8Array> {
  const cryptoKey = await crypto.subtle.importKey('raw', key, { name: 'HMAC', hash: 'SHA-512' }, false, ['sign'])
  const sig = await crypto.subtle.sign('HMAC', cryptoKey, message)
  return new Uint8Array(sig)
}

function dynamicTruncate(hs: Uint8Array): number {
  const offset = hs[hs.length - 1] & 0xf
  const binary =
    ((hs[offset] & 0x7f) << 24) |
    ((hs[offset + 1] & 0xff) << 16) |
    ((hs[offset + 2] & 0xff) << 8) |
    (hs[offset + 3] & 0xff)
  return binary
}

function digits(num: number, count: number): string {
  return String(num).padStart(count, '0').slice(-count)
}

export async function generateTotp(
  secretB32: string,
  algorithm: string,
  digitsNum: number,
  step: number
): Promise<TotpCode> {
  const secret = base32Decode(secretB32)
  const now = Math.floor(Date.now() / 1000)
  let counter = Math.floor(now / step)
  const counterBytes = new Uint8Array(8)
  for (let i = 7; i >= 0; i--) {
    counterBytes[i] = counter & 0xff
    counter >>>= 8
  }

  let hs: Uint8Array
  switch (algorithm.toLowerCase()) {
    case 'sha256':
      hs = await hmacSha256(secret, counterBytes)
      break
    case 'sha512':
      hs = await hmacSha512(secret, counterBytes)
      break
    default:
      hs = await hmacSha1(secret, counterBytes)
  }

  const binary = dynamicTruncate(hs)
  const code = binary % Math.pow(10, digitsNum)
  const remaining = step - (now % step)

  return {
    code: digits(code, digitsNum),
    remaining,
    total: step,
  }
}

export function parseOtpauthUri(uri: string): {
  issuer: string
  account_name: string
  secret: string
  algorithm: string
  digits: number
  step: number
} | null {
  try {
    const url = new URL(uri)
    if (url.protocol !== 'otpauth:') return null
    const secret = url.searchParams.get('secret') || ''
    const algorithm = (url.searchParams.get('algorithm') || 'SHA1').toUpperCase()
    const digits = parseInt(url.searchParams.get('digits') || '6', 10)
    const step = parseInt(url.searchParams.get('period') || '30', 10)
    const path = url.pathname.replace(/^\//, '')
    const colonIdx = path.indexOf(':')
    let issuer = ''
    let account_name = path
    if (colonIdx >= 0) {
      issuer = path.substring(0, colonIdx)
      account_name = path.substring(colonIdx + 1)
    }
    const urlIssuer = url.searchParams.get('issuer')
    if (urlIssuer) issuer = urlIssuer

    return { issuer, account_name, secret, algorithm, digits, step }
  } catch {
    return null
  }
}
