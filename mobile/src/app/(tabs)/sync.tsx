import { useState } from 'react'
import { View, Text, StyleSheet, Alert } from 'react-native'
import { useTranslation } from 'react-i18next'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useAuthStore } from '@/stores/useAuthStore'
import { syncFull } from '@/services/sync'
import * as storage from '@/services/storage'

export default function SyncScreen() {
  const { t } = useTranslation()
  const store = useAuthStore()
  const [syncing, setSyncing] = useState(false)
  const [lastSync, setLastSync] = useState<string | null>(null)

  const handleSyncNow = async () => {
    setSyncing(true)
    try {
      const email = store.email
      const remembered = await storage.loadRememberMe()
      if (email && remembered?.password) {
        const merged = await syncFull(email, remembered.password, store.accounts)
        store.setAccounts(merged)
        setLastSync(new Date().toLocaleString())
      }
    } catch (e: any) {
      Alert.alert(t('common.error'), e.message || 'Sync failed')
    }
    setSyncing(false)
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('sync.title')}</Text>
      </View>

      <View style={styles.content}>
        {!store.email ? (
          <View style={styles.notSignedIn}>
            <Text style={styles.notSignedInText}>{t('sync.not_authenticated')}</Text>
          </View>
        ) : (
          <Card>
            <Text style={styles.syncLabel}>{t('sync.enabled')}</Text>
            {lastSync && <Text style={styles.lastSync}>{t('sync.last_sync')}: {lastSync}</Text>}
            <Text style={styles.accountCount}>{store.accounts.length} {t('accounts.title')}</Text>
            <View style={{ marginTop: 16 }}>
              <Button title={syncing ? t('sync.syncing') : t('sync.sync_now')} onPress={handleSyncNow} loading={syncing} disabled={syncing} fullWidth />
            </View>
          </Card>
        )}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  header: { paddingHorizontal: 20, paddingVertical: 16 },
  title: { color: '#f1f5f9', fontSize: 22, fontWeight: '700' },
  content: { flex: 1, paddingHorizontal: 16, justifyContent: 'center' },
  notSignedIn: { alignItems: 'center' },
  notSignedInText: { color: '#64748b', fontSize: 14, textAlign: 'center' },
  syncLabel: { color: '#22c55e', fontSize: 15, fontWeight: '600' },
  lastSync: { color: '#64748b', fontSize: 13, marginTop: 8 },
  accountCount: { color: '#94a3b8', fontSize: 13, marginTop: 4 },
})
