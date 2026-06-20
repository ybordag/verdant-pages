import { ThemeProvider, useTheme } from '@/lib/theme/ThemeProvider'

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  return (
    <button onClick={toggleTheme} aria-label="Toggle theme">
      {theme === 'dark' ? 'Switch to light' : 'Switch to dark'}
    </button>
  )
}

function App() {
  return (
    <ThemeProvider>
      <div>
        <span>Verdant Pages</span>
        <ThemeToggle />
      </div>
    </ThemeProvider>
  )
}

export default App
