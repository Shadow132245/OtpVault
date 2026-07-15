import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AppLayout } from '../../components/layout/AppLayout'
import { Button } from '../../components/ui/Button'
import { LegalModal } from '../../components/legal/LegalModal'
import { termsOfService, privacyPolicy } from '../../lib/legal'
import { useTheme } from '../../contexts/ThemeContext'

interface SettingsScreenProps {
  onBack: () => void
  onLanguageToggle: () => void
  onLock: () => void
  onLogOut: () => void
  onSyncNow: () => void
  currentLang: string
  syncing: boolean
  lastSync: string | null
  email: string
}

function SettingCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-surface-800 rounded-2xl border border-surface-200/60 dark:border-surface-700/60 overflow-hidden divide-y divide-surface-100 dark:divide-surface-700/50">
      {children}
    </div>
  )
}

function SettingRow({ label, value, action }: { label: string; value?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-4 py-3.5">
      <div className="flex flex-col">
        <span className="text-sm font-medium text-surface-900 dark:text-surface-100">{label}</span>
        {value && <span className="text-xs text-surface-400 mt-0.5">{value}</span>}
      </div>
      {action && <div className="flex items-center gap-2 shrink-0">{action}</div>}
    </div>
  )
}

export function SettingsScreen({
  onBack,
  onLanguageToggle,
  onLock,
  onLogOut,
  onSyncNow,
  currentLang,
  syncing,
  lastSync,
  email,
}: SettingsScreenProps) {
  const { t, i18n } = useTranslation()
  const { theme, toggleTheme } = useTheme()
  const [legalView, setLegalView] = useState<'terms' | 'privacy' | null>(null)

  return (
    <AppLayout title={t('settings.title')} onBack={onBack}>
      <div className="flex flex-col gap-6">
        <div>
          <p className="text-xs font-semibold tracking-wider text-surface-400 dark:text-surface-500 px-1 mb-3 uppercase">{t('settings.preferences')}</p>
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
                  <div
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-200 ${theme === 'dark' ? 'left-[22px]' : 'left-[2px]'}`}
                  />
                </button>
              }
            />
          </SettingCard>
        </div>

        <div>
          <p className="text-xs font-semibold tracking-wider text-surface-400 dark:text-surface-500 px-1 mb-3 uppercase">{t('sync.title')}</p>
          <SettingCard>
            <SettingRow
              label={email || t('sync.not_authenticated')}
              value={lastSync ? `${t('sync.last_sync')}: ${lastSync}` : undefined}
              action={
                <Button variant="secondary" size="sm" onClick={onSyncNow} disabled={syncing}>
                  {syncing ? t('sync.syncing') : t('sync.sync_now')}
                </Button>
              }
            />
          </SettingCard>
        </div>

        <div>
          <p className="text-xs font-semibold tracking-wider text-surface-400 dark:text-surface-500 px-1 mb-3 uppercase">{t('settings.about')}</p>
          <SettingCard>
            <SettingRow label="OtpVault" value={`${t('settings.version')} 0.1.5`} />
            <SettingRow label={t('settings.copyright')} value="EuroMoscow Developments" />
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

        <Button variant="danger" fullWidth onClick={onLock}>
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          {t('vault.lock')}
        </Button>

        <Button variant="ghost" fullWidth onClick={onLogOut} className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          {t('settings.log_out')}
        </Button>
      </div>

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
