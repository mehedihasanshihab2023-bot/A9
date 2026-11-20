"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  ArrowUpDown,
  Eye,
  EyeOff,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react"
import { toast } from "sonner"

import { RequireRole } from "@/components/providers/require-role"
import { EmptyState } from "@/components/site/empty-state"
import { PageLoader } from "@/components/site/loader"
import { StatusBadge } from "@/components/site/status-badge"
import { ConfirmDialog, PageHeader } from "@/components/dashboard/dashboard-ui"
import { Button, ButtonLink } from "@/components/ui/button"
import { deleteService, getServices, updateService } from "@/lib/data"
import { durationLabel, formatMoney } from "@/lib/format"
import { SORT_OPTIONS, type SortOption } from "@/lib/constants"
import type { Service } from "@/lib/types"
import { cn } from "@/lib/utils"

function ManageServices() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">(
    "all"
  )
  const [sort, setSort] = useState<SortOption>("newest")
  const [busyId, setBusyId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Service | null>(null)
  const [deleting, setDeleting] = useState(false)

  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let active = true
    getServices({ includeInactive: true })
      .then((data) => {
        if (active) setServices(data)
      })
      .catch((err: unknown) => {
        if (!active) return
        const message =
          err instanceof Error ? err.message : "Could not load the service menu."
        setError(message)
        toast.error(message)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [reloadKey])

  function reload() {
    setLoading(true)
    setError(null)
    setReloadKey((value) => value + 1)
  }

  const visible = useMemo(() => {
    let data = [...services]
    const query = search.trim().toLowerCase()
    if (query) {
      data = data.filter(
        (service) =>
          service.serviceName.toLowerCase().includes(query) ||
          service.category.toLowerCase().includes(query)
      )
    }
    if (statusFilter !== "all") {
      data = data.filter((service) => service.status === statusFilter)
    }
    if (sort === "price-asc") data.sort((a, b) => a.price - b.price)
    if (sort === "price-desc") data.sort((a, b) => b.price - a.price)
    return data
  }, [search, services, sort, statusFilter])

  async function toggleStatus(service: Service) {
    const next = service.status === "active" ? "inactive" : "active"
    setBusyId(service._id)
    try {
      await updateService(service._id, { status: next })
      setServices((current) =>
        current.map((item) =>
          item._id === service._id ? { ...item, status: next } : item
        )
      )
      toast.success(
        `${service.serviceName} is now ${next === "active" ? "live" : "hidden"}.`
      )
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not update the service."
      )
    } finally {
      setBusyId(null)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteService(deleteTarget._id)
      setServices((current) =>
        current.filter((item) => item._id !== deleteTarget._id)
      )
      toast.success("Service deleted from the menu.")
      setDeleteTarget(null)
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not delete the service."
      )
    } finally {
      setDeleting(false)
    }
  }

  if (loading) return <PageLoader label="Loading the service menu…" />

  return (
    <div>
      <PageHeader
        eyebrow="Menu management"
        title="Manage services"
        description="Only active services appear on the public menu and can be booked. Deactivating hides a service without deleting its history."
        actions={
          <>
            <Button variant="outline" size="sm" onClick={reload}>
              <RefreshCw />
              Refresh
            </Button>
            <ButtonLink href="/dashboard/admin/services/new" size="sm">
              <Plus />
              Add service
            </ButtonLink>
          </>
        }
      />

      {error && (
        <div className="mb-5 rounded-xl border border-danger/20 bg-danger/5 px-4 py-3 text-[0.78rem] text-danger">
          {error}
        </div>
      )}

      <div className="mb-4 grid gap-2.5 rounded-2xl border border-line bg-paper p-3 sm:grid-cols-[1.4fr_1fr_auto]">
        <label className="relative block">
          <span className="sr-only">Search services</span>
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-ink/35" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name or category…"
            className="field pl-10"
          />
        </label>
        <label className="relative block">
          <span className="sr-only">Sort services</span>
          <ArrowUpDown className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-ink/35" />
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value as SortOption)}
            className="field appearance-none pl-10"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <div className="flex gap-1 rounded-xl bg-cream p-1">
          {(["all", "active", "inactive"] as const).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setStatusFilter(key)}
              className={cn(
                "flex-1 rounded-lg px-3 py-1.5 font-mono text-[0.58rem] tracking-[0.1em] uppercase transition-colors",
                statusFilter === key
                  ? "bg-paper text-ink shadow-sm"
                  : "text-ink/40"
              )}
            >
              {key}
            </button>
          ))}
        </div>
      </div>

      {visible.length === 0 ? (
        <EmptyState
          icon={Plus}
          title={services.length === 0 ? "The menu is empty" : "No services match"}
          description={
            services.length === 0
              ? "Add the first service to start taking appointment requests."
              : "Adjust the search or status filter to find a service."
          }
          action={
            <ButtonLink href="/dashboard/admin/services/new" size="sm">
              <Plus />
              Add service
            </ButtonLink>
          }
        />
      ) : (
        <>
          {/* Desktop table */}
          <div className="table-wrap hidden md:block">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Service</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Duration</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((service) => (
                  <tr key={service._id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <span className="relative size-11 shrink-0 overflow-hidden rounded-lg bg-sand">
                          <Image
                            src={service.image}
                            alt={service.serviceName}
                            fill
                            sizes="44px"
                            className="object-cover"
                          />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-[0.82rem] font-semibold">
                            {service.serviceName}
                          </p>
                          <p className="max-w-[16rem] truncate text-[0.66rem] text-ink/40">
                            {service.description}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="text-[0.75rem] text-ink/55">
                      {service.category}
                    </td>
                    <td className="font-semibold">{formatMoney(service.price)}</td>
                    <td className="text-[0.75rem] text-ink/55">
                      {durationLabel(service.duration)}
                    </td>
                    <td>
                      <StatusBadge status={service.status} />
                    </td>
                    <td>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          disabled={busyId === service._id}
                          onClick={() => void toggleStatus(service)}
                          className="grid size-8 place-items-center rounded-lg text-ink/45 transition-colors hover:bg-cream hover:text-ink disabled:opacity-40"
                          title={
                            service.status === "active"
                              ? "Deactivate service"
                              : "Activate service"
                          }
                        >
                          {service.status === "active" ? (
                            <EyeOff className="size-4" />
                          ) : (
                            <Eye className="size-4" />
                          )}
                        </button>
                        <Link
                          href={`/dashboard/admin/services/${service._id}/edit`}
                          className="grid size-8 place-items-center rounded-lg text-ink/45 transition-colors hover:bg-cream hover:text-ink"
                          title="Edit service"
                        >
                          <Pencil className="size-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(service)}
                          className="grid size-8 place-items-center rounded-lg text-ink/45 transition-colors hover:bg-danger/8 hover:text-danger"
                          title="Delete service"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="grid gap-3 md:hidden">
            {visible.map((service) => (
              <article key={service._id} className="card p-3">
                <div className="flex gap-3">
                  <span className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-sand">
                    <Image
                      src={service.image}
                      alt={service.serviceName}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-[0.82rem] font-semibold">
                        {service.serviceName}
                      </p>
                      <StatusBadge status={service.status} />
                    </div>
                    <p className="mt-0.5 text-[0.65rem] text-ink/40">
                      {service.category}
                    </p>
                    <p className="mt-1 text-[0.75rem] font-semibold">
                      {formatMoney(service.price)}{" "}
                      <span className="font-normal text-ink/40">
                        · {durationLabel(service.duration)}
                      </span>
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between gap-2 border-t border-line/70 pt-2.5">
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={busyId === service._id}
                    onClick={() => void toggleStatus(service)}
                  >
                    {service.status === "active" ? <EyeOff /> : <Eye />}
                    {service.status === "active" ? "Deactivate" : "Activate"}
                  </Button>
                  <div className="flex gap-1">
                    <ButtonLink
                      href={`/dashboard/admin/services/${service._id}/edit`}
                      size="sm"
                      variant="outline"
                    >
                      <Pencil />
                      Edit
                    </ButtonLink>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-danger"
                      onClick={() => setDeleteTarget(service)}
                    >
                      <Trash2 />
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </>
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete this service?"
        description={`${
          deleteTarget?.serviceName ?? "This service"
        } will be removed from the salon menu. Existing appointments keep their history, but the service can no longer be booked. This cannot be undone.`}
        confirmLabel="Delete service"
        tone="danger"
        loading={deleting}
        onConfirm={() => void handleDelete()}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  )
}

export default function AdminServicesPage() {
  return (
    <RequireRole role="admin">
      <ManageServices />
    </RequireRole>
  )
}
