'use client'

import { Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { setToken } from '@/lib/auth'

function CallbackHandler() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const token = searchParams.get('token')
    if (!token) {
      router.replace('/login?error=missing_code')
      return
    }
    setToken(token)
    router.replace('/projects')
  }, [router, searchParams])

  return null
}

export default function AuthCallbackPage() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <Suspense fallback={null}>
        <CallbackHandler />
      </Suspense>
      <p className="text-sm text-gray-400">Signing you in…</p>
    </main>
  )
}
