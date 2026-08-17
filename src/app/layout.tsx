import type { Metadata } from 'next'
import { IBM_Plex_Sans, IBM_Plex_Mono } from 'next/font/google'
import { ThemeProvider } from '@/components/ThemeProvider'
import { ThemeLangToggle } from '@/components/ThemeLangToggle'
import './globals.css'

const plexSans = IBM_Plex_Sans({
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
    <html lang="en" className={`${plexSans.variable} ${plexMono.variable}`}>
      <body className="font-sans">
        <ThemeProvider>
          {children}
          <ThemeLangToggle />
        </ThemeProvider>
      </body>
    </html>
  )
}
