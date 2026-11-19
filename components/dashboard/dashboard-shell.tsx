"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  CalendarDays,
  LayoutDashboard,
  LogOut,
  Menu,
  ReceiptText,
  Scissors,
  Sparkles,
  UserRound,
  Users,
  X,
} from "lucide-react"

import { useAuth } from "@/components/providers/auth-provider"
import { clientSignOut } from "@/components/providers/require-role"
import { Logo } from "@/components/site/logo"
import { cn, initials } from "@/lib/utils"

type NavItem = {
  href: string
  label: string
  icon: typeof LayoutDashboard
  exact?: boolean
}

const customerNav: NavItem[] = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/appointments", label: "My appointments", icon: CalendarDays },
  { href: "/dashboard/profile", label: "My profile", icon: UserRound },
]

const adminNav: NavItem[] = [
  { href: "/dashboard/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/admin/services", label: "Services", icon: Scissors },
  { href: "/dashboard/admin/appointments", label: "Appointments", icon: CalendarDays },
  { href: "/dashboard/admin/users", label: "Customers", icon: Users },
  { href: "/dashboard/admin/transactions", label: "Transactions", icon: ReceiptText },
  { href: "/dashboard/profile", label: "My profile", icon: UserRound },
]

function isActive(pathname: string, item: NavItem) {
  if (item.exact) return pathname === item.href
  return pathname === item.href || pathname.startsWith(`${item.href}/`)
}

