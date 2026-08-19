import { useEffect, useState } from 'react'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { ActivityIndicator, View, StyleSheet } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import * as SplashScreen from 'expo-splash-screen'
import { useFonts } from 'expo-font'
import { useVault } from '@/hooks/useVault'
import { useAuthStore } from '@/stores/useAuthStore'
import '@/i18n'

SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const vault = useVault()
  const store = useAuthStore()
  const [ready, setReady] = useState(false)
  const [fontsLoaded] = useFonts({})

  useEffect(() => {
    const load = async () => {
      await vault.init()
      setReady(true)
      if (fontsLoaded) await SplashScreen.hideAsync()
    }
    load()
  }, [fontsLoaded])

  useEffect(() => {
    if (ready && store.isUnlocked) {
      SplashScreen.hideAsync()
    }
  }, [ready, store.isUnlocked])

  if (!ready || !fontsLoaded) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    )
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="add-account" options={{ presentation: 'modal' }} />
        <Stack.Screen name="help" options={{ presentation: 'modal' }} />
      </Stack>
    </GestureHandlerRootView>
  )
}

const styles = StyleSheet.create({
  loading: { flex: 1, backgroundColor: '#0f172a', alignItems: 'center', justifyContent: 'center' },
})
