import { render, type RenderResult } from '@testing-library/react'
import { ThemeProvider } from '@/components/ThemeProvider'

export function renderWithTheme(ui: React.ReactElement): RenderResult {
  return render(<ThemeProvider>{ui}</ThemeProvider>)
}
