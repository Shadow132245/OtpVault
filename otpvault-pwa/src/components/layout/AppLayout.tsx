import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LegalModal } from '../legal/LegalModal'
import { termsOfService, privacyPolicy } from '../../lib/legal'

interface AppLayoutProps {
  title: string
  onBack?: () => void
  onSettings?: () => void
  children: React.ReactNode
}

export function AppLayout({ title, onBack, onSettings, children }: AppLayoutProps) {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const [legalView, setLegalView] = useState<'terms' | 'privacy' | null>(null)

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="min-h-screen bg-surface-50 dark:bg-surface-950 flex flex-col">
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-surface-900/80 backdrop-blur-xl border-b border-surface-200/60 dark:border-surface-800/60">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {onBack && (
              <button
                onClick={onBack}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-surface-500 hover:text-surface-700 hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  {isRTL
                    ? <polyline points="9 18 15 12 9 6" />
                    : <polyline points="15 18 9 12 15 6" />
                  }
                </svg>
              </button>
            )}
            <h1 className="text-base font-semibold text-surface-900 dark:text-surface-100">
              {title}
            </h1>
          </div>
          <div className="flex items-center gap-1">
            {onSettings && (
              <button
                onClick={onSettings}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-surface-500 hover:text-surface-700 hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                </svg>
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-5 flex-1 w-full">
        {children}
      </main>

      <footer className="border-t border-surface-200/60 dark:border-surface-800/60 py-3">
        <div className="max-w-2xl mx-auto px-4 flex flex-col items-center gap-2 text-xs">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setLegalView('terms')}
              className="text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 transition-colors"
            >
              {t('legal.terms')}
            </button>
            <span className="text-surface-300 dark:text-surface-600">|</span>
            <button
              type="button"
              onClick={() => setLegalView('privacy')}
              className="text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 transition-colors"
            >
              {t('legal.privacy')}
            </button>
          </div>
          <p className="text-surface-400 dark:text-surface-500">&copy; 2026 OtpVault. EuroMoscow Developments</p>
        </div>
      </footer>

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
