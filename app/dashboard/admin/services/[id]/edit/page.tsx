"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { useRouter } from "next/navigation"
import { AlertCircle, RefreshCw } from "lucide-react"
import { toast } from "sonner"

import { RequireRole } from "@/components/providers/require-role"
import { PageLoader } from "@/components/site/loader"
import { PageHeader } from "@/components/dashboard/dashboard-ui"
import { ServiceForm } from "@/components/dashboard/service-form"
import { Button, ButtonLink } from "@/components/ui/button"
import { getServiceById } from "@/lib/data"
import type { Service } from "@/lib/types"

function EditService() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [service, setService] = useState<Service | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    getServiceById(id)
      .then((data) => {
        if (active) setService(data)
      })
      .catch((err: unknown) => {
        if (!active) return
        const message =
          err instanceof Error ? err.message : "Could not load this service."
        setError(message)
        toast.error(message)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [id])

  if (loading) return <PageLoader label="Loading the service…" />

  if (error || !service) {
    return (
      <div className="card mx-auto max-w-md p-8 text-center">
        <span className="mx-auto grid size-12 place-items-center rounded-full bg-danger/10 text-danger">
          <AlertCircle className="size-5" />
        </span>
        <h1 className="mt-4 font-display text-xl font-bold">
          Service not available
        </h1>
        <p className="mt-2 text-[0.8rem] text-ink/50">
          {error ?? "This service may have been deleted."}
        </p>
        <div className="mt-5 flex justify-center gap-2">
          <Button variant="outline" onClick={() => router.refresh()}>
            <RefreshCw />
            Retry
          </Button>
          <ButtonLink href="/dashboard/admin/services">
            Back to services
          </ButtonLink>
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        eyebrow="Menu management"
        title="Update service"
        description={`Editing “${service.serviceName}”. Changes go live on the public menu immediately.`}
      />
      <ServiceForm service={service} />
    </div>
  )
}

export default function EditServicePage() {
  return (
    <RequireRole role="admin">
      <EditService />
    </RequireRole>
  )
}
