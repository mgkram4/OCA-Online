'use client'

import { Button } from '@/components/ui/button'
import { MessageCircle, X } from 'lucide-react'
import { useState } from 'react'
import { AIChatBot } from './AIChatBot'

export function ChatToggle() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {isOpen && <AIChatBot onClose={() => setIsOpen(false)} />}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 w-12 h-12 md:w-14 md:h-14 rounded-full shadow-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white z-50"
        size="icon"
      >
        {isOpen ? <X className="w-5 h-5 md:w-6 md:h-6" /> : <MessageCircle className="w-5 h-5 md:w-6 md:h-6" />}
      </Button>
    </>
  )
} 