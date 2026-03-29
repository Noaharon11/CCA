import { BriefcaseBusiness, ShieldCheck, UsersRound } from 'lucide-react'
import { FeatureCard } from '@/components/dashboard/feature-card'
import { WeatherWidget } from '@/components/dashboard/weather-widget'

const dashboardCards = [
  {
    title: 'AI Safety Chat',
    description: 'שאלות בטיחות בזמן אמת עם מקורות רשמיים',
    href: '/safety-chat',
    icon: ShieldCheck,
    highlighted: true,
    badge: 'ראשי',
    tone: 'info' as const,
  },
  {
    title: 'Projects',
    description: 'ניהול פרויקטים, משימות וסטטוסים',
    href: '/projects',
    icon: BriefcaseBusiness,
    badge: 'פעיל',
    tone: 'success' as const,
  },
  {
    title: 'Human Resources',
    description: 'ניהול עובדים, תפקידים והדרכות',
    href: '/human-resources',
    icon: UsersRound,
    badge: 'Demo',
    tone: 'default' as const,
  },
]

export default function Home() {
  return (
    <main className="min-h-[calc(100dvh-64px)] bg-background px-4 py-8 md:py-10">
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <section className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
          <div className="dashboard-fade-up rounded-2xl border border-border bg-gradient-to-br from-card via-card to-secondary/30 p-6 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-accent">Construction Workspace</p>
            <h1 className="mt-2 text-2xl font-bold text-foreground md:text-3xl">לוח בקרה ראשי</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
              גישה מהירה לכלי העבודה המרכזיים במערכת. בחרי מודול להתחלת עבודה.
            </p>
          </div>

          <WeatherWidget />
        </section>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {dashboardCards.map((card, index) => (
            <FeatureCard
              key={card.title}
              title={card.title}
              description={card.description}
              href={card.href}
              icon={card.icon}
              highlighted={card.highlighted}
              badge={card.badge}
              tone={card.tone}
              index={index + 1}
            />
          ))}
        </section>
      </div>
    </main>
  )
}
