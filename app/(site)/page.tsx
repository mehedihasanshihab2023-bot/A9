import Image from "next/image"
import Link from "next/link"
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  CalendarCheck2,
  Clock3,
  Quote,
  Scissors,
  ShieldCheck,
  Sparkles,
  Star,
} from "lucide-react"

import { ButtonLink } from "@/components/ui/button"
import { ServiceCard } from "@/components/site/service-card"
import { SectionHeading } from "@/components/site/section-heading"
import { getFeaturedServices } from "@/lib/data"
import { CATEGORY_IMAGES, SERVICE_CATEGORIES, SALON } from "@/lib/constants"
import type { Service } from "@/lib/types"

export const dynamic = "force-dynamic"

const HERO_MAIN =
  "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=1200&auto=format&fit=crop"
const HERO_SMALL =
  "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?q=80&w=800&auto=format&fit=crop"
const WHY_IMAGE =
  "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?q=80&w=1100&auto=format&fit=crop"

const marquee = [
  "Precision cuts",
  "Colour lab",
  "Beard sculpting",
  "Skin rituals",
  "Spa recovery",
  "Nail care",
  "Head massage",
]

const steps = [
  {
    number: "01",
    title: "Pick your service",
    text: "Search the menu, filter by category and compare price, duration and what is included.",
    icon: Scissors,
  },
  {
    number: "02",
    title: "Request a slot",
    text: "Choose a date and a time that fits your day. The studio reviews and confirms every request.",
    icon: CalendarCheck2,
  },
  {
    number: "03",
    title: "Pay when confirmed",
    text: "No prepayment. Once we confirm your chair, pay securely through Stripe from your dashboard.",
    icon: ShieldCheck,
  },
]

const team = [
  {
    name: "Arman Hossain",
    role: "Master barber · fades & scissor work",
    image:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=800&auto=format&fit=crop",
    years: "11 yrs",
  },
  {
    name: "Daniel Cruz",
    role: "Colour specialist · grey blending",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=800&auto=format&fit=crop",
    years: "8 yrs",
  },
  {
    name: "Rafi Chowdhury",
    role: "Skin therapist · hydra facials",
    image:
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=800&auto=format&fit=crop",
    years: "6 yrs",
  },
]

const testimonials = [
  {
    name: "Tanvir Ahmed",
    role: "Product designer",
    text: "The whole thing took under two minutes. I requested a fade on Friday, the studio confirmed in the evening, and I paid from my phone on the way in.",
  },
  {
    name: "Sajid Karim",
    role: "Regular since 2021",
    text: "Finally a salon menu that makes sense. Real prices, real durations, no calling around. My barber already knows exactly what I want.",
  },
  {
    name: "Imran Hasan",
    role: "First-time guest",
    text: "I liked that payment only opens after confirmation. Felt fair, and the reminder in the dashboard kept everything in one place.",
  },
]

const fallbackFeatured: Service[] = []

