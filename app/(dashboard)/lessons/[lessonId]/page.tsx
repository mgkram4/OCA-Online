import { AIChatBot } from '@/components/ai-chat/AIChatBot'
import { LessonContent } from '@/components/lessons/LessonContent'
import { LessonNavigation } from '@/components/lessons/LessonNavigation'
import { ProgressTracker } from '@/components/progress/ProgressTracker'

export default async function LessonPage({ params }: { params: Promise<{ lessonId: string }> }) {
  const { lessonId } = await params
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto p-6">
        <ProgressTracker />
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-6">
          <div className="lg:col-span-3">
            <LessonContent lessonId={lessonId} />
          </div>
          
          <div className="lg:col-span-1">
            <LessonNavigation lessonId={lessonId} />
          </div>
        </div>
      </div>
      
      <AIChatBot />
    </div>
  )
} 