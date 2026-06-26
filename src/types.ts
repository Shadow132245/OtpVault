export type Algorithm = 'SHA1' | 'SHA256' | 'SHA512'

export interface AccountEntry {
  id: string
  issuer: string
  account_name: string
  secret_encrypted: string
  algorithm: string
  digits: number
  step: number
  icon: string
  created_at: string
  updated_at: string
}

export interface AddAccountPayload {
  issuer: string
  accountName: string
  secret: string
  algorithm: string
  digits: number
  step: number
}

export interface TotpCode {
  code: string
  remaining: number
  total: number
}

export interface ParsedUri {
  issuer: string
  account_name: string
  secret: string
  algorithm: string
  digits: number
  step: number
}
