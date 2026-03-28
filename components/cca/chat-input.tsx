'use client'

import { useState, useRef, useEffect } from 'react'
import { Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'

interface ChatInputProps {
  onSend: (message: string) => void
  isLoading: boolean
  disabled?: boolean
}

export function ChatInput({ onSend, isLoading, disabled }: ChatInputProps) {
  const [input, setInput] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const lastSendRef = useRef<{ text: string; ts: number } | null>(null)

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`
    }
  }, [input])

  const submitMessage = () => {
    const text = input.trim()
    if (!text || isLoading || disabled) return

    // Guard against accidental duplicate submits (Enter + submit / rapid double click)
    const now = Date.now()
    const last = lastSendRef.current
    if (last && last.text === text && now - last.ts < 800) {
      return
    }

    lastSendRef.current = { text, ts: now }
    onSend(text)
    setInput('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    submitMessage()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submitMessage()
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="sticky bottom-0 border-t border-border bg-card px-4 py-3"
    >
      <div className="flex items-end gap-2">
        <div className="relative flex-1">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="שאל שאלה על בטיחות בבנייה..."
            disabled={isLoading || disabled}
            rows={1}
            className="max-h-36 min-h-[44px] w-full resize-none rounded-xl border border-input bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="הקלד הודעה"
          />
        </div>
        <Button
          type="submit"
          size="icon"
          disabled={!input.trim() || isLoading || disabled}
          className="h-11 w-11 shrink-0 rounded-xl"
          aria-label={isLoading ? 'שולח...' : 'שלח הודעה'}
        >
          {isLoading ? (
            <Spinner className="h-4 w-4" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
      <p className="mt-2 text-center text-[10px] text-muted-foreground">
        המידע מבוסס על מקורות רשמיים. יש לאמת מול המקור המקורי.
      </p>
    </form>
  )
}
