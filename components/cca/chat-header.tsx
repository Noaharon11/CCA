'use client'

import { ShieldCheck, Info, ChevronRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'

export function ChatHeader() {
  const router = useRouter()
  const pathname = usePathname()
  const [showHomeButton, setShowHomeButton] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    setShowHomeButton(pathname !== '/')
  }, [pathname])

  const handleBack = () => {
    router.push('/')
  }

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-border bg-card px-4 py-3 shadow-sm">
      <div className="flex items-center gap-3">
        {showHomeButton && (
          <Button variant="ghost" size="sm" onClick={handleBack} aria-label="חזרה לדף הבית">
            <ChevronRight className="h-4 w-4" />
            <span>דף הבית</span>
          </Button>
        )}

        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
          <ShieldCheck className="h-5 w-5 text-primary-foreground" />
        </div>

        <div>
          <h1 className="text-lg font-semibold text-foreground">יועץ בטיחות בנייה</h1>
          <p className="text-xs text-muted-foreground">מידע מבוסס מקורות רשמיים</p>
        </div>
      </div>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="מידע על המערכת">
            <Info className="h-5 w-5" />
          </Button>
        </PopoverTrigger>

        <PopoverContent align="end" className="w-80 text-sm">
          <div className="space-y-3">
            <h3 className="font-semibold">אודות המערכת</h3>
            <p className="text-muted-foreground leading-relaxed">
              יועץ בטיחות בבנייה מבוסס בינה מלאכותית. המידע מבוסס על תקנות רשמיות ממקורות
              מוסמכים כגון משרד העבודה והמכון לבטיחות וגיהות.
            </p>

            <div className="rounded-md bg-accent/10 p-3 text-accent-foreground">
              <p className="text-xs">
                <strong>הערה חשובה:</strong> המידע המוצג נועד לסיוע בלבד ואינו מהווה תחליף
                לייעוץ מקצועי. יש לאמת את המידע מול המקורות הרשמיים.
              </p>
            </div>

            <div className="space-y-1 text-xs text-muted-foreground">
              <p>מקורות מידע:</p>
              <ul className="list-inside list-disc space-y-0.5 text-muted-foreground/80">
                <li>gov.il - אתר ממשלת ישראל</li>
                <li>osh.org.il - המכון לבטיחות וגיהות</li>
                <li>sii.org.il - מכון התקנים הישראלי</li>
              </ul>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </header>
  )
}
