'use client'

import { useState } from 'react'
import { ExternalLink, ChevronDown, ChevronUp, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { SourceCitation } from '@/lib/cca/types'

interface SourceCitationsProps {
  sources: SourceCitation[]
}

export function SourceCitations({ sources }: SourceCitationsProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (sources.length === 0) return null

  return (
    <div className="mt-2 border-t border-border/50 pt-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsExpanded(!isExpanded)}
        className="h-auto w-full justify-between px-2 py-1.5 text-xs font-normal text-muted-foreground hover:text-foreground"
      >
        <span className="flex items-center gap-1.5">
          <FileText className="h-3.5 w-3.5" />
          <span>{sources.length} מקורות</span>
        </span>
        {isExpanded ? (
          <ChevronUp className="h-3.5 w-3.5" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5" />
        )}
      </Button>

      {isExpanded && (
        <div className="mt-2 space-y-2">
          {sources.map((source, index) => (
            <SourceCard key={index} source={source} index={index + 1} />
          ))}
        </div>
      )}
    </div>
  )
}

function SourceCard({ source, index }: { source: SourceCitation; index: number }) {
  const formattedDate = new Date(source.retrieved_at).toLocaleDateString('he-IL', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  return (
    <div className="rounded-lg bg-muted/50 p-3 text-xs">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent/20 text-[10px] font-medium text-accent">
            {index}
          </span>
          <span className="font-medium text-foreground line-clamp-1">
            {source.title}
          </span>
        </div>
        <a
          href={source.source_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex shrink-0 items-center gap-1 text-accent hover:underline"
        >
          <span>קישור</span>
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
      
      {source.cited_text && (
        <p className="mt-2 text-muted-foreground line-clamp-2 leading-relaxed">
          {source.cited_text}
        </p>
      )}
      
      <p className="mt-1.5 text-[10px] text-muted-foreground/70">
        אוחזר: {formattedDate}
      </p>
    </div>
  )
}
