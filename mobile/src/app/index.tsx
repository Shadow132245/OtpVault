import { useState, useEffect } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native'
import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/stores/useAuthStore'
import { useVault } from '@/hooks/useVault'
import { useBiometrics } from '@/hooks/useBiometrics'
import { Button } from '@/components/ui/Button'

export default function AuthScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const vault = useVault()
  const store = useAuthStore()
  const biometrics = useBiometrics()

  const [tab, setTab] = useState<'signup' | 'signin'>(store.isInitialized ? 'signin' : 'signup')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [bioAvailable, setBioAvailable] = useState(false)

  useEffect(() => {
    biometrics.isAvailable().then(setBioAvailable)
  }, [])

  const handleSignUp = async () => {
    if (!email || password.length < 4) {
      Alert.alert(t('common.error'), 'Password must be at least 4 characters')
      return
    }
    setLoading(true)
    try {
      await vault.signUp(email, password)
      await vault.saveRememberMe(email, password)
      router.replace('/(tabs)')
    } catch (e: any) {
      Alert.alert(t('common.error'), e.message || 'Sign up failed')
    }
    setLoading(false)
  }

  const handleSignIn = async () => {
    if (!email || !password) return
    setLoading(true)
    try {
      const ok = await vault.signIn(email, password)
      if (ok) {
        await vault.saveRememberMe(email, password)
        router.replace('/(tabs)')
      } else {
        Alert.alert(t('common.error'), t('vault.wrong_credentials'))
      }
    } catch (e: any) {
      Alert.alert(t('common.error'), e.message || 'Sign in failed')
    }
    setLoading(false)
  }

  const handleBiometricUnlock = async () => {
    setLoading(true)
    try {
      const ok = await vault.unlockWithBiometrics()
      if (ok) {
        router.replace('/(tabs)')
      } else {
        Alert.alert(t('common.error'), t('vault.wrong_credentials'))
      }
    } catch (e: any) {
      Alert.alert(t('common.error'), e.message || 'Biometric unlock failed')
    }
    setLoading(false)
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.content}>
        <View style={styles.logoSection}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>OV</Text>
          </View>
          <Text style={styles.title}>OtpVault</Text>
          <Text style={styles.subtitle}>{t('onboarding.subtitle')}</Text>
        </View>

        <View style={styles.tabBar}>
          <TouchableOpacity style={[styles.tab, tab === 'signup' && styles.tabActive]} onPress={() => setTab('signup')}>
            <Text style={[styles.tabText, tab === 'signup' && styles.tabTextActive]}>{t('auth.sign_up_tab')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tab, tab === 'signin' && styles.tabActive]} onPress={() => setTab('signin')}>
            <Text style={[styles.tabText, tab === 'signin' && styles.tabTextActive]}>{t('auth.log_in_tab')}</Text>
          </TouchableOpacity>
        </View>

        <TextInput style={styles.input} placeholder="Email" placeholderTextColor="#64748b" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} />
        <TextInput style={styles.input} placeholder="Password" placeholderTextColor="#64748b" value={password} onChangeText={setPassword} secureTextEntry />

        <Button title={tab === 'signup' ? t('onboarding.create_vault_btn') : t('vault.unlock')} onPress={tab === 'signup' ? handleSignUp : handleSignIn} loading={loading} disabled={!email || !password} fullWidth size="lg" />

        {store.biometricsEnabled && bioAvailable && (
          <Button title={t('auth.unlock_with_biometrics')} onPress={handleBiometricUnlock} variant="secondary" fullWidth size="lg" loading={loading} style={{ marginTop: 10 }} />
        )}

        <TouchableOpacity style={styles.switchTab} onPress={() => setTab(tab === 'signup' ? 'signin' : 'signup')}>
          <Text style={styles.switchTabText}>{tab === 'signup' ? t('auth.have_account') : t('auth.no_account')}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: 24, maxWidth: 400, width: '100%', alignSelf: 'center' },
  logoSection: { alignItems: 'center', marginBottom: 40 },
  logo: { width: 64, height: 64, borderRadius: 18, backgroundColor: '#6366f1', alignItems: 'center', justifyContent: 'center', marginBottom: 16, shadowColor: '#6366f1', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 },
  logoText: { color: '#fff', fontSize: 24, fontWeight: '800' },
  title: { color: '#f1f5f9', fontSize: 26, fontWeight: '700', marginBottom: 6 },
  subtitle: { color: '#64748b', fontSize: 14 },
  tabBar: { flexDirection: 'row', backgroundColor: '#1e293b', borderRadius: 12, padding: 4, marginBottom: 24 },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  tabActive: { backgroundColor: '#334155' },
  tabText: { color: '#64748b', fontSize: 14, fontWeight: '500' },
  tabTextActive: { color: '#f1f5f9' },
  input: { backgroundColor: '#1e293b', borderRadius: 12, height: 48, paddingHorizontal: 16, color: '#f1f5f9', fontSize: 15, marginBottom: 12, borderWidth: 1, borderColor: '#334155' },
  switchTab: { alignItems: 'center', marginTop: 20 },
  switchTabText: { color: '#6366f1', fontSize: 13 },
})
