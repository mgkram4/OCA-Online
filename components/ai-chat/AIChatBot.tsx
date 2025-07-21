'use client'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useCurrentLesson } from '@/hooks/useCurrentLesson'
import { useUser } from '@/hooks/useUser'
import { Bot, Send, User, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface AIChatBotProps {
  onClose?: () => void
}

export function AIChatBot({ onClose }: AIChatBotProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { currentLesson, currentModule, currentCourse } = useCurrentLesson()
  const { user } = useUser()
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollElement) {
        // Use setTimeout to ensure the DOM has updated
        setTimeout(() => {
          scrollElement.scrollTop = scrollElement.scrollHeight
        }, 100)
      }
    }
  }, [messages, isLoading])

  const fetchUserProgress = async () => {
    if (!user?.id || !currentLesson?.id) return null
    
    try {
      const response = await fetch(`/api/progress/${user.id}/${currentLesson.id}`)
      return await response.json()
    } catch (error) {
      console.error('Error fetching progress:', error)
      return null
    }
  }

  const sendMessage = async () => {
    if (!input.trim()) return

    const userMessage: ChatMessage = { role: 'user', content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      // Get user dashboard data for context
      let dashboardContext = null
      try {
        const dashboardResponse = await fetch('/api/dashboard/student')
        if (dashboardResponse.ok) {
          dashboardContext = await dashboardResponse.json()
        }
      } catch (error) {
        console.error('Error fetching dashboard context:', error)
      }

      const context = {
        currentLesson: currentLesson?.title,
        currentModule: currentModule?.title,
        currentCourse: currentCourse?.title,
        lessonContent: currentLesson?.content,
        userProgress: await fetchUserProgress(),
        dashboardData: dashboardContext,
        location: window.location.pathname
      }

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          context
        })
      })

      const data = await response.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.message }])
    } catch (error) {
      console.error('Chat error:', error)
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again.' 
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const formatMessage = (content: string) => {
    // Split long messages into paragraphs
    const paragraphs = content.split('\n\n')
    return paragraphs.map((paragraph, index) => {
      // Handle different types of content
      if (paragraph.trim().startsWith('•')) {
        // Bullet point list
        return (
          <div key={index} className="mb-2 last:mb-0">
            <ul className="list-none space-y-1">
              {paragraph.split('\n').map((item, itemIndex) => {
                if (item.trim().startsWith('•')) {
                  return (
                    <li key={itemIndex} className="flex items-start gap-2">
                      <span className="text-blue-500 mt-1">•</span>
                      <span className="flex-1">{formatInlineText(item.replace('•', '').trim())}</span>
                    </li>
                  )
                }
                return null
              })}
            </ul>
          </div>
        )
      } else if (paragraph.trim().match(/^\d+\./)) {
        // Numbered list
        return (
          <div key={index} className="mb-2 last:mb-0">
            <ol className="list-decimal list-inside space-y-1">
              {paragraph.split('\n').map((item, itemIndex) => {
                if (item.trim().match(/^\d+\./)) {
                  return (
                    <li key={itemIndex} className="ml-2">
                      {formatInlineText(item.replace(/^\d+\.\s*/, ''))}
                    </li>
                  )
                }
                return null
              })}
            </ol>
          </div>
        )
      } else {
        // Regular paragraph
        return (
          <div key={index} className="mb-2 last:mb-0">
            {formatInlineText(paragraph)}
          </div>
        )
      }
    })
  }

  const formatInlineText = (text: string) => {
    // Handle bold text
    const parts = text.split(/(\*\*.*?\*\*)/g)
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={index} className="font-semibold">
            {part.slice(2, -2)}
          </strong>
        )
      }
      return part
    })
  }

  return (
    <Card className="fixed bottom-20 right-4 w-80 md:w-96 h-[400px] md:h-[500px] flex flex-col shadow-2xl z-40 max-h-[80vh] overflow-hidden">
      <div className="p-4 border-b bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-lg flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 md:w-5 md:h-5" />
            <h3 className="font-semibold text-sm md:text-base">
              AI Learning Assistant
            </h3>
          </div>
          {onClose && (
            <Button
              onClick={onClose}
              size="sm"
              variant="ghost"
              className="text-white hover:bg-white/20 h-6 w-6 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
        <p className="text-xs md:text-sm opacity-90 mt-1">
          {currentLesson ? `Learning: ${currentLesson.title}` : 'Ask me about your courses, tasks, or anything else!'}
        </p>
      </div>
      
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-3 md:p-4 min-h-0" style={{ height: 'calc(100% - 140px)' }}>
        <div className="space-y-3 md:space-y-4 pb-2">
          {messages.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              <Bot className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Start a conversation to get help with your studies!</p>
            </div>
          )}
          {messages.map((message, i) => (
            <div key={i} className={`flex gap-2 md:gap-3 ${
              message.role === 'assistant' ? '' : 'flex-row-reverse'
            }`}>
              <Avatar className="w-6 h-6 md:w-8 md:h-8 flex-shrink-0">
                <AvatarFallback>
                  {message.role === 'assistant' ? <Bot className="w-3 h-3 md:w-4 md:h-4" /> : <User className="w-3 h-3 md:w-4 md:h-4" />}
                </AvatarFallback>
              </Avatar>
              <div className={`rounded-lg px-3 py-2 md:px-4 max-w-[85%] text-sm md:text-base ${
                message.role === 'assistant' 
                  ? 'bg-gray-100 dark:bg-gray-800' 
                  : 'bg-blue-500 text-white'
              }`}>
                <div className="break-words">
                  {formatMessage(message.content)}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-2 md:gap-3">
              <Avatar className="w-6 h-6 md:w-8 md:h-8 flex-shrink-0">
                <AvatarFallback><Bot className="w-3 h-3 md:w-4 md:h-4" /></AvatarFallback>
              </Avatar>
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2 md:px-4">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
      
      <div className="p-3 md:p-4 border-t flex-shrink-0">
        <form onSubmit={(e) => { e.preventDefault(); sendMessage() }} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about this lesson..."
            disabled={isLoading}
            className="text-sm"
          />
          <Button type="submit" size="icon" disabled={isLoading} className="w-8 h-8 md:w-10 md:h-10">
            <Send className="w-3 h-3 md:w-4 md:h-4" />
          </Button>
        </form>
      </div>
    </Card>
  )
} 