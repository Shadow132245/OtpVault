import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function HelpScreen() {
  const { t, i18n } = useTranslation()
  const router = useRouter()
  const lang = i18n.language as 'en' | 'ar'

  const guides: Record<string, { title: string; content: string }[]> = {
    en: [
      { title: 'Getting Started', content: 'Create a vault with your email and a strong password. This encrypts all your 2FA codes.' },
      { title: 'Adding Accounts', content: 'Tap the + button and scan a QR code or enter the secret key manually.' },
      { title: 'Using Codes', content: 'Tap a code to copy it. Each code refreshes every 30 seconds.' },
      { title: 'Cloud Sync', content: 'Sign in on multiple devices with the same email. Your vault syncs automatically.' },
      { title: 'Security', content: 'Your vault is encrypted with AES-256-GCM. The encryption key never leaves your device.' },
      { title: 'Backup', content: 'Your vault is backed up to the cloud. Sign in on a new device to restore your codes.' },
    ],
    ar: [
      { title: 'البداية', content: 'أنشئ خزنة باستخدام بريدك الإلكتروني وكلمة مرور قوية. هذا يشفر جميع أكواد 2FA.' },
      { title: 'إضافة حسابات', content: 'اضغط على + وامسح رمز QR أو أدخل المفتاح السري يدويًا.' },
      { title: 'استخدام الأكواد', content: 'اضغط على الكود لنسخه. يتجدد كل 30 ثانية.' },
      { title: 'المزامنة السحابية', content: 'سجل الدخول من أجهزة متعددة بنفس البريد. الخزنة تُزامن تلقائيًا.' },
      { title: 'الأمان', content: 'خزنتك مشفرة بـ AES-256-GCM. مفتاح التشفير لا يغادر جهازك أبدًا.' },
      { title: 'النسخ الاحتياطي', content: 'الخزنة تُنسخ احتياطيًا إلى السحابة. سجل الدخول من جهاز جديد لاستعادة أكوادك.' },
    ],
  }

  const currentGuides = guides[lang] || guides.en

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.closeText}>x</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{t('settings.help')}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        {currentGuides.map((guide, i) => (
          <View key={i} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardIcon}>
                <Text style={styles.cardIconText}>{i + 1}</Text>
              </View>
              <Text style={styles.cardTitle}>{guide.title}</Text>
            </View>
            <Text style={styles.cardContent}>{guide.content}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16 },
  title: { color: '#f1f5f9', fontSize: 17, fontWeight: '600' },
  closeText: { color: '#f1f5f9', fontSize: 22 },
  content: { paddingHorizontal: 16 },
  card: { backgroundColor: '#1e293b', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#334155' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  cardIcon: { width: 28, height: 28, borderRadius: 8, backgroundColor: '#6366f1', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  cardIconText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  cardTitle: { color: '#f1f5f9', fontSize: 15, fontWeight: '600' },
  cardContent: { color: '#94a3b8', fontSize: 13, lineHeight: 20 },
})
