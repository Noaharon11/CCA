import Link from 'next/link'
import type { CSSProperties } from 'react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FeatureCardProps {
  title: string
  description: string
  href: string
  icon: LucideIcon
  highlighted?: boolean
  badge?: string
  tone?: 'default' | 'success' | 'info'
  index?: number
}

export function FeatureCard({
  title,
  description,
  href,
  icon: Icon,
  highlighted = false,
  badge,
  tone = 'default',
  index = 0,
}: FeatureCardProps) {
  const badgeClass =
    tone === 'success'
      ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
      : tone === 'info'
        ? 'bg-sky-500/15 text-sky-700 dark:text-sky-300'
        : 'bg-primary/15 text-primary'

  return (
    <Link
      href={href}
      className={cn(
        'dashboard-fade-up group relative flex min-h-44 flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm transition-all duration-300',
        'hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        highlighted && 'border-primary/25 bg-gradient-to-br from-card to-secondary/40',
      )}
      style={{ '--delay': `${index * 90}ms` } as CSSProperties}
      aria-label={`${title} - ${description}`}
    >
      <span className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <span className="absolute -top-12 left-1/2 h-24 w-36 -translate-x-1/2 rounded-full bg-primary/10 blur-2xl" />
      </span>

      <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
        <Icon className="h-5 w-5" />
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          {badge && (
            <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-semibold', badgeClass)}>{badge}</span>
          )}
        </div>
        <p className="line-clamp-1 text-sm text-muted-foreground">{description}</p>
      </div>
    </Link>
  )
}
