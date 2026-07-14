import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { AnimatePresence, motion } from 'motion/react'
import { listen } from '@tauri-apps/api/event'
import { OnboardingScreen } from './features/onboarding/OnboardingScreen'
import { AccountList } from './features/accounts/AccountList'
import { AddAccountScreen } from './features/add-account/AddAccountScreen'
import { SettingsScreen } from './features/settings/SettingsScreen'
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
} from './lib/tauri'
import type { AccountEntry, AddAccountPayload } from './types'

type Screen =
  | 'loading'
  | 'onboarding'
  | 'accounts'
  | 'add-account'
  | 'settings'

function App() {
  const { i18n } = useTranslation()
  const vault = useVault()
  const [screen, setScreen] = useState<Screen>('loading')
  const [accounts, setAccounts] = useState<AccountEntry[]>([])
  const [error, setError] = useState<string | null>(null)
  const [helpOpen, setHelpOpen] = useState(false)
  const [vaultExists, setVaultExists] = useState(false)

  useEffect(() => {
    document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.lang = i18n.language
  }, [i18n.language])

  useEffect(() => {
    const init = async () => {
      const { initialized: exists } = await vault.init()
      setVaultExists(exists ?? false)
      if (exists === false) {
        setScreen('onboarding')
      } else {
        const creds = await loadRememberMe()
        if (creds) {
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
    if (vault.unlocked) {
      loadAccounts()
      setScreen('accounts')
    }
  }, [vault.unlocked])

  useEffect(() => {
    const unlisten = listen('lock-vault', async () => {
      await lockVaultCmd()
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
    } catch (e) {
      setError(String(e))
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteAccount(id)
      await loadAccounts()
    } catch (e) {
      setError(String(e))
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
      const path = await save({ filters: [{ name: 'OtpVault Backup', extensions: ['json'] }] })
      if (!path) return
      await exportBackup(path)
    } catch (e) {
      setError(String(e))
    }
  }

  const handleImport = async () => {
    try {
      const path = await open({ filters: [{ name: 'OtpVault Backup', extensions: ['json'] }], multiple: false })
      if (!path) return
      await importBackup(path as string)
      await loadAccounts()
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
      <AnimatePresence mode="wait">
        {screen === 'onboarding' && (
          <motion.div key="onboarding" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <OnboardingScreen
              onSignUp={handleSignUp}
              onSignIn={(email, password) => handleSignIn(email, password, true)}
              onError={(msg) => setError(msg)}
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
              currentLang={i18n.language}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <HelpGuideModal open={helpOpen} onClose={() => setHelpOpen(false)} />
    </div>
  )
}

export default App
