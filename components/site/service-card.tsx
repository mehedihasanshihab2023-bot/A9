import Image from "next/image"
import Link from "next/link"
import { ArrowUpRight, Clock } from "lucide-react"

import type { Service } from "@/lib/types"
import { durationLabel, formatMoney } from "@/lib/format"
import { cn } from "@/lib/utils"

export function ServiceCard({
  service,
  className,
  priority = false,
}: {
  service: Service
  className?: string
  priority?: boolean
}) {
  return (
    <article
      className={cn(
        "group card flex flex-col overflow-hidden p-2.5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_50px_-30px_rgba(16,25,21,0.45)]",
        className
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden rounded-[0.95rem] bg-sand">
        <Image
          src={service.image}
          alt={service.serviceName}
          fill
          priority={priority}
          sizes="(max-width: 640px) 92vw, (max-width: 1024px) 45vw, 30vw"
          className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/45 via-transparent to-transparent" />
        <span className="absolute top-3 left-3 rounded-full bg-paper/95 px-2.5 py-1 font-mono text-[0.58rem] font-semibold tracking-[0.13em] text-ink uppercase backdrop-blur">
          {service.category}
        </span>
        <span className="absolute right-3 bottom-3 inline-flex items-center gap-1 rounded-full bg-ink/80 px-2.5 py-1 font-mono text-[0.6rem] tracking-wide text-cream backdrop-blur">
          <Clock className="size-3" />
          {durationLabel(service.duration)}
        </span>
      </div>

      <div className="flex flex-1 flex-col px-2.5 pt-4 pb-2">
        <h3 className="font-display text-[1.08rem] leading-snug font-semibold text-ink">
          {service.serviceName}
        </h3>
        <p className="mt-1.5 line-clamp-2 text-[0.8rem] leading-relaxed text-ink/50">
          {service.description}
        </p>

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-line/70 pt-3.5 mt-4">
          <span className="font-display text-lg font-bold text-ink">
            {formatMoney(service.price)}
          </span>
          <Link
            href={`/services/${service._id}`}
            className="inline-flex items-center gap-1.5 rounded-full bg-ink px-3.5 py-2 text-[0.72rem] font-semibold text-cream transition-colors hover:bg-clay"
          >
            View details
            <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>
      </div>
    </article>
  )
}