export default async function HomePage() {
  let featured: Service[] = fallbackFeatured
  let failed = false

  try {
    featured = await getFeaturedServices()
  } catch {
    failed = true
  }

  return (
    <>
      {/* ------------------------------- Hero ------------------------------- */}
      <section className="hero-glow relative overflow-hidden bg-ink text-cream">
        <div className="grid-lines pointer-events-none absolute inset-0 opacity-60" />
        <div className="shell relative grid items-center gap-14 pt-14 pb-16 lg:grid-cols-[1.03fr_0.97fr] lg:gap-10 lg:pt-20 lg:pb-24">
          <div className="max-w-xl">
            <div className="mb-7 flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-2 rounded-full border border-cream/15 bg-cream/[0.06] px-3 py-1.5 font-mono text-[0.6rem] tracking-[0.16em] text-cream/75 uppercase backdrop-blur">
                <span className="size-1.5 animate-pulse rounded-full bg-sage" />
                Open today until 8 PM
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-cream/15 px-3 py-1.5 font-mono text-[0.6rem] tracking-[0.16em] text-cream/55 uppercase">
                Banani · Dhaka
              </span>
            </div>

            <h1 className="font-display text-[3.1rem] leading-[0.92] font-bold tracking-[-0.045em] sm:text-[4.2rem] lg:text-[4.6rem]">
              Sharp looks.
              <br />
              <span className="text-clay">Zero waiting.</span>
            </h1>

            <p className="mt-6 max-w-md text-[0.95rem] leading-relaxed text-cream/60">
              A modern grooming studio for hair, skin, nails and spa rituals.
              Browse the full menu, request a time that suits you, and pay only
              once the chair is confirmed.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <ButtonLink href="/services" size="lg">
                Explore salon services
                <ArrowRight />
              </ButtonLink>
              <ButtonLink
                href="/sign-up"
                variant="outlineLight"
                size="lg"
              >
                Create an account
              </ButtonLink>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-6 border-t border-cream/10 pt-6">
              <div className="flex -space-x-2.5">
                {team.map((member) => (
                  <span
                    key={member.name}
                    className="relative size-9 overflow-hidden rounded-full border-2 border-ink"
                  >
                    <Image
                      src={member.image}
                      alt={member.name}
                      fill
                      sizes="36px"
                      className="object-cover"
                    />
                  </span>
                ))}
                <span className="grid size-9 place-items-center rounded-full border-2 border-ink bg-cream/10 font-mono text-[0.55rem] text-cream/80">
                  +7
                </span>
              </div>
              <div>
                <div className="flex items-center gap-1 text-clay">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star key={index} className="size-3.5 fill-current" />
                  ))}
                  <span className="ml-1 text-[0.72rem] font-semibold text-cream">
                    4.9 / 5
                  </span>
                </div>
                <p className="mt-0.5 text-[0.7rem] text-cream/45">
                  From 800+ verified studio visits
                </p>
              </div>
              <div className="hidden h-9 w-px bg-cream/10 sm:block" />
              <div className="hidden sm:block">
                <p className="font-display text-lg font-semibold">8k+</p>
                <p className="text-[0.65rem] tracking-wide text-cream/45 uppercase">
                  Appointments booked
                </p>
              </div>
            </div>
          </div>

          {/* Image collage */}
          <div className="relative mx-auto w-full max-w-[34rem] lg:max-w-none">
            <div className="pointer-events-none absolute -inset-x-4 -top-5 bottom-10 rounded-[2.6rem] border border-cream/10" />
            <div className="relative grid grid-cols-[1.55fr_1fr] gap-3">
              <div className="relative aspect-[3/4.4] overflow-hidden rounded-[1.8rem] bg-ink-soft">
                <Image
                  src={HERO_MAIN}
                  alt="Barber finishing a precision haircut"
                  fill
                  priority
                  sizes="(max-width: 1024px) 55vw, 30vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/55 via-transparent to-transparent" />
                <div className="absolute inset-x-4 bottom-4 rounded-2xl border border-cream/15 bg-ink/55 p-3 backdrop-blur-md">
                  <p className="font-mono text-[0.55rem] tracking-[0.16em] text-sage uppercase">
                    Next opening
                  </p>
                  <p className="mt-1 font-display text-base font-semibold">
                    Today · 4:30 PM
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <div className="relative aspect-[3/4] overflow-hidden rounded-[1.5rem] bg-ink-soft">
                  <Image
                    src={HERO_SMALL}
                    alt="Close-up of a clipper fade"
                    fill
                    priority
                    sizes="(max-width: 1024px) 32vw, 18vw"
                    className="object-cover"
                  />
                </div>
                <div className="relative flex flex-1 flex-col justify-between overflow-hidden rounded-[1.5rem] bg-clay p-4 text-paper">
                  <Sparkles className="size-5 opacity-80" />
                  <div>
                    <p className="font-display text-[1.35rem] leading-[1.05] font-bold">
                      Grooming
                      <br />
                      done properly.
                    </p>
                    <p className="mt-2 font-mono text-[0.52rem] tracking-[0.15em] text-paper/70 uppercase">
                      Est. 2012
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute -top-3 right-4 grid size-[5.6rem] rotate-6 place-items-center rounded-full border border-cream/20 bg-ink/80 text-center backdrop-blur-md sm:right-8">
              <div>
                <p className="font-display text-xl font-bold">4.9</p>
                <div className="flex justify-center text-clay">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star key={index} className="size-2.5 fill-current" />
                  ))}
                </div>
                <p className="mt-1 font-mono text-[0.44rem] tracking-[0.13em] text-cream/50 uppercase">
                  800+ reviews
                </p>
              </div>
            </div>

            <div className="absolute -bottom-5 left-2 hidden items-center gap-2.5 rounded-2xl border border-cream/15 bg-paper px-3.5 py-2.5 text-ink shadow-xl sm:flex">
              <span className="grid size-8 place-items-center rounded-full bg-sage/25 text-ink">
                <BadgeCheck className="size-4" />
              </span>
              <div>
                <p className="text-[0.7rem] font-bold">Verified studio</p>
                <p className="text-[0.63rem] text-ink/50">Trusted since 2012</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------ Marquee ----------------------------- */}
      <div className="overflow-hidden border-y border-ink/10 bg-clay py-3 text-paper">
        <div className="marquee-track items-center gap-8">
          {[...marquee, ...marquee].map((item, index) => (
            <span
              key={`${item}-${index}`}
              className="inline-flex shrink-0 items-center gap-8 font-mono text-[0.62rem] font-semibold tracking-[0.2em] uppercase"
            >
              {item}
              <span className="text-paper/40">✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* -------------------------- Featured services ----------------------- */}
      <section className="shell py-16 sm:py-20">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-5">
          <SectionHeading
            eyebrow="The current menu"
            title={
              <>
                Featured services,
                <br />
                <span className="text-clay">ready to book.</span>
              </>
            }
            description="Six of the studio's most requested treatments this season. Every card below is pulled live from the salon's active menu."
          />
          <ButtonLink href="/services" variant="outline" className="shrink-0">
            View all services
            <ArrowUpRight />
          </ButtonLink>
        </div>

        {failed ? (
          <div className="rounded-2xl border border-dashed border-line bg-paper/70 px-6 py-12 text-center">
            <p className="font-display text-lg font-semibold">
              The menu is taking a short break.
            </p>
            <p className="mt-2 text-sm text-ink/55">
              We could not reach the salon server. Please refresh in a moment or
              browse the full services page.
            </p>
            <ButtonLink href="/services" variant="outline" className="mt-5">
              Browse services
            </ButtonLink>
          </div>
        ) : featured.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-line bg-paper/70 px-6 py-12 text-center">
            <p className="font-display text-lg font-semibold">
              No services are live yet.
            </p>
            <p className="mt-2 text-sm text-ink/55">
              The administrator has not published any treatments. Please check
              back soon.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.slice(0, 6).map((service, index) => (
              <ServiceCard
                key={service._id}
                service={service}
                priority={index < 3}
              />
            ))}
          </div>
        )}
      </section>

      {/* ------------------------------ Categories -------------------------- */}
      <section className="border-y border-line bg-paper py-16 sm:py-20">
        <div className="shell grid gap-12 lg:grid-cols-[0.75fr_1.25fr]">
          <div className="lg:sticky lg:top-32 lg:self-start">
            <SectionHeading
              eyebrow="Find your ritual"
              title={
                <>
                  Seven worlds
                  <br />
                  of self-care.
                </>
              }
              description="From a 30-minute cleanup to a full spa afternoon — jump straight into the category you need."
            />
            <div className="mt-7 flex items-center gap-4 rounded-2xl border border-line bg-cream/60 p-4">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-clay/12 text-clay-deep">
                <Clock3 className="size-4.5" />
              </span>
              <p className="text-[0.8rem] leading-relaxed text-ink/60">
                Same-day requests are welcome. Confirmations usually arrive
                within two working hours.
              </p>
            </div>
          </div>

          <div className="divide-y divide-line border-y border-line">
            {SERVICE_CATEGORIES.map((category, index) => (
              <Link
                key={category}
                href={`/services?category=${encodeURIComponent(category)}`}
                className="group flex items-center gap-4 py-3.5 transition-colors hover:bg-cream/60 sm:gap-6 sm:px-3"
              >
                <span className="w-7 font-mono text-[0.65rem] text-ink/35">
                  0{index + 1}
                </span>
                <span className="relative hidden h-14 w-20 shrink-0 overflow-hidden rounded-xl bg-sand sm:block">
                  <Image
                    src={CATEGORY_IMAGES[category]}
                    alt={category}
                    fill
                    sizes="80px"
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-lg font-semibold tracking-tight sm:text-xl">
                    {category}
                  </span>
                  <span className="mt-0.5 block text-[0.72rem] text-ink/45">
                    {index % 2 === 0
                      ? "Signature studio treatments"
                      : "Consultation-led rituals"}
                  </span>
                </span>
                <span className="grid size-9 shrink-0 place-items-center rounded-full border border-line transition-all group-hover:border-ink group-hover:bg-ink group-hover:text-cream">
                  <ArrowUpRight className="size-4" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* -------------------------------- Why ------------------------------- */}
      <section id="why" className="shell scroll-mt-28 py-16 sm:py-20">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="relative">
            <div className="relative aspect-[4/4.4] overflow-hidden rounded-[2rem] bg-sand sm:aspect-[4/3.6] lg:aspect-[4/4.6]">
              <Image
                src={WHY_IMAGE}
                alt="A barber at work in the SalonBook studio"
                fill
                sizes="(max-width: 1024px) 92vw, 45vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-ink/45 via-transparent to-transparent" />
            </div>
            <div className="absolute -right-3 bottom-6 w-44 rounded-2xl bg-paper p-4 shadow-[0_24px_50px_-24px_rgba(16,25,21,0.4)] sm:-right-6 sm:w-52">
              <p className="font-mono text-[0.55rem] tracking-[0.15em] text-clay uppercase">
                The promise
              </p>
              <p className="mt-1.5 font-display text-[1.05rem] leading-snug font-semibold">
                No prepayment. No phone tag. No surprises.
              </p>
            </div>
          </div>

          <div>
            <SectionHeading
              eyebrow="Why SalonBook"
              title={
                <>
                  A calmer way
                  <br />
                  to book a chair.
                </>
              }
              description="We built SalonBook around three simple rules: see the real menu, request a real slot, and pay only after a human confirms."
            />

            <div className="mt-8 space-y-3">
              {steps.map((step) => (
                <div
                  key={step.number}
                  className="group flex gap-4 rounded-2xl border border-line bg-paper p-4 transition-colors hover:border-ink/25 sm:p-5"
                >
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-cream text-ink/70 transition-colors group-hover:bg-clay group-hover:text-paper">
                    <step.icon className="size-5" />
                  </span>
                  <div>
                    <div className="flex items-baseline gap-2.5">
                      <span className="font-mono text-[0.6rem] text-clay">
                        {step.number}
                      </span>
                      <h3 className="font-display text-base font-semibold">
                        {step.title}
                      </h3>
                    </div>
                    <p className="mt-1 text-[0.82rem] leading-relaxed text-ink/55">
                      {step.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <ButtonLink href="/services" className="mt-7">
              Find your next appointment
              <ArrowRight />
            </ButtonLink>
          </div>
        </div>
      </section>

      {/* -------------------------------- Team ------------------------------ */}
      <section className="bg-ink py-16 text-cream sm:py-20">
        <div className="shell">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
            <SectionHeading
              tone="light"
              eyebrow="The chairs"
              title={
                <>
                  People who know
                  <br />
                  their craft.
                </>
              }
              description="Every artist on our floor specialises. You are matched with the right chair, not the next available one."
            />
            <p className="max-w-xs text-[0.8rem] leading-relaxed text-cream/45">
              Between them, the team has more than two decades behind the chair
              — from classic scissor work to advanced colour correction.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {team.map((member) => (
              <article
                key={member.name}
                className="group overflow-hidden rounded-2xl border border-cream/10 bg-cream/[0.04] p-2.5 transition-colors hover:border-cream/25"
              >
                <div className="relative aspect-[4/4.2] overflow-hidden rounded-xl bg-ink-soft">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    sizes="(max-width: 1024px) 90vw, 30vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                  />
                  <span className="absolute top-3 right-3 rounded-full bg-ink/75 px-2.5 py-1 font-mono text-[0.55rem] tracking-[0.12em] text-cream uppercase backdrop-blur">
                    {member.years}
                  </span>
                </div>
                <div className="px-2 pt-4 pb-1.5">
                  <h3 className="font-display text-lg font-semibold">
                    {member.name}
                  </h3>
                  <p className="mt-1 text-[0.76rem] leading-relaxed text-cream/45">
                    {member.role}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ----------------------------- Testimonials ------------------------- */}
      <section className="shell py-16 sm:py-20">
        <SectionHeading
          align="center"
          eyebrow="From the chair"
          title="Words from our regulars"
          description="Real feedback from guests who booked, confirmed and paid through SalonBook."
        />
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {testimonials.map((item) => (
            <figure
              key={item.name}
              className="card flex flex-col p-6"
            >
              <Quote className="size-6 text-clay/40" />
              <blockquote className="mt-4 flex-1 text-[0.87rem] leading-relaxed text-ink/70">
                “{item.text}”
              </blockquote>
              <figcaption className="mt-5 flex items-center gap-3 border-t border-line pt-4">
                <span className="grid size-9 place-items-center rounded-full bg-ink font-display text-xs font-bold text-cream">
                  {item.name
                    .split(" ")
                    .map((part) => part[0])
                    .join("")}
                </span>
                <span>
                  <span className="block text-[0.8rem] font-semibold">
                    {item.name}
                  </span>
                  <span className="block text-[0.69rem] text-ink/45">
                    {item.role}
                  </span>
                </span>
                <span className="ml-auto flex text-clay">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star key={index} className="size-3 fill-current" />
                  ))}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* ------------------------------- Visit CTA -------------------------- */}
      <section className="shell pb-20">
        <div className="hero-glow relative overflow-hidden rounded-[2rem] bg-ink px-6 py-12 text-cream sm:px-12 sm:py-16">
          <div className="grid-lines pointer-events-none absolute inset-0 opacity-50" />
          <div className="relative grid items-center gap-10 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <p className="eyebrow flex items-center gap-2.5 text-sage">
                <span className="h-px w-7 bg-current" />
                Your chair is waiting
              </p>
              <h2 className="mt-4 max-w-xl font-display text-[2.2rem] leading-[1.02] font-bold sm:text-[3rem]">
                Look good on paper.
                <br />
                <span className="text-clay">Book it in practice.</span>
              </h2>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-cream/55">
                Create a free account, request a time and pay only when the
                studio confirms. It takes less than two minutes.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <ButtonLink href="/services" size="lg">
                  Explore the menu
                  <ArrowRight />
                </ButtonLink>
                <ButtonLink
                  href="/sign-up"
                  variant="outlineLight"
                  size="lg"
                >
                  Join SalonBook
                </ButtonLink>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-2xl border border-cream/12 bg-cream/[0.05] px-4 py-3.5">
                <span className="text-[0.78rem] text-cream/55">Studio</span>
                <span className="text-[0.8rem] font-semibold">
                  {SALON.address}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-cream/12 bg-cream/[0.05] px-4 py-3.5">
                <span className="text-[0.78rem] text-cream/55">Call us</span>
                <a
                  href={`tel:${SALON.phone.replace(/\s/g, "")}`}
                  className="text-[0.8rem] font-semibold hover:text-clay"
                >
                  {SALON.phone}
                </a>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-cream/12 bg-cream/[0.05] px-4 py-3.5">
                <span className="text-[0.78rem] text-cream/55">Today</span>
                <span className="text-[0.8rem] font-semibold">
                  10:00 AM – 8:00 PM
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
