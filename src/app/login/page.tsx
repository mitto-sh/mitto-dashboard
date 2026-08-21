'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { githubLoginUrl } from '@/lib/api'
import { Logo } from '@/components/Logo'

const ERROR_MESSAGES: Record<string, string> = {
  missing_code: 'GitHub did not send back an authorization code. Try again.',
  oauth_failed: 'GitHub rejected the login request. Try again.',
  no_verified_email: 'Your GitHub account needs a verified primary email.',
}

function LoginError() {
  const searchParams = useSearchParams()
  const errorCode = searchParams.get('error')
  const errorMessage = errorCode ? (ERROR_MESSAGES[errorCode] ?? 'Something went wrong logging in.') : null

  if (!errorMessage) return null

  return (
    <p
      role="alert"
      className="flex items-center gap-[10px] rounded-lg border border-danger-border bg-danger-bg px-4 py-[10px] text-caption text-danger"
    >
      <span className="h-[6px] w-[6px] flex-none rounded-full bg-danger" />
      {errorMessage}
    </p>
  )
}

export default function LoginPage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center gap-7 overflow-hidden bg-[image:radial-gradient(circle,var(--subtle)_1px,transparent_1px)] bg-[size:28px_28px] px-4">
      <div className="pointer-events-none absolute -bottom-[220px] left-1/2 h-[400px] w-[640px] -translate-x-1/2 bg-[image:var(--login-radial-glow)]" />

      <div className="flex flex-col items-center gap-5">
        <div className="flex h-10 w-10 items-center justify-center">
          <Logo size={22} glow />
        </div>
        <div className="text-center">
          <h1 className="font-mono text-[26px] font-medium tracking-tight text-ink">mitto</h1>
          <p className="mt-[10px] text-sm leading-5 text-ink-secondary">
            Deploy without managing infrastructure.
          </p>
        </div>
      </div>

      <Suspense fallback={null}>
        <LoginError />
      </Suspense>

      <a
        href={githubLoginUrl()}
        className="inline-flex items-center gap-[10px] rounded-lg bg-ink px-[22px] py-[11px] text-sm font-semibold text-canvas transition-all hover:-translate-y-px"
      >
        Sign in with GitHub
      </a>

      <p className="absolute bottom-7 font-mono text-label text-ink-faint">
        open source · self-hostable
      </p>
    </main>
  )
}
