"use client"

import { AlertTriangle, RefreshCw } from "lucide-react"

import { Button, ButtonLink } from "@/components/ui/button"

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="grid min-h-[70vh] place-items-center bg-cream px-5 py-16">
      <div className="w-full max-w-md rounded-3xl border border-line bg-paper p-8 text-center">
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-danger/10 text-danger">
          <AlertTriangle className="size-6" />
        </span>
        <h1 className="mt-5 font-display text-2xl font-bold">
          Something pulled the wrong lever.
        </h1>
        <p className="mt-2 text-[0.83rem] leading-relaxed text-ink/50">
          {error.message ||
            "An unexpected error occurred while loading this page."}
        </p>
        <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
          <Button onClick={reset}>
            <RefreshCw />
            Try again
          </Button>
          <ButtonLink href="/" variant="outline">
            Back home
          </ButtonLink>
        </div>
        {error.digest && (
          <p className="mt-5 font-mono text-[0.55rem] tracking-[0.1em] text-ink/25">
            REF {error.digest}
          </p>
        )}
      </div>
    </div>
  )
}
