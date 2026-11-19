"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  CalendarDays,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  Phone,
  UserRound,
  X,
} from "lucide-react"

import { useAuth } from "@/components/providers/auth-provider"
import { ButtonLink } from "@/components/ui/button"
import { Logo } from "@/components/site/logo"
import { signOut } from "@/lib/auth-client"
import { API_URL } from "@/lib/api"
import { SALON } from "@/lib/constants"
import { cn, initials } from "@/lib/utils"

const links = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/#why", label: "Why SalonBook" },
  { href: "/#visit", label: "Visit us" },
]

export function Navbar() {
  const { user, isAdmin, isPending } = useAuth()
  const [open, setOpen] = useState(false)
  const [dropdown, setDropdown] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdown(false)
      }
    }
    document.addEventListener("mousedown", onClick)
    return () => document.removeEventListener("mousedown", onClick)
  }, [])

  async function handleSignOut() {
    setSigningOut(true)
    try {
      await signOut()
      await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      })
    } finally {
      window.location.assign("/")
    }
  }

  const dashboardHref = isAdmin ? "/dashboard/admin" : "/dashboard"

  return (
    <header className="sticky top-0 z-50">
      {/* Utility strip */}
      <div className="hidden bg-ink text-cream/70 md:block">
        <div className="shell flex h-9 items-center justify-between font-mono text-[0.6rem] tracking-[0.13em] uppercase">
          <span className="inline-flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-sage" />
            Open today until 8:00 PM
          </span>
          <div className="flex items-center gap-6">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="size-3" />
              {SALON.address}
            </span>
            <a
              href={`tel:${SALON.phone.replace(/\s/g, "")}`}
              className="inline-flex items-center gap-1.5 transition-colors hover:text-cream"
            >
              <Phone className="size-3" />
              {SALON.phone}
            </a>
          </div>
        </div>
      </div>

      <div className="border-b border-line/80 bg-paper/92 backdrop-blur-xl">
        <div className="shell flex h-[4.4rem] items-center justify-between gap-4">
          <Logo />

          <nav className="hidden items-center gap-1 lg:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-full px-3.5 py-2 text-[0.82rem] font-medium text-ink/65 transition-colors hover:bg-sand/40 hover:text-ink"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-2.5 lg:flex">
            {isPending ? (
              <span className="h-9 w-24 animate-pulse rounded-full bg-sand/60" />
            ) : user ? (
              <>
                <ButtonLink
                  href={dashboardHref}
                  variant="ghost"
                  size="sm"
                  className="px-3"
                >
                  <LayoutDashboard />
                  Dashboard
                </ButtonLink>
                <div className="relative" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setDropdown((value) => !value)}
                    aria-expanded={dropdown}
                    className="flex items-center gap-2 rounded-full border border-line bg-cream/60 py-1 pr-2.5 pl-1 transition-colors hover:border-ink/30"
                  >
                    <span className="relative grid size-8 place-items-center overflow-hidden rounded-full bg-ink text-[0.65rem] font-bold text-cream">
                      {user.image ? (
                        <Image
                          src={user.image}
                          alt={user.name}
                          width={32}
                          height={32}
                          unoptimized
                          className="size-full object-cover"
                        />
                      ) : (
                        initials(user.name)
                      )}
                    </span>
                    <span className="max-w-[7.5rem] truncate text-[0.78rem] font-semibold">
                      {user.name.split(" ")[0]}
                    </span>
                    <ChevronDown
                      className={cn(
                        "size-3.5 text-ink/45 transition-transform",
                        dropdown && "rotate-180"
                      )}
                    />
                  </button>

                  {dropdown && (
                    <div className="absolute right-0 top-[calc(100%+0.6rem)] w-60 overflow-hidden rounded-2xl border border-line bg-paper p-1.5 shadow-[0_24px_60px_-24px_rgba(16,25,21,0.35)]">
                      <div className="border-b border-line/80 px-3 pt-2 pb-3">
                        <p className="truncate text-sm font-semibold">
                          {user.name}
                        </p>
                        <p className="truncate text-xs text-ink/50">
                          {user.email}
                        </p>
                        <span className="mt-2 inline-flex rounded-full bg-clay/10 px-2 py-0.5 font-mono text-[0.52rem] font-semibold tracking-[0.14em] text-clay-deep uppercase">
                          {isAdmin ? "Administrator" : "Customer"}
                        </span>
                      </div>
                      <Link
                        href={dashboardHref}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-ink/75 transition-colors hover:bg-cream hover:text-ink"
                      >
                        <LayoutDashboard className="size-4" />
                        Dashboard
                      </Link>
                      <Link
                        href="/dashboard/profile"
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-ink/75 transition-colors hover:bg-cream hover:text-ink"
                      >
                        <UserRound className="size-4" />
                        My profile
                      </Link>
                      <button
                        type="button"
                        onClick={handleSignOut}
                        disabled={signingOut}
                        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-danger transition-colors hover:bg-danger/8 disabled:opacity-60"
                      >
                        <LogOut className="size-4" />
                        {signingOut ? "Signing out…" : "Sign out"}
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  className="px-3 py-2 text-[0.82rem] font-semibold text-ink/70 transition-colors hover:text-ink"
                >
                  Sign in
                </Link>
                <ButtonLink href="/services" size="sm" className="px-4">
                  <CalendarDays />
                  Book now
                </ButtonLink>
              </>
            )}
          </div>

          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
            className="grid size-10 place-items-center rounded-full border border-line bg-cream/60 text-ink lg:hidden"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="border-t border-line bg-paper lg:hidden">
            <div className="shell space-y-1 py-4">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-xl px-3 py-2.5 text-sm font-medium text-ink/75 transition-colors hover:bg-cream"
                >
                  {link.label}
                </Link>
              ))}
              <div className="my-3 h-px bg-line" />
              {user ? (
                <>
                  <div className="flex items-center gap-3 px-3 pb-3">
                    <span className="relative grid size-10 place-items-center overflow-hidden rounded-full bg-ink text-xs font-bold text-cream">
                      {user.image ? (
                        <Image
                          src={user.image}
                          alt={user.name}
                          width={40}
                          height={40}
                          unoptimized
                          className="size-full object-cover"
                        />
                      ) : (
                        initials(user.name)
                      )}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{user.name}</p>
                      <p className="truncate text-xs text-ink/50">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <Link
                    href={dashboardHref}
                    onClick={() => setOpen(false)}
                    className="block rounded-xl px-3 py-2.5 text-sm text-ink/75 hover:bg-cream"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/dashboard/profile"
                    onClick={() => setOpen(false)}
                    className="block rounded-xl px-3 py-2.5 text-sm text-ink/75 hover:bg-cream"
                  >
                    My profile
                  </Link>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    disabled={signingOut}
                    className="block w-full rounded-xl px-3 py-2.5 text-left text-sm text-danger hover:bg-danger/8"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-2 px-1 pb-2">
                  <ButtonLink href="/sign-in" variant="outline" size="md">
                    Sign in
                  </ButtonLink>
                  <ButtonLink href="/sign-up" size="md">
                    <CalendarDays />
                    Create an account
                  </ButtonLink>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
