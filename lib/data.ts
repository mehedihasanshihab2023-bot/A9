import { api } from "@/lib/api"
import type {
  AdminStats,
  Appointment,
  AppUser,
  CustomerStats,
  Service,
  Transaction,
} from "@/lib/types"
import type { SortOption } from "@/lib/constants"

export type ServiceQuery = {
  search?: string
  category?: string
  sort?: SortOption
}

export async function getServices(query: ServiceQuery = {}): Promise<Service[]> {
  const params = new URLSearchParams()
  if (query.search?.trim()) params.set("search", query.search.trim())
  if (query.category) params.set("category", query.category)
  if (query.sort && query.sort !== "newest") params.set("sort", query.sort)

  const qs = params.toString()
  const { data } = await api<{ data: Service[] }>(
    `/services${qs ? `?${qs}` : ""}`
  )
  return data
}

export async function getFeaturedServices(): Promise<Service[]> {
  const { data } = await api<{ data: Service[] }>("/services/featured")
  return data
}

export async function getServiceById(id: string): Promise<Service> {
  const { data } = await api<{ data: Service }>(`/services/${id}`)
  return data
}

/* ------------------------------- Customer ------------------------------- */

export type BookingPayload = {
  serviceId: string
  appointmentDate: string
  timeSlot: string
  message?: string
}

export async function createAppointment(
  payload: BookingPayload
): Promise<Appointment> {
  const { data } = await api<{ data: Appointment }>("/appointments", {
    method: "POST",
    body: payload,
  })
  return data
}

export async function getMyAppointments(): Promise<Appointment[]> {
  const { data } = await api<{ data: Appointment[] }>("/appointments/me")
  return data
}

export async function getMyStats(): Promise<CustomerStats> {
  return api<CustomerStats>("/appointments/me/stats")
}

export async function cancelMyAppointment(id: string): Promise<void> {
  await api(`/appointments/${id}/cancel`, { method: "PATCH" })
}

export async function payAppointment(appointmentId: string): Promise<string> {
  const { url } = await api<{ url: string }>(
    "/payments/create-checkout-session",
    { method: "POST", body: { appointmentId } }
  )
  return url
}

export async function getMyTransactions(): Promise<Transaction[]> {
  const { data } = await api<{ data: Transaction[] }>("/transactions/me")
  return data
}

/* --------------------------------- Admin --------------------------------- */

export async function getAllAppointments(): Promise<Appointment[]> {
  const { data } = await api<{ data: Appointment[] }>("/appointments")
  return data
}

export async function updateAppointmentStatus(
  id: string,
  status: "confirmed" | "cancelled"
): Promise<void> {
  await api(`/appointments/${id}/status`, {
    method: "PATCH",
    body: { status },
  })
}

export async function getUsers(): Promise<AppUser[]> {
  const { data } = await api<{ data: AppUser[] }>("/users")
  return data
}

export async function setUserBlocked(
  id: string,
  isBlocked: boolean
): Promise<void> {
  await api(`/users/${id}/block`, {
    method: "PATCH",
    body: { isBlocked },
  })
}

export async function getTransactions(): Promise<Transaction[]> {
  const { data } = await api<{ data: Transaction[] }>("/transactions")
  return data
}

export async function getAdminStats(): Promise<AdminStats> {
  return api<AdminStats>("/stats/admin")
}

export type ServicePayload = {
  serviceName: string
  category: string
  description: string
  price: number
  duration: number
  image: string
  status: "active" | "inactive"
}

export async function createService(payload: ServicePayload): Promise<void> {
  await api("/services", { method: "POST", body: payload })
}

export async function updateService(
  id: string,
  payload: Partial<ServicePayload>
): Promise<void> {
  await api(`/services/${id}`, { method: "PATCH", body: payload })
}

export async function deleteService(id: string): Promise<void> {
  await api(`/services/${id}`, { method: "DELETE" })
}
