'use client'

import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import { Cloud, CloudRain, Loader2, Sun, Wind } from 'lucide-react'

type WeatherState = {
  temp: number
  wind: number
  code: number
}

type WeatherMeta = {
  text: string
  icon: typeof Sun
  gradient: string
  iconBg: string
}

function getWeatherMeta(code: number): WeatherMeta {
  if (code === 0) {
    return {
      text: 'שמשי',
      icon: Sun,
      gradient: 'from-sky-500/90 via-cyan-500/80 to-teal-500/80',
      iconBg: 'bg-amber-300/25 text-amber-100',
    }
  }

  if ([1, 2, 3].includes(code)) {
    return {
      text: 'מעונן חלקית',
      icon: Cloud,
      gradient: 'from-blue-700/85 via-sky-700/80 to-cyan-700/80',
      iconBg: 'bg-sky-300/20 text-sky-100',
    }
  }

  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) {
    return {
      text: 'גשום',
      icon: CloudRain,
      gradient: 'from-indigo-800/90 via-blue-800/85 to-cyan-800/80',
      iconBg: 'bg-cyan-300/20 text-cyan-100',
    }
  }

  return {
    text: 'מעונן',
    icon: Cloud,
    gradient: 'from-slate-700/90 via-slate-600/85 to-sky-700/80',
    iconBg: 'bg-slate-300/20 text-slate-100',
  }
}

export function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherState | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    const run = async () => {
      try {
        const res = await fetch(
          'https://api.open-meteo.com/v1/forecast?latitude=32.0853&longitude=34.7818&current=temperature_2m,weather_code,wind_speed_10m&timezone=auto',
        )
        const data = await res.json()
        if (!isMounted || !data?.current) return

        setWeather({
          temp: Math.round(data.current.temperature_2m),
          wind: Math.round(data.current.wind_speed_10m),
          code: data.current.weather_code,
        })
      } catch {
        if (!isMounted) return
        setWeather(null)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    run()
    return () => {
      isMounted = false
    }
  }, [])

  const meta = useMemo(() => getWeatherMeta(weather?.code ?? 2), [weather?.code])
  const Icon = meta.icon

  if (loading) {
    return (
      <div className="dashboard-fade-up rounded-2xl border border-border bg-card p-5 shadow-sm" style={{ '--delay': '80ms' } as CSSProperties}>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>טוען מזג אוויר...</span>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`dashboard-fade-up relative overflow-hidden rounded-2xl border border-transparent bg-gradient-to-br ${meta.gradient} p-5 text-white shadow-lg`}
      style={{ '--delay': '80ms' } as CSSProperties}
    >
      <div className="pointer-events-none absolute -top-10 -left-8 h-28 w-28 rounded-full bg-white/10 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-10 -right-6 h-24 w-24 rounded-full bg-white/10 blur-xl" />

      <p className="text-xs font-medium uppercase tracking-[0.16em] text-white/80">Weather</p>

      <div className="mt-3 flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm text-white/80">תל אביב</p>
          <p className="text-3xl font-bold">{weather?.temp ?? '--'}°</p>
        </div>

        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${meta.iconBg}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-xs">
        <span className="rounded-full bg-white/15 px-2.5 py-1 text-white/90">{meta.text}</span>
        <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-white/90">
          <Wind className="h-3.5 w-3.5" />
          {weather?.wind ?? '--'} קמ"ש
        </span>
      </div>
    </div>
  )
}
