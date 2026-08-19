import { useState, useRef } from 'react'
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native'
import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { SafeAreaView } from 'react-native-safe-area-context'
import { CameraView, useCameraPermissions } from 'expo-camera'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/stores/useAuthStore'
import { parseURI } from '@/services/totp'
import * as storage from '@/services/storage'
import { syncUpload } from '@/services/sync'

export default function AddAccountScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const store = useAuthStore()

  const [mode, setMode] = useState<'manual' | 'scan'>('manual')
  const [permission, requestPermission] = useCameraPermissions()
  const [scanned, setScanned] = useState(false)

  const [issuer, setIssuer] = useState('')
  const [accountName, setAccountName] = useState('')
  const [secret, setSecret] = useState('')
  const [digits, setDigits] = useState('6')
  const [period, setPeriod] = useState('30')

  const handleSave = async () => {
    if (!issuer || !secret) {
      Alert.alert(t('common.error'), 'Issuer and secret are required')
      return
    }

    const id = Math.random().toString(36).substring(2) + Date.now().toString(36)
    const now = new Date().toISOString()
    const account = {
      id,
      issuer,
      accountName: accountName || issuer,
      secretEncrypted: secret,
      algorithm: 'SHA1',
      digits: parseInt(digits, 10) || 6,
      step: parseInt(period, 10) || 30,
      icon: '',
      createdAt: now,
      updatedAt: now,
    }

    store.addAccount(account)

    try {
      const email = store.email
      const password = (await storage.loadRememberMe())?.password
      if (email && password) {
        await syncUpload(email, password, store.accounts)
      }
    } catch {
      // non-fatal
    }

    router.back()
  }

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (scanned) return
    setScanned(true)

    const parsed = parseURI(data)
    if (!parsed) {
      Alert.alert(t('common.error'), t('add_account.invalid_qr'))
      setScanned(false)
      return
    }

    setIssuer(parsed.issuer)
    setAccountName(parsed.accountName)
    setSecret(parsed.secret)
    setDigits(String(parsed.digits))
    setPeriod(String(parsed.period))
    setMode('manual')
  }

  const renderScanMode = () => {
    if (!permission?.granted) {
      return (
        <SafeAreaView style={styles.container}>
          <View style={styles.permissionContainer}>
            <Text style={styles.permissionText}>Camera permission needed to scan QR codes</Text>
            <Button title="Grant Permission" onPress={requestPermission} />
            <Button title={t('add_account.manual')} onPress={() => setMode('manual')} variant="secondary" style={{ marginTop: 12 }} />
          </View>
        </SafeAreaView>
      )
    }
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.scanHeader}>
          <TouchableOpacity onPress={() => setMode('manual')}>
            <Text style={styles.closeText}>x</Text>
          </TouchableOpacity>
          <Text style={styles.scanTitle}>{t('add_account.scan_qr')}</Text>
          <View style={{ width: 24 }} />
        </View>
        <CameraView
          style={styles.camera}
          facing="back"
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        />
      </SafeAreaView>
    )
  }

  const renderManualMode = () => (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.closeText}>x</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('add_account.title')}</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.modeToggle}>
        <TouchableOpacity
          style={[styles.modeButton, mode === 'manual' && styles.modeActive]}
          onPress={() => setMode('manual')}
        >
          <Text style={[styles.modeText, mode === 'manual' && styles.modeTextActive]}>{t('add_account.manual')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modeButton, mode === 'scan' && styles.modeActive]}
          onPress={() => { setScanned(false); setMode('scan') }}
        >
          <Text style={[styles.modeText, mode === 'scan' && styles.modeTextActive]}>{t('add_account.scan_qr')}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.form}>
        <TextInput style={styles.input} placeholder={t('add_account.issuer')} placeholderTextColor="#64748b" value={issuer} onChangeText={setIssuer} />
        <TextInput style={styles.input} placeholder={t('add_account.account_name')} placeholderTextColor="#64748b" value={accountName} onChangeText={setAccountName} />
        <TextInput style={[styles.input, styles.secretInput]} placeholder={t('add_account.secret_key')} placeholderTextColor="#64748b" value={secret} onChangeText={setSecret} autoCapitalize="characters" multiline />
        <View style={styles.row}>
          <TextInput style={[styles.input, styles.smallInput]} placeholder="Digits" placeholderTextColor="#64748b" value={digits} onChangeText={setDigits} keyboardType="number-pad" />
          <TextInput style={[styles.input, styles.smallInput]} placeholder="Period" placeholderTextColor="#64748b" value={period} onChangeText={setPeriod} keyboardType="number-pad" />
        </View>
        <Button title={t('add_account.save')} onPress={handleSave} fullWidth size="lg" disabled={!issuer || !secret} />
      </View>
    </SafeAreaView>
  )

  return mode === 'scan' ? renderScanMode() : renderManualMode()
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16 },
  headerTitle: { color: '#f1f5f9', fontSize: 17, fontWeight: '600' },
  closeText: { color: '#f1f5f9', fontSize: 22 },
  modeToggle: { flexDirection: 'row', marginHorizontal: 16, backgroundColor: '#1e293b', borderRadius: 12, padding: 4, marginBottom: 16 },
  modeButton: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  modeActive: { backgroundColor: '#6366f1' },
  modeText: { color: '#64748b', fontSize: 13, fontWeight: '500' },
  modeTextActive: { color: '#fff' },
  form: { paddingHorizontal: 16, flex: 1 },
  input: { backgroundColor: '#1e293b', borderRadius: 12, height: 48, paddingHorizontal: 16, color: '#f1f5f9', fontSize: 15, marginBottom: 12, borderWidth: 1, borderColor: '#334155' },
  secretInput: { height: 80, paddingTop: 14 },
  row: { flexDirection: 'row', gap: 12 },
  smallInput: { flex: 1 },
  scanHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16 },
  scanTitle: { color: '#f1f5f9', fontSize: 17, fontWeight: '600' },
  camera: { flex: 1, margin: 16, borderRadius: 16, overflow: 'hidden' },
  permissionContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, gap: 16 },
  permissionText: { color: '#94a3b8', fontSize: 14, textAlign: 'center' },
})
