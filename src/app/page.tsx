'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { isAuthenticated } from '@/lib/auth'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    router.replace(isAuthenticated() ? '/projects' : '/login')
  }, [router])

  return null
}
