import { View, Text, TextInput, StyleSheet, Alert, ScrollView, Switch, Modal } from 'react-native'
import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useVault } from '@/hooks/useVault'
import { useAuthStore } from '@/stores/useAuthStore'
import { useBiometrics } from '@/hooks/useBiometrics'
import { exportBackup, pickAndValidateBackup, verifyBackupPassword, restoreBackup } from '@/services/backup'
import * as neon from '@/services/neon'
import { useEffect, useState } from 'react'

export default function SettingsScreen() {
  const { t, i18n } = useTranslation()
  const router = useRouter()
  const vault = useVault()
  const store = useAuthStore()
  const biometrics = useBiometrics()
  const [bioAvailable, setBioAvailable] = useState(false)

  useEffect(() => {
    biometrics.isAvailable().then(setBioAvailable)
  }, [])

  const handleLock = async () => {
    await vault.lock()
    router.replace('/')
  }

  const handleLogOut = () => {
    Alert.alert(t('settings.log_out'), t('settings.log_out_confirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('settings.log_out'),
        style: 'destructive',
        onPress: async () => {
          await vault.signOut()
          router.replace('/')
        },
      },
    ])
  }

  const handleLanguageToggle = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'ar' : 'en')
  }

  const [importPassword, setImportPassword] = useState('')
  const [importData, setImportData] = useState<{ salt: string; encryptedVault: string } | null>(null)
  const [showImportModal, setShowImportModal] = useState(false)
  const [importLoading, setImportLoading] = useState(false)

  const handleBiometricsToggle = async (val: boolean) => {
    await vault.toggleBiometrics(val)
  }

  const handleExport = async () => {
    try {
      await exportBackup()
    } catch (e: any) {
      Alert.alert(t('common.error'), e.message || 'Export failed')
    }
  }

  const handlePickImport = async () => {
    try {
      const data = await pickAndValidateBackup()
      setImportData(data)
      setImportPassword('')
      setShowImportModal(true)
    } catch (e: any) {
      if (e.message !== 'Import cancelled') {
        Alert.alert(t('common.error'), e.message || 'Import failed')
      }
    }
  }

  const handleConfirmImport = async () => {
    if (!importData || !importPassword) return
    setImportLoading(true)
    try {
      const { accounts } = await verifyBackupPassword(
        importData.encryptedVault,
        importData.salt,
        importPassword
      )
      await restoreBackup(store.email || '', importData.salt, importData.encryptedVault, accounts)
      store.setAccounts(accounts)
      setShowImportModal(false)
      Alert.alert(t('common.success'), 'Vault restored successfully')

      if (store.email) {
        try {
          await neon.uploadVault(store.email, importData.salt, importData.encryptedVault.substring(0, 100), importData.encryptedVault)
        } catch {
          // non-fatal
        }
      }
    } catch {
      Alert.alert(t('common.error'), 'Wrong password or invalid backup file')
    }
    setImportLoading(false)
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('settings.title')}</Text>
      </View>

      <ScrollView style={styles.content}>
        {store.email && (
          <Card style={styles.emailCard}>
            <Text style={styles.emailText}>{store.email}</Text>
          </Card>
        )}

        <View style={styles.section}>
          <Button title={t('settings.lock')} onPress={handleLock} variant="secondary" fullWidth style={styles.button} />
          <Button title={i18n.language === 'en' ? 'العربية' : 'English'} onPress={handleLanguageToggle} variant="secondary" fullWidth style={styles.button} />
        </View>

        <View style={styles.section}>
          <Button title={t('settings.export')} onPress={handleExport} variant="secondary" fullWidth style={styles.button} />
          <Button title={t('settings.import')} onPress={handlePickImport} variant="secondary" fullWidth style={styles.button} />
        </View>

        {bioAvailable && (
          <Card style={styles.section}>
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>{t('settings.biometrics')}</Text>
              <Switch
                value={store.biometricsEnabled}
                onValueChange={handleBiometricsToggle}
                trackColor={{ false: '#334155', true: '#6366f1' }}
                thumbColor="#f1f5f9"
              />
            </View>
          </Card>
        )}

        <View style={styles.section}>
          <Button title={t('settings.log_out')} onPress={handleLogOut} variant="danger" fullWidth style={styles.button} />
        </View>

        <Text style={styles.version}>OtpVault v0.1.0</Text>
      </ScrollView>

      <Modal visible={showImportModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('settings.import')}</Text>
            <Text style={styles.modalSubtitle}>Enter your vault password to decrypt the backup</Text>
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#64748b"
              value={importPassword}
              onChangeText={setImportPassword}
              secureTextEntry
            />
            <View style={styles.modalButtons}>
              <Button title={t('common.cancel')} onPress={() => setShowImportModal(false)} variant="secondary" style={{ flex: 1 }} />
              <Button title={t('common.confirm')} onPress={handleConfirmImport} loading={importLoading} disabled={!importPassword} style={{ flex: 1 }} />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  header: { paddingHorizontal: 20, paddingVertical: 16 },
  title: { color: '#f1f5f9', fontSize: 22, fontWeight: '700' },
  content: { paddingHorizontal: 16 },
  emailCard: { marginBottom: 24 },
  emailText: { color: '#94a3b8', fontSize: 14 },
  section: { marginBottom: 16 },
  button: { marginBottom: 10 },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  settingLabel: { color: '#f1f5f9', fontSize: 15, fontWeight: '500' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', paddingHorizontal: 32 },
  modalContent: { backgroundColor: '#1e293b', borderRadius: 20, padding: 24, borderWidth: 1, borderColor: '#334155' },
  modalTitle: { color: '#f1f5f9', fontSize: 18, fontWeight: '700', marginBottom: 8 },
  modalSubtitle: { color: '#94a3b8', fontSize: 13, marginBottom: 20 },
  modalButtons: { flexDirection: 'row', gap: 12, marginTop: 16 },
  input: { backgroundColor: '#0f172a', borderRadius: 12, height: 48, paddingHorizontal: 16, color: '#f1f5f9', fontSize: 15, borderWidth: 1, borderColor: '#334155' },
  version: { color: '#475569', fontSize: 12, textAlign: 'center', marginTop: 24, marginBottom: 40 },
})
