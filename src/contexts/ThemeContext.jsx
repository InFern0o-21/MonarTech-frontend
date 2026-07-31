import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext(null)

export const THEMES = {
  imperial: 'imperial',  // luxury dark — default
  modern:   'modern',    // indigo/violet SaaS
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('monartech-theme') ?? THEMES.imperial
  })

  useEffect(() => {
    const root = document.documentElement
    // Remove all theme classes first
    Object.values(THEMES).forEach(t => root.classList.remove(`theme-${t}`))
    // Apply current theme class (imperial has no class — it's the CSS default)
    if (theme !== THEMES.imperial) {
      root.classList.add(`theme-${theme}`)
    }
    localStorage.setItem('monartech-theme', theme)
  }, [theme])

  function toggleTheme() {
    setTheme(t => t === THEMES.imperial ? THEMES.modern : THEMES.imperial)
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
