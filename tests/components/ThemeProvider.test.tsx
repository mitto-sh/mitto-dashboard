import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ThemeProvider, useThemeContext } from '@/components/ThemeProvider'
import { BONE_THEME, GRAPHITE_THEME, getStoredTheme } from '@/lib/theme'
import { getStoredLang } from '@/lib/i18n'

function Probe() {
  const { mode, theme, toggleTheme, lang, dict, toggleLang } = useThemeContext()
  return (
    <div>
      <span data-testid="mode">{mode}</span>
      <span data-testid="canvas">{theme.canvas}</span>
      <span data-testid="lang">{lang}</span>
      <span data-testid="label">{dict.addService}</span>
      <button onClick={toggleTheme}>toggle theme</button>
      <button onClick={toggleLang}>toggle lang</button>
    </div>
  )
}

describe('ThemeProvider', () => {
  it('throws when useThemeContext is used outside a provider', () => {
    const Bare = () => {
      useThemeContext()
      return null
    }
    expect(() => render(<Bare />)).toThrow('useThemeContext must be used within a ThemeProvider')
  })

  it('defaults to bone theme and English', async () => {
    render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>,
    )
    await waitFor(() => expect(screen.getByTestId('mode')).toHaveTextContent('bone'))
    expect(screen.getByTestId('canvas')).toHaveTextContent(BONE_THEME.canvas)
    expect(screen.getByTestId('lang')).toHaveTextContent('en')
    expect(screen.getByTestId('label')).toHaveTextContent('Add service')
  })

  it('toggles theme and persists it', async () => {
    render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>,
    )
    await waitFor(() => screen.getByTestId('mode'))

    fireEvent.click(screen.getByText('toggle theme'))

    await waitFor(() => expect(screen.getByTestId('mode')).toHaveTextContent('graphite'))
    expect(screen.getByTestId('canvas')).toHaveTextContent(GRAPHITE_THEME.canvas)
    expect(getStoredTheme()).toBe('graphite')
  })

  it('toggles language and persists it', async () => {
    render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>,
    )
    await waitFor(() => screen.getByTestId('lang'))

    fireEvent.click(screen.getByText('toggle lang'))

    await waitFor(() => expect(screen.getByTestId('lang')).toHaveTextContent('es'))
    expect(screen.getByTestId('label')).toHaveTextContent('Agregar servicio')
    expect(getStoredLang()).toBe('es')
  })
})
