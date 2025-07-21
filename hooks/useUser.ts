import { useAuthStore } from '@/store/useAuthStore'
import { useUser as useClerkUser } from '@clerk/nextjs'
import React from 'react'

export function useUser() {
  const { user: clerkUser, isLoaded, isSignedIn } = useClerkUser()
  const { user, setUser, logout } = useAuthStore()

  // Sync Clerk user with store
  React.useEffect(() => {
    if (clerkUser && isSignedIn) {
      // Transform Clerk user to match our expected user format
      const transformedUser = {
        id: clerkUser.id,
        email: clerkUser.emailAddresses[0]?.emailAddress || '',
        name: clerkUser.fullName || clerkUser.firstName || '',
        role: clerkUser.publicMetadata?.role as string || 'STUDENT',
        gradeLevel: clerkUser.publicMetadata?.gradeLevel as number || 9,
        gpa: clerkUser.publicMetadata?.gpa as number || 0,
        totalCredits: clerkUser.publicMetadata?.totalCredits as number || 0,
      }
      setUser(transformedUser)
    } else if (!isSignedIn && user) {
      logout()
    }
  }, [clerkUser, isSignedIn, user, setUser, logout])

  return {
    user: user,
    isLoading: !isLoaded,
    isAuthenticated: isSignedIn,
  }
} 