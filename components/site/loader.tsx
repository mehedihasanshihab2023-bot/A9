import { Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"

export function Loader({
  label = "Loading…",
  className,
}: {
  label?: string
  className?: string
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex flex-col items-center justify-center gap-3 py-20 text-center",
        className
      )}
    >
      <span className="relative grid size-12 place-items-center rounded-full border border-line bg-paper">
        <Loader2 className="size-5 animate-spin text-clay" />
      </span>
      <p className="font-mono text-[0.66rem] tracking-[0.18em] text-ink/50 uppercase">
        {label}
      </p>
    </div>
  )
}

export function PageLoader({ label = "Loading your dashboard…" }) {
  return (
    <div className="grid min-h-[60vh] place-items-center">
      <Loader label={label} />
    </div>
  )
}
