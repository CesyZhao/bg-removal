import zhCN from './languages/zh'
import en from './languages/en'
import { createI18n } from 'vue-i18n'

const messages = {
  zhCN,
  en
}

export default createI18n({
  messages,
  locale: 'zhCN',
  fallbackLocale: 'enUS'
})