function NavSection({
  items,
  pathname,
  onNavigate,
}: {
  items: NavItem[]
  pathname: string
  onNavigate?: () => void
}) {
  return (
    <nav className="space-y-1">
      {items.map((item) => {
        const active = isActive(pathname, item)
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[0.8rem] font-medium transition-all",
              active
                ? "bg-cream text-ink shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]"
                : "text-cream/55 hover:bg-cream/[0.06] hover:text-cream"
            )}
          >
            <item.icon
              className={cn(
                "size-4 shrink-0",
                active ? "text-clay-deep" : "text-cream/40"
              )}
            />
            {item.label}
            {active && (
              <span className="ml-auto size-1.5 rounded-full bg-clay" />
            )}
          </Link>
        )
      })}
    </nav>
  )
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { user, isAdmin, isPending } = useAuth()
  const [open, setOpen] = useState(false)

  const nav = isAdmin ? adminNav : customerNav
  const panelId = "dashboard-sidebar"
  const spaceLabel = isPending
    ? "Loading your space…"
    : isAdmin
      ? "Admin console"
      : "Customer space"
  const sectionLabel = isPending ? "Menu" : isAdmin ? "Manage" : "Account"
  const roleLabel = isPending
    ? "Checking role…"
    : isAdmin
      ? "Administrator"
      : "Customer"

  return (
    <div className="min-h-screen bg-cream lg:grid lg:grid-cols-[16.5rem_1fr]">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen flex-col overflow-y-auto bg-ink px-4 py-5 lg:flex">
        <div className="px-1.5">
          <Logo tone="light" />
        </div>

        <div className="mt-7 rounded-2xl border border-cream/10 bg-cream/[0.04] p-3.5">
          <div className="flex items-center gap-2">
            <span className="grid size-7 place-items-center rounded-lg bg-clay/15 text-clay">
              <Sparkles className="size-3.5" />
            </span>
            <p className="font-mono text-[0.55rem] tracking-[0.14em] text-cream/50 uppercase">
              {spaceLabel}
            </p>
          </div>
          <p className="mt-2.5 text-[0.72rem] leading-relaxed text-cream/40">
            {isPending
              ? "Verifying your session with the studio…"
              : isAdmin
                ? "Manage the menu, confirm appointments and keep the studio moving."
                : "Track requests, pay confirmed visits and manage your profile."}
          </p>
        </div>

        <div className="mt-6 flex-1">
          <p className="mb-2 px-3 font-mono text-[0.52rem] tracking-[0.18em] text-cream/25 uppercase">
            {sectionLabel}
          </p>
          {isPending ? (
            <div className="space-y-2 px-1">
              {[0, 1, 2].map((item) => (
                <div
                  key={item}
                  className="h-9 animate-pulse rounded-xl bg-cream/[0.06]"
                />
              ))}
            </div>
          ) : (
            <NavSection items={nav} pathname={pathname} />
          )}
        </div>

        <div className="mt-5 border-t border-cream/10 pt-4">
          <div className="flex items-center gap-2.5 px-1.5">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-cream/10 text-[0.65rem] font-bold text-cream">
              {initials(user?.name)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[0.76rem] font-semibold text-cream">
                {user?.name ?? "Loading…"}
              </p>
              <p className="truncate text-[0.62rem] text-cream/40">
                {user?.email}
              </p>
            </div>
            <button
              type="button"
              onClick={() => void clientSignOut()}
              className="grid size-8 shrink-0 place-items-center rounded-full text-cream/40 transition-colors hover:bg-cream/10 hover:text-cream"
              aria-label="Sign out"
              title="Sign out"
            >
              <LogOut className="size-4" />
            </button>
          </div>
          <Link
            href="/"
            className="mt-3 flex items-center justify-center rounded-xl border border-cream/10 py-2 text-[0.68rem] font-medium text-cream/45 transition-colors hover:border-cream/25 hover:text-cream"
          >
            Back to website
          </Link>
        </div>
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-ink/60 backdrop-blur-sm"
          />
          <aside
            id={panelId}
            className="relative flex h-full w-[17rem] max-w-[84vw] flex-col overflow-y-auto bg-ink px-4 py-5"
          >
            <div className="flex items-center justify-between px-1.5">
              <Logo tone="light" />
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="grid size-8 place-items-center rounded-full text-cream/50 hover:bg-cream/10"
                aria-label="Close menu"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="mt-7 flex-1">
              <p className="mb-2 px-3 font-mono text-[0.52rem] tracking-[0.18em] text-cream/25 uppercase">
                {sectionLabel}
              </p>
              <NavSection
                items={nav}
                pathname={pathname}
                onNavigate={() => setOpen(false)}
              />
            </div>
            <button
              type="button"
              onClick={() => void clientSignOut()}
              className="mt-4 flex items-center gap-2 rounded-xl border border-cream/10 px-3 py-2.5 text-[0.78rem] text-cream/55"
            >
              <LogOut className="size-4" />
              Sign out
            </button>
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex min-h-screen min-w-0 flex-col">
        <header className="sticky top-0 z-40 border-b border-line bg-cream/90 backdrop-blur-xl">
          <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-7">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setOpen(true)}
                aria-controls={panelId}
                aria-expanded={open}
                className="grid size-9 place-items-center rounded-full border border-line bg-paper text-ink lg:hidden"
                aria-label="Open dashboard menu"
              >
                <Menu className="size-4.5" />
              </button>
              <div>
                <p className="font-mono text-[0.52rem] tracking-[0.16em] text-ink/35 uppercase">
                  {isPending
                    ? "Checking your session"
                    : isAdmin
                      ? "Admin dashboard"
                      : "Customer dashboard"}
                </p>
                <p className="text-[0.86rem] font-semibold text-ink">
                  {isPending
                    ? "Verifying access…"
                    : `${greeting()}, ${user?.name?.split(" ")[0] ?? "there"}`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="hidden rounded-full border border-line bg-paper px-3 py-1.5 font-mono text-[0.55rem] tracking-[0.12em] text-ink/45 uppercase sm:inline-flex">
                {roleLabel}
              </span>
              <span className="grid size-9 place-items-center rounded-full bg-ink text-[0.65rem] font-bold text-cream">
                {initials(user?.name)}
              </span>
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-7 sm:py-8">{children}</main>

        <footer className="border-t border-line px-4 py-4 sm:px-7">
          <p className="flex flex-wrap items-center justify-between gap-2 font-mono text-[0.55rem] tracking-[0.12em] text-ink/30 uppercase">
            <span>SalonBook studio console</span>
            <span>Need help? hello@salonbook.com</span>
          </p>
        </footer>
      </div>
    </div>
  )
}

function greeting() {
  const hour = new Date().getHours()
  if (hour < 12) return "Good morning"
  if (hour < 18) return "Good afternoon"
  return "Good evening"
}
