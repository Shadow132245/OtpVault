import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import Clipboard from '@react-native-clipboard/clipboard'
import { useState, useEffect, useRef } from 'react'
import { generateCode } from '@/services/totp'
import type { AccountEntry } from '@/types'

interface AccountCardProps {
  account: AccountEntry
  onDelete?: (id: string) => void
}

export function AccountCard({ account, onDelete }: AccountCardProps) {
  const [code, setCode] = useState('------')
  const [remaining, setRemaining] = useState(0)
  const [copied, setCopied] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval>>(undefined)

  const updateCode = () => {
    const result = generateCode(account.secretEncrypted, account.digits, account.step)
    setCode(result.code)
    setRemaining(result.remaining)
  }

  useEffect(() => {
    updateCode()
    timerRef.current = setInterval(updateCode, 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [account])

  const handleCopy = () => {
    Clipboard.setString(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const progress = remaining / account.step
  const circleColor = remaining < 5 ? '#ef4444' : remaining < 10 ? '#f59e0b' : '#22c55e'

  return (
    <TouchableOpacity onLongPress={() => onDelete?.(account.id)} style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Text style={styles.iconText}>{account.issuer.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={styles.headerText}>
          <Text style={styles.issuer}>{account.issuer}</Text>
          <Text style={styles.accountName}>{account.accountName}</Text>
        </View>
      </View>

      <TouchableOpacity onPress={handleCopy} style={styles.codeRow}>
        <Text style={styles.code}>{code}</Text>
        <View style={[styles.timerCircle, { borderColor: circleColor }]} />
      </TouchableOpacity>

      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${(remaining / account.step) * 100}%`, backgroundColor: circleColor }]} />
      </View>

      {copied && <Text style={styles.copied}>Copied!</Text>}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#1e293b', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#334155' },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  iconContainer: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#6366f1', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  iconText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  headerText: { flex: 1 },
  issuer: { color: '#f1f5f9', fontSize: 15, fontWeight: '600' },
  accountName: { color: '#94a3b8', fontSize: 13, marginTop: 1 },
  codeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  code: { color: '#f1f5f9', fontSize: 28, fontWeight: '700', letterSpacing: 2 },
  timerCircle: { width: 36, height: 36, borderRadius: 18, borderWidth: 3 },
  progressBar: { height: 4, backgroundColor: '#334155', borderRadius: 2, marginTop: 10, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 2 },
  copied: { color: '#22c55e', fontSize: 12, marginTop: 4, textAlign: 'right' },
})
