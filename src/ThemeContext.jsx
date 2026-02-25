import { createContext, useContext, useState, useEffect } from 'react'

const THEMES = [
  { id: 'default', label: 'Warm Cream (default)' },
  { id: 'ocean-breeze', label: 'Ocean Breeze' },
  { id: 'forest-grove', label: 'Forest Grove' },
  { id: 'neon-playground', label: 'Neon Playground' },
]

const STORAGE_KEY = 'gamichore-theme'

function getStoredTheme() {
  try {
    const t = localStorage.getItem(STORAGE_KEY)
    if (t && THEMES.some((x) => x.id === t)) return t
  } catch (_) {}
  return 'default'
}

function applyTheme(themeId) {
  document.documentElement.dataset.theme = themeId === 'default' ? '' : themeId
}

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(getStoredTheme)

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  function setTheme(id) {
    localStorage.setItem(STORAGE_KEY, id)
    setThemeState(id)
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
