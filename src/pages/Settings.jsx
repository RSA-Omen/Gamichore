import { useTheme } from '../ThemeContext'
import './Settings.css'

export default function Settings() {
  const { theme, setTheme, themes } = useTheme()

  return (
    <div className="page settings-page">
      <h1>Settings</h1>
      <div className="settings-theme">
        <label htmlFor="theme-select">Theme</label>
        <select
          id="theme-select"
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
          className="settings-theme-select"
        >
          {themes.map((t) => (
            <option key={t.id} value={t.id}>{t.label}</option>
          ))}
        </select>
      </div>
    </div>
  )
}
