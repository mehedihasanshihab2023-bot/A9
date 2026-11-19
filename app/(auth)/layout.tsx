import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Star } from "lucide-react"

import { Logo } from "@/components/site/logo"

const AUTH_IMAGE =
  "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?q=80&w=1200&auto=format&fit=crop"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[0.92fr_1.08fr]">
      <aside className="relative hidden overflow-hidden bg-ink p-10 text-cream lg:flex lg:flex-col lg:justify-between">
        <div className="grid-lines pointer-events-none absolute inset-0 opacity-50" />
        <div className="relative flex items-center justify-between">
          <Logo tone="light" />
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 font-mono text-[0.6rem] tracking-[0.14em] text-cream/50 uppercase transition-colors hover:text-cream"
          >
            <ArrowLeft className="size-3.5" />
            Back home
          </Link>
        </div>

        <div className="relative mt-10">
          <div className="relative aspect-[4/3.4] overflow-hidden rounded-[1.6rem]">
            <Image
              src={AUTH_IMAGE}
              alt="Barber at work in the SalonBook studio"
              fill
              priority
              sizes="45vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/5 to-transparent" />
            <div className="absolute inset-x-5 bottom-5">
              <p className="font-mono text-[0.55rem] tracking-[0.18em] text-sage uppercase">
                The SalonBook promise
              </p>
              <p className="mt-2 max-w-sm font-display text-[1.4rem] leading-tight font-semibold">
                “See the real menu. Request a real slot. Pay only when a human
                confirms.”
              </p>
            </div>
          </div>
        </div>

        <div className="relative mt-10 flex items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-1 text-clay">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star key={index} className="size-3.5 fill-current" />
              ))}
            </div>
            <p className="mt-2 text-[0.75rem] text-cream/45">
              Rated 4.9 / 5 by 800+ guests
            </p>
          </div>
          <p className="font-mono text-[0.55rem] tracking-[0.16em] text-cream/25 uppercase">
            Est. 2012 · Dhaka
          </p>
        </div>
      </aside>

      <main className="flex min-h-screen flex-col bg-cream">
        <div className="flex items-center justify-between px-5 py-5 lg:hidden">
          <Logo />
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-[0.72rem] font-semibold text-ink/50"
          >
            <ArrowLeft className="size-3.5" />
            Home
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center px-5 py-8 sm:px-8">
          <div className="w-full max-w-[27rem]">{children}</div>
        </div>
        <p className="px-5 pb-6 text-center font-mono text-[0.55rem] tracking-[0.14em] text-ink/30 uppercase">
          Secure sign in · SalonBook © {new Date().getFullYear()}
        </p>
      </main>
    </div>
  )
}
