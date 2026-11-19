export type Role = "admin" | "customer"

export type ServiceStatus = "active" | "inactive"
export type AppointmentStatus = "pending" | "confirmed" | "cancelled"
export type PaymentStatus = "unpaid" | "paid"
export type TransactionStatus = "paid" | "failed"

export type Service = {
  _id: string
  serviceName: string
  category: string
  description: string
  price: number
  duration: number
  image: string
  status: ServiceStatus
  createdAt: string
  updatedAt?: string
}

export type Appointment = {
  _id: string
  serviceId: string
  customerId: string
  serviceName: string
  serviceImage: string
  serviceCategory: string
  customerName: string
  customerEmail: string
  appointmentDate: string
  timeSlot: string
  message: string
  servicePrice: number
  status: AppointmentStatus
  paymentStatus: PaymentStatus
  stripeSessionId?: string | null
  createdAt: string
}

export type Transaction = {
  _id: string
  appointmentId: string
  customerId: string
  customerName: string
  serviceName: string
  appointmentDate: string
  amount: number
  currency: string
  stripeSessionId: string
  status: TransactionStatus
  createdAt: string
}

export type AppUser = {
  _id: string
  name: string
  email: string
  image: string | null
  role: Role
  isBlocked: boolean
  phoneNumber: string | null
  createdAt: string | null
}

export type SessionUser = {
  id: string
  name: string
  email: string
  image?: string | null
  role?: Role
  isBlocked?: boolean
  phoneNumber?: string | null
}

export type CustomerStats = {
  total: number
  pending: number
  confirmed: number
  cancelled: number
}

export type AdminStats = {
  customers: number
  activeServices: number
  appointments: number
  pending: number
  confirmed: number
  payments: number
}
