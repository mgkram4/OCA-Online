import { prisma } from '@/lib/db/prisma'
import { openai } from '@/lib/openai/client'
import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { messages, context } = await req.json()

  // Build system prompt with context
  const systemPrompt = `You are an AI learning assistant helping a high school student earn their diploma. 

Current Context:
- Location: ${context.location || 'Unknown page'}
- Course: ${context.currentCourse || 'Not in a course'}
- Module: ${context.currentModule || 'Not in a module'}
- Lesson: ${context.currentLesson || 'Not in a lesson'}
- Student Progress: ${JSON.stringify(context.userProgress)}

${context.lessonContent ? `Current Lesson Content: ${JSON.stringify(context.lessonContent)}` : ''}

${context.dashboardData ? `Dashboard Data: ${JSON.stringify(context.dashboardData)}` : ''}

Guidelines:
1. Be encouraging and supportive
2. Provide concise, clear answers (max 2-3 paragraphs)
3. Use proper formatting with **bold text**, bullet points, and clear sections
4. Structure responses with clear headings and organized information
5. Reference the current lesson content when relevant
6. Help with course planning, task management, and academic goals
7. Provide guidance on study strategies and time management
8. Answer questions about grades, progress, and graduation requirements
9. Suggest practice problems when appropriate
10. Celebrate progress and achievements
11. If on dashboard, help with task organization and course planning
12. Be flexible and helpful with any academic or personal concerns
13. Keep responses focused and to the point to avoid overwhelming the student
14. Use emojis sparingly but effectively to make responses more engaging
15. Format lists and important information clearly with proper spacing

Response Format Examples:
- Use **bold headings** for main sections
- Use bullet points (•) for lists
- Use numbered lists for steps or sequences
- Add line breaks between sections for readability
- Keep paragraphs short (2-3 sentences max)
- Use clear, actionable language`

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages
      ],
      temperature: 0.7,
      max_tokens: 400, // Slightly increased for better formatting
      presence_penalty: 0.1,
      frequency_penalty: 0.1
    })

    let aiMessage = completion.choices[0].message.content || ''

    // Post-process the message to improve formatting
    aiMessage = formatResponse(aiMessage)

    // Save to chat history
    await prisma.chatMessage.create({
      data: {
        userId: userId,
        role: 'assistant',
        content: aiMessage,
        context: context
      }
    })

    return NextResponse.json({ message: aiMessage })
  } catch (error) {
    console.error('OpenAI error:', error)
    return NextResponse.json({ error: 'AI service error' }, { status: 500 })
  }
}

function formatResponse(message: string): string {
  // Clean up the message formatting
  let formatted = message

  // Ensure proper spacing around bold text
  formatted = formatted.replace(/\*\*(.*?)\*\*/g, '**$1**')
  
  // Ensure proper spacing around bullet points
  formatted = formatted.replace(/([^\n])\n•/g, '$1\n\n•')
  
  // Ensure proper spacing around numbered lists
  formatted = formatted.replace(/([^\n])\n\d+\./g, '$1\n\n$&')
  
  // Add proper spacing around sections
  formatted = formatted.replace(/([^\n])\n\*\*/g, '$1\n\n**')
  
  // Ensure consistent line breaks
  formatted = formatted.replace(/\n{3,}/g, '\n\n')
  
  // Add emojis for common sections
  formatted = formatted.replace(/\*\*Study Tips\*\*/g, '📚 **Study Tips**')
  formatted = formatted.replace(/\*\*Course Planning\*\*/g, '🎯 **Course Planning**')
  formatted = formatted.replace(/\*\*Progress\*\*/g, '📊 **Progress**')
  formatted = formatted.replace(/\*\*Next Steps\*\*/g, '➡️ **Next Steps**')
  formatted = formatted.replace(/\*\*Recommendations\*\*/g, '💡 **Recommendations**')
  
  return formatted
} 