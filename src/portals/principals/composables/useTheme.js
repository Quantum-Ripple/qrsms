import { ref, watch } from 'vue'

const theme = ref(localStorage.getItem('theme') || 'light')

// Apply the theme on load
document.documentElement.classList.toggle('dark', theme.value === 'dark')

watch(theme, (newTheme) => {
  localStorage.setItem('theme', newTheme)
  document.documentElement.classList.toggle('dark', newTheme === 'dark')
})

export function useTheme() {
  function toggleTheme() {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
  }

  return { theme, toggleTheme }
}
