export interface AccountEntry {
  id: string
  issuer: string
  accountName: string
  secretEncrypted: string
  algorithm: string
  digits: number
  step: number
  icon: string
  createdAt: string
  updatedAt: string
}

export interface VaultData {
  version: number
  accounts: AccountEntry[]
}

export interface TotpCode {
  code: string
  remaining: number
  period: number
}

export interface EmailVaultRow {
  email: string
  salt: string
  testPayload: string
  encryptedVault: string
}
