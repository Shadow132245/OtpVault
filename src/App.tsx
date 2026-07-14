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
  createVault,
  unlockVault,
  checkVault,
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
      const exists = await checkVault()
      setVaultExists(exists)
      if (exists) {
        setScreen('onboarding')
      } else {
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

  const handleCreateVault = async (password: string) => {
    try {
      await createVault(password)
      vault.setUnlocked(true)
    } catch (e) {
      setError(String(e))
    }
  }

  const handleUnlockVault = async (password: string): Promise<boolean> => {
    try {
      const ok = await unlockVault(password)
      if (ok) vault.setUnlocked(true)
      return ok
    } catch (e) {
      setError(String(e))
      return false
    }
  }

  const handleLogOut = async () => {
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
              onCreateVault={handleCreateVault}
              onUnlockVault={handleUnlockVault}
              onError={(msg) => setError(msg)}
              defaultTab={vaultExists ? 'unlock' : 'create'}
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