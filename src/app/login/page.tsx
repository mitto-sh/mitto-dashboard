'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { githubLoginUrl } from '@/lib/api'

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
    <p role="alert" className="rounded-md border border-red-800 bg-red-950/50 px-4 py-2 text-sm text-red-300">
      {errorMessage}
    </p>
  )
}

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-4">
      <div className="text-center">
        <h1 className="text-3xl font-semibold tracking-tight">Mitto</h1>
        <p className="mt-2 text-sm text-gray-400">Deploy without managing infrastructure.</p>
      </div>

      <Suspense fallback={null}>
        <LoginError />
      </Suspense>

      <a
        href={githubLoginUrl()}
        className="rounded-md bg-white px-5 py-2.5 text-sm font-medium text-gray-900 transition hover:bg-gray-200"
      >
        Sign in with GitHub
      </a>
    </main>
  )
}
