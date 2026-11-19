import Link from "next/link"
import type { ComponentProps, ReactNode } from "react"

import { cn } from "@/lib/utils"

type Variant =
  | "primary"
  | "outline"
  | "outlineLight"
  | "ghost"
  | "light"
  | "danger"
type Size = "sm" | "md" | "lg"

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-clay/40 focus-visible:ring-offset-2 focus-visible:ring-offset-cream disabled:pointer-events-none disabled:opacity-55 [&_svg]:size-4 [&_svg]:shrink-0"

const variants: Record<Variant, string> = {
  primary:
    "bg-clay text-paper hover:bg-clay-deep shadow-[0_8px_24px_-12px_rgba(197,102,62,0.7)] hover:shadow-[0_12px_28px_-12px_rgba(197,102,62,0.8)]",
  outline:
    "border border-ink/20 bg-transparent text-ink hover:border-ink/45 hover:bg-ink/5",
  outlineLight:
    "border border-cream/25 bg-transparent text-cream hover:border-cream/50 hover:bg-cream/10",
  ghost: "text-ink/70 hover:bg-ink/5 hover:text-ink",
  light: "bg-cream text-ink hover:bg-paper",
  danger: "bg-danger/10 text-danger hover:bg-danger/20",
}

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-[0.78rem]",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-[0.92rem] sm:h-13 sm:px-7",
}

export function buttonStyles({
  variant = "primary",
  size = "md",
  className,
}: {
  variant?: Variant
  size?: Size
  className?: string
} = {}) {
  return cn(base, variants[variant], sizes[size], className)
}

type ButtonProps = ComponentProps<"button"> & {
  variant?: Variant
  size?: Size
  children: ReactNode
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={buttonStyles({ variant, size, className })}
      {...props}
    >
      {children}
    </button>
  )
}

type ButtonLinkProps = ComponentProps<typeof Link> & {
  variant?: Variant
  size?: Size
  children: ReactNode
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonLinkProps) {
  return (
    <Link className={buttonStyles({ variant, size, className })} {...props}>
      {children}
    </Link>
  )
}
