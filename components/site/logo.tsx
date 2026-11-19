import Link from "next/link"
import { Scissors } from "lucide-react"

import { cn } from "@/lib/utils"

export function Logo({
  className,
  tone = "dark",
  compact = false,
}: {
  className?: string
  tone?: "dark" | "light"
  compact?: boolean
}) {
  return (
    <Link
      href="/"
      aria-label="SalonBook home"
      className={cn("group inline-flex items-center gap-2.5", className)}
    >
      <span className="relative grid size-9 place-items-center rounded-xl bg-clay text-paper shadow-[inset_0_-2px_0_rgba(0,0,0,0.12)] transition-transform group-hover:-rotate-6">
        <Scissors className="size-4.5" strokeWidth={2.2} />
      </span>
      {!compact && (
        <span className="leading-none">
          <span
            className={cn(
              "block font-display text-[1.22rem] font-bold tracking-tight",
              tone === "dark" ? "text-ink" : "text-cream"
            )}
          >
            Salon<span className="text-clay">Book</span>
          </span>
          <span
            className={cn(
              "mt-1 block font-mono text-[0.5rem] tracking-[0.24em] uppercase",
              tone === "dark" ? "text-ink/45" : "text-cream/45"
            )}
          >
            Grooming studio
          </span>
        </span>
      )}
    </Link>
  )
}
