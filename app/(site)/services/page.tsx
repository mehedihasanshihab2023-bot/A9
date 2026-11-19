"use client"

import { Suspense, useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { ArrowUpDown, RefreshCw, Search, SlidersHorizontal, X } from "lucide-react"

import { EmptyState } from "@/components/site/empty-state"
import { ServiceCard } from "@/components/site/service-card"
import { Button } from "@/components/ui/button"
import { getServices } from "@/lib/data"
import { SERVICE_CATEGORIES, SORT_OPTIONS, type SortOption } from "@/lib/constants"
import type { Service } from "@/lib/types"
import { cn } from "@/lib/utils"

function SkeletonGrid() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="card animate-pulse overflow-hidden p-2.5"
          aria-hidden
        >
          <div className="aspect-[4/3] rounded-[0.95rem] bg-sand/70" />
          <div className="space-y-2.5 px-2.5 pt-4 pb-2">
            <div className="h-4 w-3/4 rounded bg-sand/70" />
            <div className="h-3 w-full rounded bg-sand/50" />
            <div className="h-3 w-2/3 rounded bg-sand/50" />
            <div className="mt-4 flex justify-between border-t border-line/60 pt-3">
              <div className="h-5 w-16 rounded bg-sand/70" />
              <div className="h-8 w-24 rounded-full bg-sand/60" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function BrowseServices() {
  const params = useSearchParams()
  const initialCategory = params.get("category") ?? ""
  const initialSearch = params.get("q") ?? ""
  const initialSort = (params.get("sort") as SortOption) ?? "newest"

  const [search, setSearch] = useState(initialSearch)
  const [category, setCategory] = useState(initialCategory)
  const [sort, setSort] = useState<SortOption>(
    SORT_OPTIONS.some((option) => option.value === initialSort)
      ? initialSort
      : "newest"
  )
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let active = true
    const timer = setTimeout(() => {
      setLoading(true)
      setError(null)
      getServices({ search, category, sort })
        .then((data) => {
          if (active) setServices(data)
        })
        .catch((err: unknown) => {
          if (active) {
            setError(
              err instanceof Error
                ? err.message
                : "We could not load services. Please try again."
            )
            setServices([])
          }
        })
        .finally(() => {
          if (active) setLoading(false)
        })
    }, 280)

    return () => {
      active = false
      clearTimeout(timer)
    }
  }, [search, category, sort, reloadKey])

  useEffect(() => {
    const next = new URLSearchParams()
    if (search.trim()) next.set("q", search.trim())
    if (category) next.set("category", category)
    if (sort !== "newest") next.set("sort", sort)
    const query = next.toString()
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}${query ? `?${query}` : ""}`
    )
  }, [search, category, sort])

  const hasFilters = Boolean(search.trim() || category || sort !== "newest")
  const activeCount = useMemo(
    () => (loading ? null : services.length),
    [loading, services.length]
  )

  function clearFilters() {
    setSearch("")
    setCategory("")
    setSort("newest")
  }

  return (
    <>
      {/* Page header */}
      <section className="relative overflow-hidden border-b border-line bg-paper">
        <div className="pointer-events-none absolute -top-20 right-0 size-[22rem] rounded-full bg-sage/15 blur-3xl" />
        <div className="shell relative py-12 sm:py-16">
          <p className="eyebrow flex items-center gap-2.5 text-clay">
            <span className="h-px w-7 bg-current" />
            The full menu
          </p>
          <div className="mt-4 flex flex-wrap items-end justify-between gap-6">
            <div>
              <h1 className="max-w-2xl font-display text-[2.4rem] leading-[0.98] font-bold sm:text-[3.4rem]">
                Every treatment.
                <br />
                <span className="text-ink/35">One calm menu.</span>
              </h1>
              <p className="mt-4 max-w-xl text-[0.92rem] leading-relaxed text-ink/55">
                Browse live services from the salon, compare price and duration,
                then open any treatment to request your slot.
              </p>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-line bg-cream/70 px-4 py-3">
              <span className="grid size-9 place-items-center rounded-full bg-ink text-cream">
                <SlidersHorizontal className="size-4" />
              </span>
              <div>
                <p className="font-display text-lg leading-none font-bold">
                  {activeCount ?? "—"}
                </p>
                <p className="mt-1 font-mono text-[0.55rem] tracking-[0.13em] text-ink/45 uppercase">
                  Live treatments
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="shell pt-8">
        <div className="rounded-2xl border border-line bg-paper p-3 sm:p-4">
          <div className="grid gap-3 lg:grid-cols-[1.4fr_1fr_auto]">
            <label className="relative block">
              <span className="sr-only">Search services by name</span>
              <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-ink/35" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by service name…"
                className="field pl-10"
              />
            </label>

            <label className="relative block">
              <span className="sr-only">Sort services</span>
              <ArrowUpDown className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-ink/35" />
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value as SortOption)}
                className="field appearance-none pr-8 pl-10"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <div className="flex gap-2">
              {hasFilters && (
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 lg:flex-none"
                  onClick={clearFilters}
                >
                  <X />
                  Clear filters
                </Button>
              )}
            </div>
          </div>

          <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto border-t border-line/70 pt-3">
            <button
              type="button"
              onClick={() => setCategory("")}
              className={cn(
                "shrink-0 rounded-full px-3.5 py-1.5 text-[0.73rem] font-semibold transition-colors",
                category === ""
                  ? "bg-ink text-cream"
                  : "bg-cream text-ink/60 hover:text-ink"
              )}
            >
              All categories
            </button>
            {SERVICE_CATEGORIES.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setCategory(item)}
                className={cn(
                  "shrink-0 rounded-full px-3.5 py-1.5 text-[0.73rem] font-semibold transition-colors",
                  category === item
                    ? "bg-ink text-cream"
                    : "bg-cream text-ink/60 hover:text-ink"
                )}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="shell py-8 pb-20">
        <div className="mb-5 flex items-center justify-between gap-4">
          <p className="text-[0.78rem] text-ink/50">
            {loading ? (
              "Loading the menu…"
            ) : (
              <>
                Showing <strong className="text-ink">{services.length}</strong>{" "}
                {services.length === 1 ? "service" : "services"}
                {category && (
                  <span className="text-ink/40"> in {category}</span>
                )}
                {search.trim() && (
                  <span className="text-ink/40"> matching “{search.trim()}”</span>
                )}
              </>
            )}
          </p>
          {error && !loading && (
            <button
              type="button"
              onClick={() => setReloadKey((value) => value + 1)}
              className="inline-flex items-center gap-1.5 text-[0.75rem] font-semibold text-clay hover:text-clay-deep"
            >
              <RefreshCw className="size-3.5" />
              Retry
            </button>
          )}
        </div>

        {loading ? (
          <SkeletonGrid />
        ) : error ? (
          <EmptyState
            title="The menu did not load"
            description={error}
            action={
              <Button onClick={() => setReloadKey((value) => value + 1)}>
                <RefreshCw />
                Try again
              </Button>
            }
          />
        ) : services.length === 0 ? (
          <EmptyState
            title="No services match those filters"
            description="Try a different search term, pick another category, or clear the filters to see the full menu."
            action={
              <Button variant="outline" onClick={clearFilters}>
                <X />
                Clear filters
              </Button>
            }
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <ServiceCard key={service._id} service={service} />
            ))}
          </div>
        )}
      </section>
    </>
  )
}

export default function ServicesPage() {
  return (
    <Suspense
      fallback={
        <div className="shell py-16">
          <SkeletonGrid />
        </div>
      }
    >
      <BrowseServices />
    </Suspense>
  )
}
