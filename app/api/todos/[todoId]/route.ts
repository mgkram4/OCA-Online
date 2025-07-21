import { prisma } from '@/lib/db/prisma'
import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'

export async function PUT(
  request: NextRequest,
  { params }: { params: { todoId: string } }
) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, completed, priority, dueDate, category } = body

    const todo = await prisma.todo.findFirst({
      where: {
        id: params.todoId,
        userId: userId
      }
    })

    if (!todo) {
      return NextResponse.json({ error: 'Todo not found' }, { status: 404 })
    }

    const updatedTodo = await prisma.todo.update({
      where: { id: params.todoId },
      data: {
        title: title !== undefined ? title : todo.title,
        description: description !== undefined ? description : todo.description,
        completed: completed !== undefined ? completed : todo.completed,
        priority: priority !== undefined ? priority : todo.priority,
        dueDate: dueDate !== undefined ? (dueDate ? new Date(dueDate) : null) : todo.dueDate,
        category: category !== undefined ? category : todo.category
      }
    })

    return NextResponse.json(updatedTodo)
  } catch (error) {
    console.error('Error updating todo:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { todoId: string } }
) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const todo = await prisma.todo.findFirst({
      where: {
        id: params.todoId,
        userId: userId
      }
    })

    if (!todo) {
      return NextResponse.json({ error: 'Todo not found' }, { status: 404 })
    }

    await prisma.todo.delete({
      where: { id: params.todoId }
    })

    return NextResponse.json({ message: 'Todo deleted successfully' })
  } catch (error) {
    console.error('Error deleting todo:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 