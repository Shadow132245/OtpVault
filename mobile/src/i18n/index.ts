import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { getLocales } from 'expo-localization'
import en from './en.json'
import ar from './ar.json'

const getDeviceLanguage = (): string => {
  try {
    const locales = getLocales()
    return locales[0]?.languageCode === 'ar' ? 'ar' : 'en'
  } catch {
    return 'en'
  }
}

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ar: { translation: ar },
  },
  lng: getDeviceLanguage(),
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  compatibilityJSON: 'v4',
})

export default i18n
