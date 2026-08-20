import { describe, it, expect } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import { ThemeLangToggle } from '@/components/ThemeLangToggle'
import { renderWithTheme } from '../helpers/renderWithTheme'
import { setToken } from '@/lib/auth'

describe('ThemeLangToggle', () => {
  it('renders theme and language controls', () => {
    renderWithTheme(<ThemeLangToggle />)
    expect(screen.getByLabelText('Toggle theme')).toBeInTheDocument()
    expect(screen.getByLabelText('Toggle language')).toBeInTheDocument()
  })

  it('toggles language label between EN and ES', () => {
    renderWithTheme(<ThemeLangToggle />)
    const langButton = screen.getByLabelText('Toggle language')
    fireEvent.click(langButton)
    expect(langButton).toHaveTextContent('EN')

    fireEvent.click(langButton)
    expect(langButton).toHaveTextContent('ES')
  })

  it('toggles theme without crashing', () => {
    renderWithTheme(<ThemeLangToggle />)
    fireEvent.click(screen.getByLabelText('Toggle theme'))
    expect(screen.getByLabelText('Toggle theme')).toBeInTheDocument()
  })

  it('renders nothing once the user is authenticated', () => {
    setToken('a-token')
    renderWithTheme(<ThemeLangToggle />)
    expect(screen.queryByLabelText('Toggle theme')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Toggle language')).not.toBeInTheDocument()
  })
})
