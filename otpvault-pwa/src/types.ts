export interface AccountEntry {
  id: string;
  issuer: string;
  account_name: string;
  secret_encrypted: string;
  algorithm: string;
  digits: number;
  step: number;
  icon: string;
  created_at: string;
  updated_at: string;
}

export interface VaultData {
  version: number;
  accounts: AccountEntry[];
}

export interface TotpCode {
  code: string;
  remaining: number;
  total: number;
}

export interface AddAccountPayload {
  issuer: string;
  account_name: string;
  secret_encrypted: string;
  algorithm: string;
  digits: number;
  step: number;
  icon: string;
}

export type Screen = 'loading' | 'onboarding' | 'accounts' | 'add-account' | 'settings';
