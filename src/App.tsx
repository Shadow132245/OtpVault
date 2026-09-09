import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { AnimatePresence, motion } from 'motion/react'
import { listen } from '@tauri-apps/api/event'
import { OnboardingScreen } from './features/onboarding/OnboardingScreen'
import { AccountList } from './features/accounts/AccountList'
import { AddAccountScreen } from './features/add-account/AddAccountScreen'
import { SettingsScreen } from './features/settings/SettingsScreen'
import { TrashScreen } from './features/trash/TrashScreen'
import { HelpGuideModal } from './components/help/HelpGuideModal'
import { useVault } from './hooks/useVault'
import { save, open } from '@tauri-apps/plugin-dialog'
import {
  getAccounts,
  addAccount,
  deleteAccount,
  exportBackup,
  importBackup,
  lockVault as lockVaultCmd,
  emailSignUp,
  emailSignIn,
  loadRememberMe,
  saveRememberMe,
  clearRememberMe,
  pullVaultFromCloud,
  isMobile,
  getSettings,
  setSettings,
  unlockWithBiometric,
  moveAccount,
  biometricSupported as checkBiometricSupport,
  onAppHidden,
  vaultStatus,
} from './lib/tauri'
import type { AccountEntry, AddAccountPayload, AppSettings } from './types'

const DEFAULT_SETTINGS: AppSettings = {
  auto_lock_seconds: 120,
  lock_on_hide: true,
  local_only: false,
  biometric_enabled: false,
}

type Screen =
  | 'loading'
  | 'onboarding'
  | 'accounts'
  | 'add-account'
  | 'settings'
  | 'trash'

