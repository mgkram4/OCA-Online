import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthState {
  user: {
    id: string
    email: string
    name?: string | null
    role: string
    gradeLevel?: number
    gpa?: number
    totalCredits: number
  } | null
  isAuthenticated: boolean
  setUser: (user: AuthState['user']) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      setUser: (user) => {
        const currentUser = get().user
        // Only update if the user is actually different
        if (JSON.stringify(currentUser) !== JSON.stringify(user)) {
          set({ user, isAuthenticated: !!user })
        }
      },
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage',
    }
  )
) 