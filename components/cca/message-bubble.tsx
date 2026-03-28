'use client'

import { cn } from '@/lib/utils'
import { User, Bot } from 'lucide-react'
import type { UIMessage } from 'ai'
import { SourceCitations } from './source-citations'
import type { SourceCitation } from '@/lib/cca/types'

interface MessageBubbleProps {
  message: UIMessage
  sources?: SourceCitation[]
}

export function MessageBubble({ message, sources }: MessageBubbleProps) {
  const isUser = message.role === 'user'
  
  // Extract text content from message parts
  const textContent = message.parts
    ?.filter((p): p is { type: 'text'; text: string } => p.type === 'text')
    .map(p => p.text)
    .join('') || ''

  return (
    <div
      className={cn(
        'flex gap-3',
        isUser ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
          isUser 
            ? 'bg-primary text-primary-foreground' 
            : 'bg-accent text-accent-foreground'
        )}
      >
        {isUser ? (
          <User className="h-4 w-4" />
        ) : (
          <Bot className="h-4 w-4" />
        )}
      </div>

      {/* Message content */}
      <div
        className={cn(
          'flex max-w-[85%] flex-col gap-2 rounded-2xl px-4 py-3',
          isUser
            ? 'bg-primary text-primary-foreground rounded-tr-sm'
            : 'bg-secondary text-secondary-foreground rounded-tl-sm'
        )}
      >
        <div className="whitespace-pre-wrap text-sm leading-relaxed">
          {textContent}
        </div>
        
        {/* Show sources for assistant messages */}
        {!isUser && sources && sources.length > 0 && (
          <SourceCitations sources={sources} />
        )}
      </div>
    </div>
  )
}
