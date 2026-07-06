import { ref, watchEffect } from 'vue'

const theme = ref<'light' | 'dark'>(
  (localStorage.getItem('theme') as 'light' | 'dark') ??
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'),
)

export function useTheme() {
  watchEffect(() => {
    document.documentElement.classList.toggle('dark', theme.value === 'dark')
    localStorage.setItem('theme', theme.value)
  })

  function toggle() {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
  }

  return { theme, toggle }
}
