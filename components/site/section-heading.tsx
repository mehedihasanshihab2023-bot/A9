import { cn } from "@/lib/utils"

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  tone = "dark",
  className,
}: {
  eyebrow?: string
  title: React.ReactNode
  description?: string
  align?: "left" | "center"
  tone?: "dark" | "light"
  className?: string
}) {
  return (
    <div
      className={cn(
        "max-w-2xl",
        align === "center" && "mx-auto text-center",
        className
      )}
    >
      {eyebrow && (
        <p
          className={cn(
            "eyebrow mb-4 flex items-center gap-2.5",
            align === "center" && "justify-center",
            tone === "dark" ? "text-clay" : "text-sage"
          )}
        >
          <span className="h-px w-7 bg-current" />
          {eyebrow}
        </p>
      )}
      <h2
        className={cn(
          "font-display text-[2.1rem] leading-[1.04] font-bold sm:text-[2.8rem]",
          tone === "light" ? "text-cream" : "text-ink"
        )}
      >
        {title}
      </h2>
      {description && (
        <p
          className={cn(
            "mt-4 text-[0.95rem] leading-relaxed",
            tone === "light" ? "text-cream/60" : "text-ink/55"
          )}
        >
          {description}
        </p>
      )}
    </div>
  )
}
