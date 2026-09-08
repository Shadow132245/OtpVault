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
  folder_id: string
  tags: string[]
}

export interface AddAccountPayload {
  issuer: string
  accountName: string
  secret: string
  algorithm: string
  digits: number
  step: number
  folderId?: string
  tags?: string[]
}

export interface Folder {
  id: string
  name: string
  created_at: string
}

export interface TrashEntry {
  account: AccountEntry
  deleted_at: string
}

export interface AppSettings {
  auto_lock_seconds: number
  lock_on_hide: boolean
  local_only: boolean
  biometric_enabled: boolean
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
