'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { githubLoginUrl } from '@/lib/api'
import { Logo } from '@/components/Logo'
import { useThemeContext } from '@/components/ThemeProvider'

const ERROR_MESSAGES: Record<string, string> = {
  missing_code: 'GitHub did not send back an authorization code. Try again.',
  oauth_failed: 'GitHub rejected the login request. Try again.',
  no_verified_email: 'Your GitHub account needs a verified primary email.',
}

function LoginError() {
  const { theme } = useThemeContext()
  const searchParams = useSearchParams()
  const errorCode = searchParams.get('error')
  const errorMessage = errorCode ? (ERROR_MESSAGES[errorCode] ?? 'Something went wrong logging in.') : null

  if (!errorMessage) return null

  return (
    <p
      role="alert"
      className="flex items-center gap-[10px] rounded-lg border px-4 py-[10px] text-caption"
      style={{ borderColor: theme.dangerBorder, backgroundColor: theme.dangerBg, color: theme.danger }}
    >
      <span className="h-[6px] w-[6px] flex-none rounded-full" style={{ backgroundColor: theme.danger }} />
      {errorMessage}
    </p>
  )
}

export default function LoginPage() {
  const { theme } = useThemeContext()

  return (
    <main
      className="relative flex min-h-screen flex-col items-center justify-center gap-7 overflow-hidden px-4"
      style={{
        backgroundImage: `radial-gradient(circle, ${theme.subtle} 1px, transparent 1px)`,
        backgroundSize: '28px 28px',
      }}
    >
      <div
        className="pointer-events-none absolute -bottom-[220px] left-1/2 h-[400px] w-[640px] -translate-x-1/2"
        style={{ background: `radial-gradient(ellipse at center, ${theme.accent}22, transparent 65%)` }}
      />

      <div className="flex flex-col items-center gap-5">
        <div className="flex h-10 w-10 items-center justify-center">
          <Logo size={22} glow />
        </div>
        <div className="text-center">
          <h1 className="font-mono text-[26px] font-medium tracking-tight" style={{ color: theme.ink }}>mitto</h1>
          <p className="mt-[10px] text-sm leading-5" style={{ color: theme.sec }}>
            Deploy without managing infrastructure.
          </p>
        </div>
      </div>

      <Suspense fallback={null}>
        <LoginError />
      </Suspense>

      <a
        href={githubLoginUrl()}
        className="inline-flex items-center gap-[10px] rounded-lg px-[22px] py-[11px] text-sm font-semibold transition-all hover:-translate-y-px"
        style={{ backgroundColor: theme.ink, color: theme.canvas }}
      >
        Sign in with GitHub
      </a>

      <p className="absolute bottom-7 font-mono text-label" style={{ color: theme.faint }}>
        open source · self-hostable
      </p>
    </main>
  )
}
