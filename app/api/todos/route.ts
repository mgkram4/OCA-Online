import { prisma } from '@/lib/db/prisma'
import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const completed = searchParams.get('completed')
    const category = searchParams.get('category')

    const where: {
      userId: string
      completed?: boolean
      category?: string
    } = {
      userId: userId
    }

    if (completed !== null) {
      where.completed = completed === 'true'
    }

    if (category) {
      where.category = category
    }

    const todos = await prisma.todo.findMany({
      where,
      orderBy: [
        { completed: 'asc' },
        { dueDate: 'asc' },
        { createdAt: 'desc' }
      ]
    })

    return NextResponse.json(todos)
  } catch (error) {
    console.error('Error fetching todos:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, priority, dueDate, category } = body

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    const todo = await prisma.todo.create({
      data: {
        userId: userId,
        title,
        description,
        priority: priority || 'medium',
        dueDate: dueDate ? new Date(dueDate) : null,
        category: category || 'personal'
      }
    })

    return NextResponse.json(todo)
  } catch (error) {
    console.error('Error creating todo:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 