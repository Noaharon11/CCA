'use client'

import { useRef, useEffect, useState } from 'react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { ChatHeader } from './chat-header'
import { ChatInput } from './chat-input'
import { MessageBubble } from './message-bubble'
import { WelcomeMessage } from './welcome-message'
import type { SourceCitation } from '@/lib/cca/types'

export function ChatContainer() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [sourcesMap, setSourcesMap] = useState<Record<string, SourceCitation[]>>({})

  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({ 
      api: '/api/chat',
    }),
  })

  const isLoading = status === 'streaming' || status === 'submitted'

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = (text: string) => {
    sendMessage({ text })
  }

  return (
    <div className="flex h-dvh flex-col bg-background">
      <ChatHeader />
      
      <div
        ref={scrollRef}
        className="chat-scrollbar flex-1 overflow-y-auto px-4 py-4"
      >
        {messages.length === 0 ? (
          <WelcomeMessage onSuggestionClick={handleSend} />
        ) : (
          <div className="mx-auto max-w-2xl space-y-4">
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                sources={sourcesMap[message.id]}
              />
            ))}

            {error && (
              <div className="rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                {error.message || 'אירעה שגיאה במהלך יצירת תשובה.'}
              </div>
            )}
            
            {/* Loading indicator */}
            {isLoading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="flex gap-1">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-accent [animation-delay:-0.3s]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-accent [animation-delay:-0.15s]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-accent" />
                </div>
                <span>מחפש מידע רלוונטי...</span>
              </div>
            )}
          </div>
        )}
      </div>

      <ChatInput onSend={handleSend} isLoading={isLoading} />
    </div>
  )
}
