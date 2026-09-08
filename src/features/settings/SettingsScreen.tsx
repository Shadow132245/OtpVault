import { useState } from 'react'
import { motion } from 'motion/react'
import { useTranslation } from 'react-i18next'
import { AppLayout } from '../../components/layout/AppLayout'
import { Button } from '../../components/ui/Button'
import { LegalModal } from '../../components/legal/LegalModal'
import { BiometricSetupModal } from '../../components/ui/BiometricSetupModal'
import { termsOfService, privacyPolicy } from '../../lib/legal'
import { useTheme } from '../../contexts/ThemeContext'
import { disableBiometric } from '../../lib/tauri'
import type { AppSettings } from '../../types'

interface SettingsScreenProps {
  onBack: () => void
  onExport: () => void
  onImport: () => void
  onLanguageToggle: () => void
  onLock: () => void
  onLogOut: () => void
  onHelp: () => void
  settings: AppSettings
  onSettingsChanged: (settings: AppSettings) => void
  currentLang: string
}

function SettingCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="card divide-y divide-surface-100 dark:divide-surface-700/50 overflow-hidden">
      {children}
    </div>
  )
}

function SettingRow({ label, value, action }: { label: string; value?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-4 py-3.5 gap-3">
      <div className="flex flex-col min-w-0">
        <span className="text-sm font-medium text-surface-900 dark:text-surface-100">{label}</span>
        {value && <span className="text-xs text-surface-400 mt-0.5">{value}</span>}
      </div>
      {action && <div className="flex items-center gap-2 shrink-0">{action}</div>}
    </div>
  )
}

