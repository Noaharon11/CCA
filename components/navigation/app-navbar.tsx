'use client'

import type { ComponentType, CSSProperties } from 'react'
import { useMemo } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { BriefcaseBusiness, ChevronRight, Info, LayoutDashboard, ShieldCheck, UsersRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

type NavConfig = {
  title: string
  subtitle: string
  icon: ComponentType<{ className?: string }>
  infoTitle: string
  infoDescription: string
  infoNotes?: string[]
}

const NAV_CONFIG: Record<string, NavConfig> = {
  '/': {
    title: 'Construction Dashboard',
    subtitle: 'ניהול בטיחות ותפעול',
    icon: LayoutDashboard,
    infoTitle: 'אודות הדשבורד',
    infoDescription: 'דף זה מרכז את כל המודולים התפעוליים כדי לאפשר ניווט מהיר ונוח.',
  },
  '/safety-chat': {
    title: 'AI Safety Chat',
    subtitle: 'יועץ בטיחות בנייה',
    icon: ShieldCheck,
    infoTitle: 'אודות AI Safety Chat',
    infoDescription:
      'המערכת מבוססת בינה מלאכותית ומעדיפה מידע ממקורות רגולטוריים רשמיים לצורך סיוע בתשובות.',
    infoNotes: [
      'מקורות מידע: gov.il, osh.org.il, sii.org.il',
      'המידע נועד לסיוע בלבד ואינו תחליף לייעוץ מקצועי.',
      'יש לאמת תמיד מול המקור הרשמי והעדכני.',
    ],
  },
  '/chat': {
    title: 'AI Safety Chat',
    subtitle: 'יועץ בטיחות בנייה',
    icon: ShieldCheck,
    infoTitle: 'אודות AI Safety Chat',
    infoDescription:
      'המערכת מבוססת בינה מלאכותית ומעדיפה מידע ממקורות רגולטוריים רשמיים לצורך סיוע בתשובות.',
    infoNotes: [
      'מקורות מידע: gov.il, osh.org.il, sii.org.il',
      'המידע נועד לסיוע בלבד ואינו תחליף לייעוץ מקצועי.',
      'יש לאמת תמיד מול המקור הרשמי והעדכני.',
    ],
  },
  '/projects': {
    title: 'Projects',
    subtitle: 'ניהול פרויקטים ומשימות',
    icon: BriefcaseBusiness,
    infoTitle: 'אודות Projects',
    infoDescription: 'עמוד זה מיועד לניהול פרויקטים, משימות, לו"ז וסטטוסים.',
  },
  '/human-resources': {
    title: 'Human Resources',
    subtitle: 'ניהול עובדים והכשרות',
    icon: UsersRound,
    infoTitle: 'אודות Human Resources',
    infoDescription: 'עמוד זה מיועד לניהול עובדים, תפקידים, הכשרות ותוקפים.',
  },
}

export function AppNavbar() {
  const router = useRouter()
  const pathname = usePathname()
  const today = useMemo(
    () =>
      new Date().toLocaleDateString('he-IL', {
        weekday: 'short',
        day: '2-digit',
        month: '2-digit',
      }),
    [],
  )

  const config = useMemo(() => {
    return NAV_CONFIG[pathname] || NAV_CONFIG['/']
  }, [pathname])

  const showBackButton = pathname !== '/'

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back()
      return
    }
    router.push('/')
  }

  const Icon = config.icon

  return (
    <header className="sticky top-0 z-30 border-b border-border/80 bg-card/95 px-4 py-3 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/70">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {showBackButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              aria-label="חזרה"
              className="dashboard-fade-up"
              style={{ '--delay': '20ms' } as CSSProperties}
            >
              <ChevronRight className="h-4 w-4" />
              <span>חזור</span>
            </Button>
          )}

          <div
            className="dashboard-fade-up flex h-10 w-10 items-center justify-center rounded-xl bg-primary"
            style={{ '--delay': '60ms' } as CSSProperties}
          >
            <Icon className="h-5 w-5 text-primary-foreground" />
          </div>

          <div className="dashboard-fade-up min-w-0" style={{ '--delay': '100ms' } as CSSProperties}>
            <h1 className="truncate text-base font-semibold text-foreground md:text-lg">{config.title}</h1>
            <p className="truncate text-xs text-muted-foreground">{config.subtitle}</p>
          </div>
        </div>

        <div className="dashboard-fade-up flex items-center gap-2" style={{ '--delay': '160ms' } as CSSProperties}>
          <span className="hidden rounded-full border border-border bg-background px-2.5 py-1 text-[10px] font-medium text-muted-foreground sm:inline-flex">
            {today}
          </span>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="מידע על העמוד">
                <Info className="h-5 w-5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 text-sm">
              <div className="space-y-3">
                <h3 className="font-semibold">{config.infoTitle}</h3>
                <p className="leading-relaxed text-muted-foreground">{config.infoDescription}</p>
                {config.infoNotes && config.infoNotes.length > 0 && (
                  <ul className="list-inside list-disc space-y-1 text-xs text-muted-foreground">
                    {config.infoNotes.map((note) => (
                      <li key={note}>{note}</li>
                    ))}
                  </ul>
                )}
              </div>
            </PopoverContent>
          </Popover>

          <span className="rounded-full border border-border bg-background px-2.5 py-1 text-[10px] font-medium text-muted-foreground">
            Demo
          </span>
        </div>
      </div>
    </header>
  )
}
