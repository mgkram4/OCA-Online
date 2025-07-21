'use client'

import { useAuth } from '@clerk/nextjs'
import { GraduationCap } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function SSOCallbackPage() {
  const { isLoaded, isSignedIn } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isLoaded) {
      if (isSignedIn) {
        // Redirect to dashboard after successful SSO
        router.push('/dashboard')
      } else {
        // Redirect to login if SSO failed
        router.push('/login')
      }
    }
  }, [isLoaded, isSignedIn, router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <GraduationCap className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">OCA WebSchool</h1>
        </div>
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Completing Sign In</h2>
          <p className="text-gray-600">Please wait while we complete your authentication...</p>
        </div>
      </div>
    </div>
  )
} 