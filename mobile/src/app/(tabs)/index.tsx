import { useCallback } from 'react'
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native'
import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuthStore } from '@/stores/useAuthStore'
import { AccountCard } from '@/components/AccountCard'
import * as storage from '@/services/storage'
import { syncUpload } from '@/services/sync'

export default function AccountsScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const store = useAuthStore()

  const handleDelete = useCallback(
    (id: string) => {
      Alert.alert(t('common.delete'), 'Delete this account?', [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
            onPress: async () => {
              store.deleteAccount(id)
              try {
                const email = store.email
                const password = (await storage.loadRememberMe())?.password
                if (email && password) {
                  await syncUpload(email, password, store.accounts)
                }
              } catch {
                // non-fatal
              }
            },
        },
      ])
    },
    [store]
  )

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>OtpVault</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => router.push('/add-account')}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      {store.accounts.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>{t('accounts.no_accounts')}</Text>
          <Text style={styles.emptySubtitle}>{t('accounts.empty_state')}</Text>
        </View>
      ) : (
        <FlatList
          data={store.accounts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <AccountCard account={item} onDelete={handleDelete} />}
          contentContainerStyle={styles.list}
        />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16 },
  title: { color: '#f1f5f9', fontSize: 22, fontWeight: '700' },
  addButton: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#6366f1', alignItems: 'center', justifyContent: 'center' },
  addButtonText: { color: '#fff', fontSize: 22, fontWeight: '600' },
  list: { paddingHorizontal: 16, paddingBottom: 20 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 80 },
  emptyTitle: { color: '#64748b', fontSize: 16, fontWeight: '600', marginTop: 12 },
  emptySubtitle: { color: '#475569', fontSize: 13, marginTop: 4 },
})
