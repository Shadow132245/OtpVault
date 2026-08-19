import { create } from 'zustand'
import type { AccountEntry } from '@/types'

interface AuthState {
  isUnlocked: boolean
  isInitialized: boolean
  email: string | null
  accounts: AccountEntry[]
  biometricsEnabled: boolean
  setUnlocked: (val: boolean) => void
  setInitialized: (val: boolean) => void
  setEmail: (email: string | null) => void
  setAccounts: (accounts: AccountEntry[]) => void
  addAccount: (account: AccountEntry) => void
  deleteAccount: (id: string) => void
  updateAccount: (id: string, updates: Partial<AccountEntry>) => void
  setBiometricsEnabled: (val: boolean) => void
  reset: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  isUnlocked: false,
  isInitialized: false,
  email: null,
  accounts: [],
  biometricsEnabled: false,
  setUnlocked: (val) => set({ isUnlocked: val }),
  setInitialized: (val) => set({ isInitialized: val }),
  setEmail: (email) => set({ email }),
  setAccounts: (accounts) => set({ accounts }),
  addAccount: (account) => set((s) => ({ accounts: [...s.accounts, account] })),
  deleteAccount: (id) => set((s) => ({ accounts: s.accounts.filter((a) => a.id !== id) })),
  updateAccount: (id, updates) =>
    set((s) => ({
      accounts: s.accounts.map((a) => (a.id === id ? { ...a, ...updates } : a)),
    })),
  setBiometricsEnabled: (val) => set({ biometricsEnabled: val }),
  reset: () =>
    set({
      isUnlocked: false,
      isInitialized: false,
      email: null,
      accounts: [],
      biometricsEnabled: false,
    }),
}))
