import type { Metadata, Viewport } from 'next'
import { Rubik, Noto_Sans_Hebrew } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { AppShell } from '@/components/navigation/app-shell'
import './globals.css'

const rubik = Rubik({ 
  subsets: ['latin', 'hebrew'],
  variable: '--font-rubik',
})

const notoHebrew = Noto_Sans_Hebrew({ 
  subsets: ['hebrew'],
  variable: '--font-noto-hebrew',
})

export const metadata: Metadata = {
  title: 'יועץ בטיחות בנייה | CCA',
  description: 'יועץ בטיחות בנייה מבוסס בינה מלאכותית - מידע מהימן מתקנות ישראליות רשמיות',
  generator: 'v0.app',
  keywords: ['בטיחות בנייה', 'תקנות בנייה', 'עבודה בגובה', 'פיגומים', 'בטיחות בעבודה'],
  authors: [{ name: 'CCA' }],
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#0f172a',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="he" dir="rtl">
      <body className={`${rubik.variable} ${notoHebrew.variable} font-sans antialiased`}>
        <AppShell>{children}</AppShell>
        <Analytics />
      </body>
    </html>
  )
}
