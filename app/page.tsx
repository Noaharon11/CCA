import Link from 'next/link'
import { ShieldCheck, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <main className="min-h-dvh bg-background px-4 py-8">
      <div className="mx-auto flex min-h-[80vh] w-full max-w-3xl items-center justify-center">
        <section className="w-full rounded-2xl border border-border bg-card p-8 text-center shadow-sm md:p-10">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary">
            <ShieldCheck className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="mt-5 text-2xl font-bold text-foreground md:text-3xl">יועץ בטיחות בנייה</h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base">
            מידע מבוסס מקורות רשמיים בתחום הבטיחות בבנייה. מומלץ לאמת מול המקור הרגולטורי העדכני.
          </p>

          <div className="mt-8">
            <Button asChild size="lg" className="h-12 min-w-56 text-base">
              <Link href="/chat">
                התחל שיחה
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>
      </div>
    </main>
  )
}
