'use client'

import type { ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { AppNavbar } from '@/components/navigation/app-navbar'
import { MobileBottomNav } from '@/components/navigation/mobile-bottom-nav'

interface AppShellProps {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname()
  const showMobileBottomNav = !['/safety-chat', '/chat'].includes(pathname)

  return (
    <div className="min-h-dvh bg-background">
      <AppNavbar />
      <div className={showMobileBottomNav ? 'pb-20 md:pb-0' : ''}>{children}</div>
      {showMobileBottomNav && <MobileBottomNav />}
    </div>
  )
}