function App() {
  const { t, i18n } = useTranslation()
  const vault = useVault()
  const [screen, setScreen] = useState<Screen>('loading')
  const [accounts, setAccounts] = useState<AccountEntry[]>([])
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [helpOpen, setHelpOpen] = useState(false)
  const [appSettings, setAppSettings] = useState<AppSettings>(DEFAULT_SETTINGS)
  const [biometricLoading, setBiometricLoading] = useState(false)
  const [isMobileDevice, setIsMobileDevice] = useState(false)
  const [biometricSupported, setBiometricSupported] = useState(false)
  const lastActivity = useRef(Date.now())

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [success])
  const [vaultExists, setVaultExists] = useState(false)

  useEffect(() => {
    document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.lang = i18n.language
  }, [i18n.language])

  useEffect(() => {
    const init = async () => {
      const { initialized: exists } = await vault.init()
      setVaultExists(exists ?? false)
      isMobile().then(setIsMobileDevice).catch(() => {})
      checkBiometricSupport().then(setBiometricSupported).catch(() => {})
      const settings = await getSettings().catch(() => DEFAULT_SETTINGS)
      setAppSettings(settings)
      if (exists === false) {
        setScreen('onboarding')
      } else {
        // A mobile webview can be recreated while the app was backgrounded;
        // if the vault is still unlocked in memory (auto-lock "Never"), keep
        // the user logged in instead of forcing another login.
        const stillUnlocked = await vaultStatus().catch(() => false)
        if (stillUnlocked) {
          vault.setUnlocked(true)
          setScreen('accounts')
          return
        }
        const creds = await loadRememberMe()
        if (creds && !settings.biometric_enabled) {
          try {
            const ok = await emailSignIn(creds[0], creds[1])
            if (ok) {
              vault.setUnlocked(true)
              setScreen('accounts')
              return
            }
          } catch { /* fall through to onboarding */ }
        }
        setScreen('onboarding')
      }
    }
    init()
  }, [])

  useEffect(() => {
    getSettings().then((s) => setAppSettings(s)).catch(() => {})
  }, [])

  useEffect(() => {
    if (!isMobileDevice) return
    const onHidden = () => {
      if (document.hidden || document.visibilityState === 'hidden') {
        onAppHidden().catch(() => {})
      }
    }
    document.addEventListener('visibilitychange', onHidden)
    window.addEventListener('blur', onHidden)
    return () => {
      document.removeEventListener('visibilitychange', onHidden)
      window.removeEventListener('blur', onHidden)
    }
  }, [isMobileDevice])

  useEffect(() => {
    if (vault.unlocked) {
      loadAccounts()
      setScreen('accounts')
    }
  }, [vault.unlocked])

  useEffect(() => {
    if (!vault.unlocked) return
    const poll = async () => {
      try {
        if (appSettings.local_only) return
        const changed = await pullVaultFromCloud()
        if (changed) await loadAccounts()
      } catch {}
    }
    poll()
    const id = setInterval(poll, 3000)
    return () => clearInterval(id)
  }, [vault.unlocked, appSettings.local_only])

  useEffect(() => {
    if (!vault.unlocked) return
    const reset = () => { lastActivity.current = Date.now() }
    const events: (keyof WindowEventMap)[] = ['pointerdown', 'keydown', 'mousemove', 'touchstart']
    events.forEach((evt) => window.addEventListener(evt, reset, { passive: true }))
    reset()
    const id = setInterval(() => {
      const seconds = appSettings.auto_lock_seconds
      if (seconds > 0 && Date.now() - lastActivity.current >= seconds * 1000) {
        handleLock()
      }
    }, 1000)
    return () => {
      events.forEach((evt) => window.removeEventListener(evt, reset))
      clearInterval(id)
    }
  }, [vault.unlocked, appSettings.auto_lock_seconds])

  useEffect(() => {
    const unlisten = listen('lock-vault', async () => {
      try {
        await lockVaultCmd()
      } catch {}
      vault.lock()
      setScreen('onboarding')
    })
    return () => { unlisten.then(fn => fn()) }
  }, [])

  const loadAccounts = async () => {
    try {
      const accts = await getAccounts()
      setAccounts(accts)
    } catch (e) {
      setError(String(e))
    }
  }

  const handleSignUp = async (email: string, password: string) => {
    try {
      await emailSignUp(email, password)
      await saveRememberMe(email, password)
      vault.setUnlocked(true)
    } catch (e) {
      setError(String(e))
    }
  }

  const handleSignIn = async (email: string, password: string, remember?: boolean): Promise<boolean> => {
    try {
      const ok = await emailSignIn(email, password)
      if (!ok) return false
      if (remember !== false) {
        await saveRememberMe(email, password)
      }
      vault.setUnlocked(true)
      return true
    } catch (e) {
      setError(String(e))
      return false
    }
  }

  const handleLogOut = async () => {
    await clearRememberMe()
    await lockVaultCmd()
    vault.lock()
    setScreen('onboarding')
  }

  const handleAddAccount = async (data: AddAccountPayload) => {
    try {
      await addAccount(data)
      await loadAccounts()
      setScreen('accounts')
      pullVaultFromCloud().then(changed => { if (changed) loadAccounts() })
    } catch (e) {
      setError(String(e))
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteAccount(id)
      await loadAccounts()
      if (!appSettings.local_only) pullVaultFromCloud().then(changed => { if (changed) loadAccounts() })
    } catch (e) {
      setError(String(e))
    }
  }

  const handleMove = async (accountId: string, folderId: string) => {
    try {
      await moveAccount(accountId, folderId)
      await loadAccounts()
      if (!appSettings.local_only) pullVaultFromCloud().then(changed => { if (changed) loadAccounts() })
    } catch (e) {
      setError(String(e))
    }
  }

  const handleSettingsChanged = async (next: AppSettings) => {
    setAppSettings(next)
    try {
      await setSettings(next)
    } catch (e) {
      setError(String(e))
    }
  }

  const handleBiometricUnlock = async (): Promise<boolean> => {
    setBiometricLoading(true)
    try {
      const ok = await unlockWithBiometric()
      if (ok) {
        vault.setUnlocked(true)
        setScreen('accounts')
        return true
      }
      return false
    } finally {
      setBiometricLoading(false)
    }
  }

  const handleLock = async () => {
    await lockVaultCmd()
    vault.lock()
    setScreen('onboarding')
  }

  const handleLanguageToggle = () => {
    const newLang = i18n.language === 'en' ? 'ar' : 'en'
    i18n.changeLanguage(newLang)
  }

  const handleExport = async () => {
    try {
      const mobile = await isMobile()
      if (mobile) {
        const result = await exportBackup()
        setSuccess(`${t('settings.export_success') || 'Backup exported'}: ${result}`)
      } else {
        const path = await save({ filters: [{ name: 'OtpVault Backup', extensions: ['json'] }] })
        if (!path) return
        await exportBackup(path)
      }
    } catch (e) {
      setError(String(e))
    }
  }

  const handleImport = async () => {
    try {
      const mobile = await isMobile()
      if (mobile) {
        const path = await open({ multiple: false })
        if (path) {
          await importBackup(path as string)
        } else {
          await importBackup()
        }
      } else {
        const path = await open({ filters: [{ name: 'OtpVault Backup', extensions: ['json'] }], multiple: false })
        if (!path) return
        await importBackup(path as string)
      }
      await loadAccounts()
      setSuccess(t('settings.import_success') || 'Backup imported successfully')
    } catch (e) {
      setError(String(e))
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {error && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg shadow-lg">
          {error}
          <button className="ml-3 text-red-500 hover:text-red-700" onClick={() => setError(null)}>x</button>
        </div>
      )}
      {success && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-lg shadow-lg">
          {success}
          <button className="ml-3 text-green-500 hover:text-green-700" onClick={() => setSuccess(null)}>x</button>
        </div>
      )}
      <AnimatePresence mode="wait">
        {screen === 'onboarding' && (
          <motion.div key="onboarding" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <OnboardingScreen
              onSignUp={handleSignUp}
              onSignIn={(email, password) => handleSignIn(email, password, true)}
              onError={(msg) => setError(msg)}
              onBiometricUnlock={handleBiometricUnlock}
              biometricEnabled={appSettings.biometric_enabled}
              biometricLoading={biometricLoading}
              isMobile={isMobileDevice}
              defaultTab={vaultExists ? 'signin' : 'signup'}
            />
          </motion.div>
        )}

        {screen === 'accounts' && (
          <motion.div key="accounts" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <AccountList
              accounts={accounts}
              onAdd={() => setScreen('add-account')}
              onSettings={() => setScreen('settings')}
              onHelp={() => setHelpOpen(true)}
              onDelete={handleDelete}
              onTrash={() => setScreen('trash')}
              onMove={handleMove}
            />
          </motion.div>
        )}

        {screen === 'add-account' && (
          <motion.div key="add" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
            <AddAccountScreen
              onBack={() => setScreen('accounts')}
              onSave={handleAddAccount}
            />
          </motion.div>
        )}

        {screen === 'trash' && (
          <motion.div key="trash" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
            <TrashScreen
              onBack={() => setScreen('accounts')}
              onHelp={() => setHelpOpen(true)}
              onRestored={loadAccounts}
            />
          </motion.div>
        )}

        {screen === 'settings' && (
          <motion.div key="settings" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
            <SettingsScreen
              onBack={() => setScreen('accounts')}
              onExport={handleExport}
              onImport={handleImport}
              onLanguageToggle={handleLanguageToggle}
              onLock={handleLock}
              onLogOut={handleLogOut}
              onHelp={() => setHelpOpen(true)}
              settings={appSettings}
              onSettingsChanged={handleSettingsChanged}
              currentLang={i18n.language}
              isMobile={isMobileDevice}
              biometricSupported={biometricSupported}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <HelpGuideModal open={helpOpen} onClose={() => setHelpOpen(false)} />
    </div>
  )
}

export default App
