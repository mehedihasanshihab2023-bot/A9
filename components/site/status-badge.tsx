import { cn } from "@/lib/utils"

const styles: Record<string, string> = {
  pending: "bg-warning/12 text-warning ring-warning/25",
  confirmed: "bg-success/12 text-success ring-success/25",
  cancelled: "bg-danger/10 text-danger ring-danger/20",
  unpaid: "bg-ink/6 text-ink/65 ring-ink/15",
  paid: "bg-success/12 text-success ring-success/25",
  failed: "bg-danger/10 text-danger ring-danger/20",
  active: "bg-success/12 text-success ring-success/25",
  inactive: "bg-ink/6 text-ink/55 ring-ink/15",
  admin: "bg-clay/12 text-clay-deep ring-clay/25",
  customer: "bg-sage/20 text-ink/70 ring-ink/10",
}

export function StatusBadge({
  status,
  className,
}: {
  status: string
  className?: string
}) {
  const key = status.toLowerCase()
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[0.6rem] font-semibold tracking-[0.12em] uppercase ring-1 ring-inset",
        styles[key] ?? "bg-ink/5 text-ink/60 ring-ink/10",
        className
      )}
    >
      <span className="size-1.25 rounded-full bg-current" />
      {status}
    </span>
  )
}
