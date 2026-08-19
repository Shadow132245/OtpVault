import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle } from 'react-native'

interface ButtonProps {
  title: string
  onPress: () => void
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  fullWidth?: boolean
  style?: ViewStyle
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
}: ButtonProps) {
  const bgColor = variant === 'primary' ? '#6366f1' : variant === 'danger' ? '#ef4444' : '#334155'
  const height = size === 'sm' ? 40 : size === 'lg' ? 56 : 48

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[styles.button, { backgroundColor: disabled ? '#475569' : bgColor, height, opacity: disabled ? 0.6 : 1 }, fullWidth && { width: '100%' }, style]}
    >
      {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.text}>{title}</Text>}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button: { borderRadius: 12, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  text: { color: '#fff', fontSize: 15, fontWeight: '600' },
})