function Toggle({ on, onChange, danger }: { on: boolean; onChange: (v: boolean) => void; danger?: boolean }) {
  return (
    <button
      onClick={() => onChange(!on)}
      aria-checked={on}
      role="switch"
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-primary-500 ${on ? (danger ? 'bg-red-500' : 'bg-primary-600') : 'bg-surface-300 dark:bg-surface-600'}`}
    >
      <motion.div
        animate={{ x: on ? 22 : 2 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
      />
    </button>
  )
}

export function SettingsScreen({
  onBack,
  onExport,
  onImport,
  onLanguageToggle,
  onLock,
  onLogOut,
  onHelp,
  settings,
  onSettingsChanged,
  currentLang,
}: SettingsScreenProps) {
  const { t, i18n } = useTranslation()
  const { theme, toggleTheme } = useTheme()
  const [legalView, setLegalView] = useState<'terms' | 'privacy' | null>(null)
  const [biometricOpen, setBiometricOpen] = useState(false)

  const autoLockOptions = [
    { value: 30, label: t('settings.seconds_30') },
    { value: 60, label: t('settings.seconds_60') },
    { value: 120, label: t('settings.minutes_2') },
    { value: 300, label: t('settings.minutes_5') },
    { value: 900, label: t('settings.minutes_15') },
    { value: 0, label: t('settings.never') },
  ]

  const handleBiometricDisable = async () => {
    try {
      await disableBiometric()
      onSettingsChanged({ ...settings, biometric_enabled: false })
    } catch {}
  }

  return (
    <AppLayout title={t('settings.title')} onBack={onBack} onHelp={onHelp}>
      <div className="flex flex-col gap-6">
        <div>
          <p className="section-label px-1 mb-3">{t('settings.preferences')}</p>
          <SettingCard>
            <SettingRow
              label={t('settings.language')}
              value={currentLang === 'en' ? 'English' : 'العربية'}
              action={
                <div className="flex gap-1.5">
                  <Button
                    variant={currentLang === 'en' ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={() => { if (currentLang !== 'en') onLanguageToggle() }}
                  >
                    EN
                  </Button>
                  <Button
                    variant={currentLang === 'ar' ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={() => { if (currentLang !== 'ar') onLanguageToggle() }}
                  >
                    AR
                  </Button>
                </div>
              }
            />
            <SettingRow
              label={t('settings.theme')}
              value={theme === 'light' ? t('settings.light') : t('settings.dark')}
              action={
                <button
                  onClick={toggleTheme}
                  className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-primary-500 ${theme === 'dark' ? 'bg-primary-600' : 'bg-surface-300 dark:bg-surface-600'}`}
                >
                  <motion.div
                    animate={{ x: theme === 'dark' ? 22 : 2 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
                  />
                </button>
              }
            />
          </SettingCard>
        </div>

        <div>
          <p className="section-label px-1 mb-3">{t('settings.security')}</p>
          <SettingCard>
            <SettingRow
              label={t('settings.auto_lock')}
              value={t('settings.auto_lock_desc')}
              action={
                <select
                  value={settings.auto_lock_seconds}
                  onChange={(e) => {
                    const seconds = Number(e.target.value)
                    onSettingsChanged({ ...settings, auto_lock_seconds: seconds })
                  }}
                  className="px-2.5 py-1.5 text-sm rounded-lg bg-surface-50 dark:bg-surface-700 border border-surface-200 dark:border-surface-600 text-surface-900 dark:text-surface-100 focus:outline-none focus:border-primary-400"
                >
                  {autoLockOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              }
            />
            <SettingRow
              label={t('settings.lock_on_hide')}
              action={
                <Toggle
                  on={settings.lock_on_hide}
                  onChange={(v) => onSettingsChanged({ ...settings, lock_on_hide: v })}
                />
              }
            />
            <SettingRow
              label={t('settings.biometric')}
              value={t('settings.biometric_desc')}
              action={
                settings.biometric_enabled ? (
                  <Toggle on danger onChange={() => handleBiometricDisable()} />
                ) : (
                  <Button variant="secondary" size="sm" onClick={() => setBiometricOpen(true)}>
                    {t('biometric.enable')}
                  </Button>
                )
              }
            />
            <SettingRow
              label={t('settings.local_only')}
              value={t('settings.local_only_desc')}
              action={
                <Toggle
                  on={settings.local_only}
                  onChange={(v) => onSettingsChanged({ ...settings, local_only: v })}
                />
              }
            />
          </SettingCard>
        </div>

        <div>
          <p className="section-label px-1 mb-3">{t('settings.backup')}</p>
          <SettingCard>
            <SettingRow
              label={t('settings.export')}
              value={t('settings.export_desc')}
              action={
                <Button variant="secondary" size="sm" onClick={onExport}>
                  {t('settings.export_btn')}
                </Button>
              }
            />
            <SettingRow
              label={t('settings.import')}
              value={t('settings.import_desc')}
              action={
                <Button variant="secondary" size="sm" onClick={onImport}>
                  {t('settings.import_btn')}
                </Button>
              }
            />
          </SettingCard>
        </div>

        <div>
          <p className="section-label px-1 mb-3">{t('settings.about')}</p>
          <SettingCard>
            <SettingRow
              label="OtpVault"
              value={`${t('settings.version')} ${__APP_VERSION__}`}
            />
            <SettingRow
              label={t('settings.copyright')}
              value="EuroMoscow Developments"
            />
            <SettingRow
              label={t('legal.terms')}
              action={
                <Button variant="ghost" size="sm" onClick={() => setLegalView('terms')}>
                  {t('legal.terms')}
                </Button>
              }
            />
            <SettingRow
              label={t('legal.privacy')}
              action={
                <Button variant="ghost" size="sm" onClick={() => setLegalView('privacy')}>
                  {t('legal.privacy')}
                </Button>
              }
            />
          </SettingCard>
        </div>

        <Button variant="danger" fullWidth onClick={onLock} className="mt-2">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          {t('vault.lock')}
        </Button>

        <Button variant="ghost" fullWidth onClick={onLogOut} className="mt-1 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          {t('settings.log_out')}
        </Button>
      </div>

      <BiometricSetupModal
        open={biometricOpen}
        onClose={() => setBiometricOpen(false)}
        onEnabled={() => onSettingsChanged({ ...settings, biometric_enabled: true })}
      />

      <LegalModal
        open={legalView === 'terms'}
        onClose={() => setLegalView(null)}
        content={termsOfService[i18n.language] ?? termsOfService.en}
      />
      <LegalModal
        open={legalView === 'privacy'}
        onClose={() => setLegalView(null)}
        content={privacyPolicy[i18n.language] ?? privacyPolicy.en}
      />
    </AppLayout>
  )
}
