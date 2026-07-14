import { useState } from 'react'
import { useTranslation, Trans } from 'react-i18next'
import { motion } from 'motion/react'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { LegalModal } from '../../components/legal/LegalModal'
import { termsOfService, privacyPolicy } from '../../lib/legal'

interface OnboardingScreenProps {
  onCreateVault: (password: string) => Promise<void>
  onUnlockVault: (password: string) => Promise<boolean>
  onError: (message: string) => void
  defaultTab?: AuthTab
}

type AuthTab = 'create' | 'unlock'

export function OnboardingScreen({ onCreateVault, onUnlockVault, onError, defaultTab }: OnboardingScreenProps) {
  const { t, i18n } = useTranslation()
  const [tab, setTab] = useState<AuthTab>(defaultTab ?? 'create')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [agreeToTerms, setAgreeToTerms] = useState(false)
  const [legalView, setLegalView] = useState<'terms' | 'privacy' | null>(null)

  const handleLanguageSelect = (lang: string) => {
    i18n.changeLanguage(lang)
  }

  const handleCreateVault = async () => {
    if (password.length < 4) {
      onError('Password must be at least 4 characters')
      return
    }
    if (password !== confirmPassword) {
      onError('Passwords do not match')
      return
    }
    setLoading(true)
    try {
      await onCreateVault(password)
    } catch (e) {
      onError(String(e))
    }
    setLoading(false)
  }

  const handleUnlockVault = async () => {
    if (!password) return
    setLoading(true)
    try {
      const ok = await onUnlockVault(password)
      if (!ok) onError(t('vault.wrong_credentials'))
    } catch (e) {
      onError(String(e))
    }
    setLoading(false)
  }

  const isRTL = i18n.language === 'ar'

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="min-h-screen bg-surface-50 dark:bg-surface-950 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary-500/25">
            <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100 mb-1">
            {t('onboarding.welcome')}
          </h1>
          <p className="text-surface-500 dark:text-surface-400 text-sm">
            {tab === 'create' ? t('onboarding.create_subtitle') : t('vault.subtitle')}
          </p>

          <div className="flex items-center justify-center gap-2 mt-4">
            <button
              onClick={() => handleLanguageSelect('en')}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${
                i18n.language === 'en'
                  ? 'bg-primary-500 text-white shadow-sm'
                  : 'bg-surface-200 dark:bg-surface-700 text-surface-500 dark:text-surface-400 hover:bg-surface-300 dark:hover:bg-surface-600'
              }`}
            >
              English
            </button>
            <button
              onClick={() => handleLanguageSelect('ar')}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${
                i18n.language === 'ar'
                  ? 'bg-primary-500 text-white shadow-sm'
                  : 'bg-surface-200 dark:bg-surface-700 text-surface-500 dark:text-surface-400 hover:bg-surface-300 dark:hover:bg-surface-600'
              }`}
            >
              العربية
            </button>
          </div>
        </div>

        <div className="flex mb-6 bg-surface-100 dark:bg-surface-800 rounded-xl p-1">
          <button
            onClick={() => setTab('create')}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
              tab === 'create'
                ? 'bg-white dark:bg-surface-700 text-surface-900 dark:text-surface-100 shadow-sm'
                : 'text-surface-500 dark:text-surface-400 hover:text-surface-700 dark:hover:text-surface-300'
            }`}
          >
            {t('auth.sign_up_tab')}
          </button>
          <button
            onClick={() => setTab('unlock')}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
              tab === 'unlock'
                ? 'bg-white dark:bg-surface-700 text-surface-900 dark:text-surface-100 shadow-sm'
                : 'text-surface-500 dark:text-surface-400 hover:text-surface-700 dark:hover:text-surface-300'
            }`}
          >
            {t('auth.log_in_tab')}
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (tab === 'create') handleCreateVault()
            else handleUnlockVault()
          }}
          className="flex flex-col gap-4"
        >
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t('onboarding.password_placeholder')}
            autoFocus
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            }
          />

          {tab === 'create' && (
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={t('onboarding.confirm_password')}
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              }
            />
          )}

          {tab === 'create' && (
            <label className="flex items-center gap-2 cursor-pointer group">
              <div
                onClick={() => setAgreeToTerms(!agreeToTerms)}
                className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all shrink-0 ${
                  agreeToTerms
                    ? 'bg-primary-500 border-primary-500'
                    : 'border-surface-300 dark:border-surface-600 group-hover:border-surface-400'
                }`}
              >
                {agreeToTerms && (
                  <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                )}
              </div>
              <span className="text-xs text-surface-500 dark:text-surface-400 group-hover:text-surface-700 dark:group-hover:text-surface-300 transition-colors">
                <Trans i18nKey="legal.agree">
                  I agree to the <button type="button" className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400 underline" onClick={() => setLegalView('terms')}>Terms of Service</button> and <button type="button" className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400 underline" onClick={() => setLegalView('privacy')}>Privacy Policy</button>
                </Trans>
              </span>
            </label>
          )}

          <Button size="lg" fullWidth type="submit" disabled={loading || !password || (tab === 'create' && (!confirmPassword || !agreeToTerms))}>
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                {tab === 'create' ? t('onboarding.creating') : t('vault.unlocking')}
              </span>
            ) : tab === 'create' ? t('onboarding.create_vault_btn') : t('vault.unlock')}
          </Button>
        </form>

        <div className="text-center mt-6">
          <button
            onClick={() => setTab(tab === 'create' ? 'unlock' : 'create')}
            className="text-xs text-primary-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
          >
            {tab === 'create' ? t('auth.have_account') : t('auth.no_account')}
          </button>
        </div>
      </motion.div>

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
    </div>
  )
}