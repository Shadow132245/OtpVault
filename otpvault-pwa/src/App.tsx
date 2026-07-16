import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { OnboardingScreen } from './features/onboarding/OnboardingScreen'
import { AccountList } from './features/accounts/AccountList'
import { AddAccountScreen } from './features/add-account/AddAccountScreen'
import { SettingsScreen } from './features/settings/SettingsScreen'
import {
  initializeVault,
  unlockVault,
  lockVault,
  saveVaultData,
  loadVaultData,
  saveEmail,
  loadEmail,
  saveRememberMe,
  loadRememberMe,
  clearRememberMe,
  clearAllData,
  encryptVaultData,
  decryptVaultData,
  isInitialized,
} from './lib/crypto'
import { uploadVault, fetchVault } from './lib/api'
import type { AccountEntry, AddAccountPayload, VaultData, Screen } from './types'

function generateId(): string {
  return crypto.randomUUID?.() ?? Math.random().toString(36).substring(2, 15)
}

function App() {
  const { i18n } = useTranslation()
  const [screen, setScreen] = useState<Screen>('loading')
  const [accounts, setAccounts] = useState<AccountEntry[]>([])
  const [error, setError] = useState<string | null>(null)
  const [vaultExists, setVaultExists] = useState(false)
  const [email, setEmail] = useState('')
  const [lastSync, setLastSync] = useState<string | null>(null)
  const [syncing, setSyncing] = useState(false)

  useEffect(() => {
    document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.lang = i18n.language
  }, [i18n.language])

  useEffect(() => {
    const init = async () => {
      const exists = isInitialized()
      setVaultExists(exists)
      if (!exists) {
        setScreen('onboarding')
        return
      }

      const sessionKey = sessionStorage.getItem('session_key')
      if (sessionKey) {
        const stored = loadVaultData()
        if (stored) {
          try {
            const vault: VaultData = JSON.parse(stored)
            setAccounts(vault.accounts)
          } catch { /* ignore */ }
        }
        const savedEmail = loadEmail()
        if (savedEmail) setEmail(savedEmail)
        setScreen('accounts')
        return
      }

      const creds = loadRememberMe()
      if (creds) {
        try {
          const ok = await unlockVault(creds.password)
          if (ok) {
            const stored = loadVaultData()
            if (stored) {
              const vault: VaultData = JSON.parse(stored)
              setAccounts(vault.accounts)
            }
            setEmail(creds.email)
            setScreen('accounts')
            return
          }
        } catch { /* fall through */ }
      }
      setScreen('onboarding')
    }
    init()
  }, [])

  const doCloudUpload = async (vaultJson: string) => {
    const salt = localStorage.getItem('vault_salt')
    const testPayload = localStorage.getItem('vault_test')
    const currentEmail = loadEmail()
    if (!salt || !testPayload || !currentEmail) return
    try {
      const encrypted = await encryptVaultData(vaultJson)
      await uploadVault(currentEmail, salt, testPayload, encrypted)
      setLastSync(new Date().toLocaleString())
    } catch (e) {
      console.error('Cloud upload failed:', e)
    }
  }

  const handleSignUp = async (newEmail: string, password: string) => {
    try {
      const existing = await fetchVault(newEmail)
      if (existing) {
        setError('Email already registered. Please sign in instead.')
        return
      }
    } catch {
      console.warn('Could not check email existence, proceeding with local vault')
    }

    await initializeVault(password)
    saveEmail(newEmail)
    setEmail(newEmail)

    const vault: VaultData = { version: 1, accounts: [] }
    const jsonStr = JSON.stringify(vault)
    saveVaultData(jsonStr)
    setAccounts([])

    if (newEmail) {
      await doCloudUpload(jsonStr)
    }
    saveRememberMe(newEmail, password)
    setScreen('accounts')
  }

  const handleSignIn = async (signInEmail: string, password: string): Promise<boolean> => {
    try {
      const row = await fetchVault(signInEmail)
      if (!row) {
        setError('Account not found')
        return false
      }

      localStorage.setItem('vault_salt', row.salt)
      localStorage.setItem('vault_test', row.test_payload)
      localStorage.setItem('vault_type', 'password')

      const ok = await unlockVault(password)
      if (!ok) return false

      const vaultJson = await decryptVaultData(row.encrypted_vault)
      saveVaultData(vaultJson)
      saveEmail(signInEmail)
      setEmail(signInEmail)

      try {
        const vault: VaultData = JSON.parse(vaultJson)
        setAccounts(vault.accounts)
      } catch { /* ignore */ }

      saveRememberMe(signInEmail, password)
      setLastSync(new Date().toLocaleString())
      setScreen('accounts')
      return true
    } catch (e) {
      setError(String(e))
      return false
    }
  }

  const handleAddAccount = async (data: AddAccountPayload) => {
    const newAccount: AccountEntry = {
      id: generateId(),
      issuer: data.issuer,
      account_name: data.account_name,
      secret_encrypted: data.secret_encrypted,
      algorithm: data.algorithm,
      digits: data.digits,
      step: data.step,
      icon: data.icon || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const updated = [...accounts, newAccount]
    setAccounts(updated)

    const vault: VaultData = { version: 1, accounts: updated }
    const jsonStr = JSON.stringify(vault)
    saveVaultData(jsonStr)
    await doCloudUpload(jsonStr)
    setScreen('accounts')
  }

  const handleDelete = async (id: string) => {
    const updated = accounts.filter(a => a.id !== id)
    setAccounts(updated)

    const vault: VaultData = { version: 1, accounts: updated }
    const jsonStr = JSON.stringify(vault)
    saveVaultData(jsonStr)
    await doCloudUpload(jsonStr)
  }

  const handleLock = () => {
    lockVault()
    setScreen('onboarding')
  }

  const handleLogOut = () => {
    clearRememberMe()
    clearAllData()
    lockVault()
    setEmail('')
    setAccounts([])
    setScreen('onboarding')
  }

  const handleLanguageToggle = () => {
    const newLang = i18n.language === 'en' ? 'ar' : 'en'
    i18n.changeLanguage(newLang)
  }

  const handleSyncNow = async () => {
    setSyncing(true)
    try {
      const vaultJson = loadVaultData()
      if (vaultJson) {
        await doCloudUpload(vaultJson)
      }
    } catch (e) {
      setError(String(e))
    }
    setSyncing(false)
  }

  if (screen === 'loading') {
    return (
      <div className="min-h-screen bg-surface-50 dark:bg-surface-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 transition-colors duration-200">
      {error && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg shadow-lg text-sm">
          {error}
          <button className="ml-3 text-red-500 hover:text-red-700 font-bold" onClick={() => setError(null)}>x</button>
        </div>
      )}

      {screen === 'onboarding' && (
        <OnboardingScreen
          onSignUp={handleSignUp}
          onSignIn={handleSignIn}
          onError={(msg) => setError(msg)}
          defaultTab={vaultExists ? 'signin' : 'signup'}
        />
      )}

      {screen === 'accounts' && (
        <AccountList
          accounts={accounts}
          onAdd={() => setScreen('add-account')}
          onSettings={() => setScreen('settings')}
          onDelete={handleDelete}
          onLock={handleLock}
        />
      )}

      {screen === 'add-account' && (
        <AddAccountScreen
          onBack={() => setScreen('accounts')}
          onSave={handleAddAccount}
        />
      )}

      {screen === 'settings' && (
        <SettingsScreen
          onBack={() => setScreen('accounts')}
          onLanguageToggle={handleLanguageToggle}
          onLock={handleLock}
          onLogOut={handleLogOut}
          onSyncNow={handleSyncNow}
          currentLang={i18n.language}
          syncing={syncing}
          lastSync={lastSync}
          email={email}
        />
      )}
    </div>
  )
}

export default App
