"use client"

import { Plus } from "lucide-react"

import { RequireRole } from "@/components/providers/require-role"
import { PageHeader } from "@/components/dashboard/dashboard-ui"
import { ServiceForm } from "@/components/dashboard/service-form"

export default function NewServicePage() {
  return (
    <RequireRole role="admin">
      <div>
        <PageHeader
          eyebrow="Menu management"
          title="Add a new service"
          description="Create a treatment for the public menu. New services are active by default and can be booked immediately."
        />
        <div className="mb-5 flex items-center gap-2 rounded-xl border border-line bg-paper px-4 py-3 text-[0.72rem] text-ink/45">
          <Plus className="size-4 text-clay" />
          Fill in every field and upload an image. Only active services are
          visible to customers.
        </div>
        <ServiceForm />
      </div>
    </RequireRole>
  )
}
