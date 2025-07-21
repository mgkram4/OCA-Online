'use client'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useCurrentLesson } from '@/hooks/useCurrentLesson'
import { useUser } from '@/hooks/useUser'
import { BookOpen, Bot, MessageCircle, Send, Target, TrendingUp, User } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { currentLesson, currentModule, currentCourse } = useCurrentLesson()
  const { user } = useUser()
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    const scrollToBottom = () => {
      if (scrollAreaRef.current) {
        const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
        if (scrollElement) {
          scrollElement.scrollTop = scrollElement.scrollHeight
        }
      }
    }

    // Scroll immediately
    scrollToBottom()
    
    // Also scroll after a short delay to ensure content is rendered
    const timeoutId = setTimeout(scrollToBottom, 100)
    
    return () => clearTimeout(timeoutId)
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

    const userMessage: ChatMessage = { 
      role: 'user', 
      content: input,
      timestamp: new Date()
    }
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
        location: '/chat'
      }

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messages.map(m => ({ role: m.role, content: m.content })),
          context
        })
      })

      const data = await response.json()
      
      // Ensure we have valid message content
      const assistantMessage = data.message || data.error || 'Sorry, I encountered an error. Please try again.'
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: assistantMessage,
        timestamp: new Date()
      }])
    } catch (error) {
      console.error('Chat error:', error)
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const formatMessage = (content: string) => {
    // Handle undefined or null content
    if (!content) {
      return <div className="text-muted-foreground">No content available</div>
    }
    
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
    // Handle undefined or null text
    if (!text) {
      return ''
    }
    
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

  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const getSuggestedQuestions = () => [
    {
      icon: <BookOpen className="w-4 h-4" />,
      text: "What courses should I take next?",
      category: "Course Planning"
    },
    {
      icon: <Target className="w-4 h-4" />,
      text: "How can I improve my study habits?",
      category: "Study Tips"
    },
    {
      icon: <TrendingUp className="w-4 h-4" />,
      text: "What's my graduation progress?",
      category: "Progress"
    },
    {
      icon: <MessageCircle className="w-4 h-4" />,
      text: "Help me with my current lesson",
      category: "Learning"
    }
  ]

  const handleSuggestedQuestion = (question: string) => {
    setInput(question)
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">AI Learning Assistant</h1>
        <p className="text-muted-foreground">
          Get personalized help with your studies, course planning, and academic goals
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Chat Interface */}
        <div className="lg:col-span-3">
          <Card className="h-[600px] flex flex-col overflow-hidden">
            <CardHeader className="border-b flex-shrink-0">
              <CardTitle className="flex items-center gap-2">
                <Bot className="w-5 h-5" />
                Chat with AI Assistant
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-0 flex flex-col min-h-0">
              <ScrollArea ref={scrollAreaRef} className="flex-1 p-4 min-h-0" style={{ maxHeight: 'calc(100vh - 300px)' }}>
                <div className="space-y-4 pb-2">
                  {messages.length === 0 && (
                    <div className="text-center text-muted-foreground py-12">
                      <Bot className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <h3 className="text-lg font-semibold mb-2">Welcome to your AI Learning Assistant!</h3>
                      <p className="text-sm mb-6">
                        I&apos;m here to help you with your studies, course planning, and academic goals.
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto">
                        {getSuggestedQuestions().map((question, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            onClick={() => handleSuggestedQuestion(question.text)}
                            className="justify-start h-auto p-3 text-left"
                          >
                            <div className="flex items-start gap-2">
                              {question.icon}
                              <div>
                                <div className="font-medium text-xs">{question.text}</div>
                                <div className="text-xs text-muted-foreground">{question.category}</div>
                              </div>
                            </div>
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                  {messages.map((message, i) => (
                    <div key={i} className={`flex gap-3 ${
                      message.role === 'assistant' ? '' : 'flex-row-reverse'
                    }`}>
                      <Avatar className="w-8 h-8 flex-shrink-0">
                        <AvatarFallback>
                          {message.role === 'assistant' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                        </AvatarFallback>
                      </Avatar>
                      <div className={`rounded-lg px-4 py-3 max-w-[80%] ${
                        message.role === 'assistant' 
                          ? 'bg-gray-100 dark:bg-gray-800' 
                          : 'bg-blue-500 text-white'
                      }`}>
                        <div className="break-words">
                          {formatMessage(message.content)}
                        </div>
                        <div className={`text-xs mt-2 ${
                          message.role === 'assistant' ? 'text-muted-foreground' : 'text-blue-100'
                        }`}>
                          {formatTime(message.timestamp)}
                        </div>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex gap-3">
                      <Avatar className="w-8 h-8 flex-shrink-0">
                        <AvatarFallback><Bot className="w-4 h-4" /></AvatarFallback>
                      </Avatar>
                      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-3">
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
              <div className="p-4 border-t flex-shrink-0">
                <form onSubmit={(e) => { e.preventDefault(); sendMessage() }} className="flex gap-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask me anything about your studies..."
                    disabled={isLoading}
                    className="flex-1"
                  />
                  <Button type="submit" disabled={isLoading}>
                    <Send className="w-4 h-4 mr-2" />
                    Send
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="space-y-4">
            {/* Current Context */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Current Context</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {currentCourse ? (
                  <>
                    <div>
                      <div className="text-sm font-medium">Current Course</div>
                      <div className="text-sm text-muted-foreground">{currentCourse.title}</div>
                    </div>
                    {currentModule && (
                      <div>
                        <div className="text-sm font-medium">Current Module</div>
                        <div className="text-sm text-muted-foreground">{currentModule.title}</div>
                      </div>
                    )}
                    {currentLesson && (
                      <div>
                        <div className="text-sm font-medium">Current Lesson</div>
                        <div className="text-sm text-muted-foreground">{currentLesson.title}</div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    No active course selected
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => handleSuggestedQuestion("Show me my current progress")}
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  View Progress
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => handleSuggestedQuestion("What courses should I take next?")}
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  Course Planning
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => handleSuggestedQuestion("Give me study tips")}
                >
                  <Target className="w-4 h-4 mr-2" />
                  Study Tips
                </Button>
              </CardContent>
            </Card>

            {/* Chat Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  This AI assistant can help you with:
                </p>
                <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                  <li>• Course planning and scheduling</li>
                  <li>• Study strategies and time management</li>
                  <li>• Understanding lesson content</li>
                  <li>• Academic goal setting</li>
                  <li>• Progress tracking</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 