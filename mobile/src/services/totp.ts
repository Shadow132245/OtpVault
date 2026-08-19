import { sha1 } from 'js-sha1'
import base32 from 'base32.js'

export interface TotpCode {
  code: string
  remaining: number
  period: number
}

function intToBytes(value: number): number[] {
  const bytes: number[] = []
  for (let i = 7; i >= 0; i--) bytes.push((value >> (i * 8)) & 0xff)
  return bytes
}

function dynamicTruncation(hmac: string): number {
  const offset = parseInt(hmac[hmac.length - 1], 16)
  return (
    ((parseInt(hmac.substring(offset * 2, offset * 2 + 2), 16) & 0x7f) << 24) |
    ((parseInt(hmac.substring(offset * 2 + 2, offset * 2 + 4), 16) & 0xff) << 16) |
    ((parseInt(hmac.substring(offset * 2 + 4, offset * 2 + 6), 16) & 0xff) << 8) |
    (parseInt(hmac.substring(offset * 2 + 6, offset * 2 + 8), 16) & 0xff)
  )
}

function hmacSha1(key: number[], msg: number[]): string {
  const block = 64
  const k = key.length > block ? hexToBytes(sha1.update(bytesToHex(key)).hex()) : [...key]
  const pk = k.length < block ? [...k, ...Array(block - k.length).fill(0)] : k
  const ipad = pk.map((b) => b ^ 0x36)
  const opad = pk.map((b) => b ^ 0x5c)
  const inner = sha1.update(bytesToHex([...ipad, ...msg])).hex()
  const outer = sha1.update(bytesToHex([...opad, ...hexToBytes(inner)])).hex()
  return outer
}

function hexToBytes(hex: string): number[] {
  const bytes: number[] = []
  for (let i = 0; i < hex.length; i += 2) bytes.push(parseInt(hex.substring(i, i + 2), 16))
  return bytes
}

function bytesToHex(bytes: number[]): string {
  return bytes.map((b) => b.toString(16).padStart(2, '0')).join('')
}

export function generateCode(secretB32: string, digits: number = 6, period: number = 30): TotpCode {
  try {
    const decoded = base32.decode(secretB32.replace(/\s/g, '').toUpperCase())
    const key = Array.from(decoded) as number[]
    const now = Math.floor(Date.now() / 1000)
    const counter = Math.floor(now / period)
    const hmac = hmacSha1(key, intToBytes(counter))
    const truncated = dynamicTruncation(hmac)
    const code = String(truncated % Math.pow(10, digits)).padStart(digits, '0')
    const remaining = period - (now % period)
    return { code, remaining, period }
  } catch {
    return { code: '------', remaining: 0, period }
  }
}

export function parseURI(uri: string): {
  issuer: string
  accountName: string
  secret: string
  digits: number
  period: number
} | null {
  try {
    const url = new URL(uri)
    if (url.protocol !== 'otpauth:') return null
    const path = url.pathname.replace(/^\//, '')
    const parts = path.split(':')
    const issuer = decodeURIComponent(url.searchParams.get('issuer') || parts[0] || '')
    const accountName = decodeURIComponent(parts[1] || path)
    const secret = url.searchParams.get('secret') || ''
    const digits = parseInt(url.searchParams.get('digits') || '6', 10)
    const period = parseInt(url.searchParams.get('period') || '30', 10)
    return { issuer, accountName, secret, digits, period }
  } catch {
    return null
  }
}
