import type { Metadata } from 'next'
import { Space_Grotesk, IBM_Plex_Mono } from 'next/font/google'
import { ThemeProvider } from '@/components/ThemeProvider'
import { ThemeLangToggle } from '@/components/ThemeLangToggle'
import './globals.css'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-sans',
  display: 'swap',
})

const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Mitto',
  description: 'Deploy without managing infrastructure',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${plexMono.variable}`}>
      <body className="font-sans">
        <ThemeProvider>
          {children}
          <ThemeLangToggle />
        </ThemeProvider>
      </body>
    </html>
  )
}
