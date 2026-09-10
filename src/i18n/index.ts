import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import en from './en.json'
import ar from './ar.json'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ar: { translation: ar },
    },
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    //
    // Engineered to start in English: the very first launch has no saved
    // language, so we ignore the device locale (navigator) and fall back to
    // 'en'. Once the user switches language the choice is persisted
    // (localStorage) and respected on later launches.
    detection: {
      order: ['localStorage'],
      caches: ['localStorage'],
    },
  })

export default i18n
