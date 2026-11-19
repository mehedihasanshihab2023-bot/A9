import Link from "next/link"
import { ArrowUpRight, Clock, Mail, MapPin, Phone } from "lucide-react"

import { Logo } from "@/components/site/logo"
import { SALON } from "@/lib/constants"

const explore = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Browse services" },
  { href: "/#why", label: "Why SalonBook" },
  { href: "/sign-up", label: "Create an account" },
]

export function Footer() {
  return (
    <footer id="visit" className="scroll-mt-24 bg-ink text-cream">
      <div className="shell grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-[1.3fr_0.7fr_0.8fr_1.1fr] lg:py-20">
        <div>
          <Logo tone="light" />
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-cream/55">
            A neighbourhood grooming studio for hair, skin, nails and spa
            rituals. Browse the menu, request your time, and pay only once the
            salon confirms.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {SALON.socials.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 rounded-full border border-cream/15 px-3 py-1.5 text-[0.68rem] font-medium text-cream/70 transition-colors hover:border-clay hover:text-cream"
              >
                {social.label}
                <ArrowUpRight className="size-3" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <p className="eyebrow text-sage">Explore</p>
          <ul className="mt-5 space-y-3 text-sm text-cream/60">
            {explore.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="transition-colors hover:text-cream"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="eyebrow text-sage">Your account</p>
          <ul className="mt-5 space-y-3 text-sm text-cream/60">
            <li>
              <Link href="/sign-in" className="transition-colors hover:text-cream">
                Sign in
              </Link>
            </li>
            <li>
              <Link href="/dashboard" className="transition-colors hover:text-cream">
                Customer dashboard
              </Link>
            </li>
            <li>
              <Link
                href="/dashboard/appointments"
                className="transition-colors hover:text-cream"
              >
                My appointments
              </Link>
            </li>
            <li>
              <Link
                href="/dashboard/profile"
                className="transition-colors hover:text-cream"
              >
                My profile
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="eyebrow text-sage">Visit the studio</p>
          <ul className="mt-5 space-y-3.5 text-sm text-cream/60">
            <li className="flex gap-2.5">
              <MapPin className="mt-0.5 size-4 shrink-0 text-clay" />
              <span>{SALON.address}</span>
            </li>
            <li className="flex gap-2.5">
              <Phone className="mt-0.5 size-4 shrink-0 text-clay" />
              <a
                href={`tel:${SALON.phone.replace(/\s/g, "")}`}
                className="transition-colors hover:text-cream"
              >
                {SALON.phone}
              </a>
            </li>
            <li className="flex gap-2.5">
              <Mail className="mt-0.5 size-4 shrink-0 text-clay" />
              <a
                href={`mailto:${SALON.email}`}
                className="transition-colors hover:text-cream"
              >
                {SALON.email}
              </a>
            </li>
            <li className="flex gap-2.5">
              <Clock className="mt-0.5 size-4 shrink-0 text-clay" />
              <span>
                {SALON.hours.map((entry) => (
                  <span key={entry.days} className="block">
                    {entry.days}: {entry.time}
                  </span>
                ))}
              </span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-cream/10">
        <div className="shell flex flex-col items-start justify-between gap-3 py-5 text-[0.7rem] text-cream/40 sm:flex-row sm:items-center">
          <p>
            © {new Date().getFullYear()} {SALON.name}. All rights reserved.
          </p>
          <p className="font-mono tracking-[0.12em] uppercase">
            Cut · Colour · Care · Calm
          </p>
        </div>
      </div>
      <div
        aria-hidden
        className="pointer-events-none overflow-hidden px-2 pb-4 text-center font-display text-[15vw] leading-[0.72] font-bold text-cream/[0.035] select-none"
      >
        SALONBOOK
      </div>
    </footer>
  )
}
