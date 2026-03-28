'use client'

import { ShieldCheck, HardHat, Scaling, ArrowUp } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface WelcomeMessageProps {
  onSuggestionClick: (suggestion: string) => void
}

const suggestions = [
  {
    icon: ArrowUp,
    text: 'מהן דרישות הבטיחות לעבודה בגובה?',
  },
  {
    icon: Scaling,
    text: 'מה התקנות לשימוש בפיגומים?',
  },
  {
    icon: HardHat,
    text: 'אילו ציוד מגן נדרש באתר בנייה?',
  },
]

export function WelcomeMessage({ onSuggestionClick }: WelcomeMessageProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-8">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary">
        <ShieldCheck className="h-8 w-8 text-primary-foreground" />
      </div>
      
      <h2 className="mt-4 text-center text-xl font-semibold text-foreground">
        שלום, אני יועץ הבטיחות שלך
      </h2>
      
      <p className="mt-2 max-w-sm text-center text-sm text-muted-foreground leading-relaxed">
        אני כאן לעזור לך עם שאלות בנושא תקנות בטיחות בבנייה בישראל. 
        כל התשובות מבוססות על מקורות רשמיים.
      </p>

      <div className="mt-6 w-full max-w-sm space-y-2">
        <p className="text-center text-xs font-medium text-muted-foreground">
          התחל עם אחת מהשאלות הנפוצות:
        </p>
        
        {suggestions.map((suggestion, index) => (
          <Button
            key={index}
            variant="outline"
            className="h-auto w-full justify-start gap-3 px-4 py-3 text-right"
            onClick={() => onSuggestionClick(suggestion.text)}
          >
            <suggestion.icon className="h-4 w-4 shrink-0 text-accent" />
            <span className="text-sm">{suggestion.text}</span>
          </Button>
        ))}
      </div>

      <div className="mt-8 rounded-lg bg-accent/10 px-4 py-3 text-center">
        <p className="text-xs text-muted-foreground">
          <span className="font-medium text-accent">חשוב:</span>
          {' '}המידע נועד לסיוע בלבד. תמיד אמת מול המקורות הרשמיים.
        </p>
      </div>
    </div>
  )
}
