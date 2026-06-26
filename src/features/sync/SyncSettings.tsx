import { useTranslation } from 'react-i18next'
import { AppLayout } from '../../components/layout/AppLayout'
import { Button } from '../../components/ui/Button'

interface SyncSettingsProps {
  onBack: () => void
  isSignedIn: boolean
  onSignInGoogle: () => void
  onSignOut: () => void
  onSyncNow: () => void
  lastSync: string | null
  syncing: boolean
}

export function SyncSettings({
  onBack,
  isSignedIn,
  onSignInGoogle,
  onSignOut,
  onSyncNow,
  lastSync,
  syncing,
}: SyncSettingsProps) {
  const { t } = useTranslation()

  return (
    <AppLayout title={t('sync.title')} onBack={onBack}>
      <div className="flex flex-col gap-4 pt-4">
        {!isSignedIn ? (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {t('sync.not_authenticated')}
            </p>
            <Button size="lg" onClick={onSignInGoogle}>
              {t('sync.sign_in_google')}
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                {t('sync.last_sync')}: {lastSync ?? t('sync.never')}
              </p>
            </div>

            <Button
              size="lg"
              onClick={onSyncNow}
              disabled={syncing}
            >
              {syncing ? t('sync.syncing') : t('sync.sync_now')}
            </Button>

            <Button variant="danger" onClick={onSignOut}>
              {t('sync.sign_out')}
            </Button>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
