import { prisma } from '@/lib/db/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const { courseId } = await params
  
  try {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        modules: {
          include: {
            lessons: {
              orderBy: {
                order: 'asc'
              }
            }
          },
          orderBy: {
            order: 'asc'
          }
        }
      }
    })

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    // Calculate total lessons and preview lessons (first lesson of each module)
    const totalLessons = course.modules.reduce((sum, module) => sum + module.lessons.length, 0)
    const previewLessons = course.modules.length // One preview lesson per module

    // Format lessons with preview status
    const modulesWithPreview = course.modules.map((module, moduleIndex) => ({
      id: module.id,
      title: module.title,
      order: module.order,
      lessons: module.lessons.map((lesson, lessonIndex) => ({
        id: lesson.id,
        title: lesson.title,
        order: lesson.order,
        duration: lesson.duration,
        preview: lessonIndex === 0 // First lesson of each module is preview
      }))
    }))

    return NextResponse.json({
      id: course.id,
      title: course.title,
      description: course.description,
      subject: course.subject,
      credits: course.credits,
      modules: modulesWithPreview,
      totalLessons,
      previewLessons
    })
  } catch (error) {
    console.error('Error fetching course preview:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 