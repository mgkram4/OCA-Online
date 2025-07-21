import { prisma } from '@/lib/db/prisma'
import bcrypt from 'bcryptjs'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  role: z.enum(['STUDENT', 'TEACHER', 'ADMIN', 'PARENT']).default('STUDENT'),
  gradeLevel: z.number().min(9).max(12).optional(),
  dateOfBirth: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  emergencyContact: z.string().optional(),
  emergencyPhone: z.string().optional(),
  parentId: z.string().optional(),
}).refine((data) => {
  // Grade level is required for students
  if (data.role === 'STUDENT' && !data.gradeLevel) {
    return false
  }
  return true
}, {
  message: "Grade level is required for students",
  path: ["gradeLevel"]
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = registerSchema.parse(body)

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Validate parent relationship if parentId is provided
    if (validatedData.parentId) {
      const parent = await prisma.user.findUnique({
        where: { id: validatedData.parentId }
      })

      if (!parent || parent.role !== 'PARENT') {
        return NextResponse.json(
          { error: 'Invalid parent ID' },
          { status: 400 }
        )
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 12)

    // Prepare user data
    const userData: {
      email: string
      name: string
      hashedPassword: string
      role: string
      dateOfBirth: Date | null
      phone?: string
      address?: string
      emergencyContact?: string
      emergencyPhone?: string
      parentId?: string
      gpa: number
      totalCredits: number
      gradeLevel?: number
    } = {
      email: validatedData.email,
      name: validatedData.name,
      hashedPassword,
      role: validatedData.role,
      dateOfBirth: validatedData.dateOfBirth ? new Date(validatedData.dateOfBirth) : null,
      phone: validatedData.phone,
      address: validatedData.address,
      emergencyContact: validatedData.emergencyContact,
      emergencyPhone: validatedData.emergencyPhone,
      parentId: validatedData.parentId,
      gpa: 0.0,
      totalCredits: 0,
    }

    // Only add gradeLevel for students
    if (validatedData.role === 'STUDENT' && validatedData.gradeLevel) {
      userData.gradeLevel = validatedData.gradeLevel
    }

    // Create user
    const user = await prisma.user.create({
      data: userData
    })

    // Remove password from response
    const { hashedPassword: _, ...userWithoutPassword } = user

    return NextResponse.json({
      message: 'User created successfully',
      user: userWithoutPassword
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    )
  }
} 