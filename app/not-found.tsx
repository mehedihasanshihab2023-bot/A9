import Link from "next/link"
import { ArrowLeft, Scissors } from "lucide-react"

import { ButtonLink } from "@/components/ui/button"
import { Logo } from "@/components/site/logo"

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center bg-cream px-5 py-16">
      <div className="w-full max-w-lg text-center">
        <div className="flex justify-center">
          <Logo />
        </div>
        <p className="mt-10 font-mono text-[0.62rem] tracking-[0.3em] text-clay uppercase">
          Error 404
        </p>
        <h1 className="mt-3 font-display text-[3rem] leading-[0.95] font-bold sm:text-[4rem]">
          This page took
          <br />
          <span className="text-ink/30">a different chair.</span>
        </h1>
        <p className="mx-auto mt-4 max-w-sm text-[0.88rem] leading-relaxed text-ink/50">
          The link you followed does not exist or has been moved. The studio is
          still open — head back or browse the menu.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-2.5">
          <ButtonLink href="/">
            <ArrowLeft />
            Back home
          </ButtonLink>
          <ButtonLink href="/services" variant="outline">
            <Scissors />
            Browse services
          </ButtonLink>
        </div>
        <p className="mt-10 text-[0.68rem] text-ink/35">
          Looking for your bookings?{" "}
          <Link href="/dashboard" className="underline decoration-clay/40">
            Open the dashboard
          </Link>
        </p>
      </div>
    </div>
  )
}
