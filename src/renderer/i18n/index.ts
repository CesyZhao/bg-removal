import zh from './languages/zh'
import en from './languages/en'
import { createI18n } from 'vue-i18n'

const messages = {
  zh,
  en
}

export default createI18n({
  messages,
  locale: 'zh',
  fallbackLocale: 'en'
})
