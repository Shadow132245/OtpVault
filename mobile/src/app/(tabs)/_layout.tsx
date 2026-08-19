import { Tabs } from 'expo-router'
import { useTranslation } from 'react-i18next'

export default function TabLayout() {
  const { t } = useTranslation()

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: '#0f172a', borderTopColor: '#1e293b', borderTopWidth: 1 },
        tabBarActiveTintColor: '#6366f1',
        tabBarInactiveTintColor: '#475569',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('accounts.title'),
          tabBarLabel: t('accounts.title'),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t('settings.title'),
          tabBarLabel: t('settings.title'),
        }}
      />
      <Tabs.Screen
        name="sync"
        options={{
          title: t('sync.title'),
          tabBarLabel: t('sync.title'),
        }}
      />
    </Tabs>
  )
}
