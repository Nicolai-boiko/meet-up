import { createI18n } from 'vue-i18n'
import ru from '../locales/ru.json'
import en from '../locales/en.json'

const saved = localStorage.getItem('locale')
const locale = saved && ['ru', 'en'].includes(saved) ? saved : 'ru'

export const i18n = createI18n({
  legacy: false,
  locale,
  fallbackLocale: 'ru',
  messages: { ru, en },
})

export function setLocale(lang: 'ru' | 'en') {
  i18n.global.locale.value = lang
  localStorage.setItem('locale', lang)
}
