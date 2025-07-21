import { prisma } from '@/lib/db/prisma'
import { NextRequest } from 'next/server'

export interface AuthUser {
  userId: string
  email: string
  role: string
  name: string
}

export async function getUser(req: NextRequest): Promise<AuthUser | null> {
  try {
    // Get user info from middleware headers
    const userId = req.headers.get('x-user-id')
    const email = req.headers.get('x-user-email')
    const role = req.headers.get('x-user-role')
    const name = req.headers.get('x-user-name')

    if (!userId || !email || !role) {
      return null
    }

    return {
      userId,
      email,
      role,
      name: name || ''
    }
  } catch (error) {
    console.error('Error getting user from request:', error)
    return null
  }
}

export async function getUserFromDb(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        gradeLevel: true,
        gpa: true,
        totalCredits: true
      }
    })
    return user
  } catch (error) {
    console.error('Error getting user from database:', error)
    return null
  }
} 