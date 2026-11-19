export const SERVICE_CATEGORIES = [
  "Haircut & Styling",
  "Hair Coloring",
  "Hair Treatment",
  "Facial & Skincare",
  "Makeup",
  "Manicure & Pedicure",
  "Spa & Massage",
] as const

export type ServiceCategory = (typeof SERVICE_CATEGORIES)[number]

/** Predefined booking slots shown on the appointment form. */
export const TIME_SLOTS = [
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "12:00 PM",
  "12:30 PM",
  "02:00 PM",
  "02:30 PM",
  "03:00 PM",
  "03:30 PM",
  "04:00 PM",
  "04:30 PM",
  "05:00 PM",
  "05:30 PM",
] as const

export const CURRENCY = "USD"

export const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
] as const

export type SortOption = (typeof SORT_OPTIONS)[number]["value"]

export const SALON = {
  name: "SalonBook",
  tagline: "Modern grooming, booked properly.",
  address: "House 14, Road 7, Banani, Dhaka 1213",
  phone: "+880 1712 345 678",
  email: "hello@salonbook.com",
  hours: [
    { days: "Monday – Friday", time: "10:00 AM – 8:00 PM" },
    { days: "Saturday", time: "9:00 AM – 9:00 PM" },
    { days: "Sunday", time: "11:00 AM – 6:00 PM" },
  ],
  socials: [
    { label: "Instagram", href: "https://instagram.com" },
    { label: "Facebook", href: "https://facebook.com" },
    { label: "TikTok", href: "https://tiktok.com" },
    { label: "YouTube", href: "https://youtube.com" },
  ],
}

export const CATEGORY_IMAGES: Record<string, string> = {
  "Haircut & Styling":
    "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=900&auto=format&fit=crop",
  "Hair Coloring":
    "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?q=80&w=900&auto=format&fit=crop",
  "Hair Treatment":
    "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?q=80&w=900&auto=format&fit=crop",
  "Facial & Skincare":
    "https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=80&w=900&auto=format&fit=crop",
  Makeup:
    "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=900&auto=format&fit=crop",
  "Manicure & Pedicure":
    "https://images.unsplash.com/photo-1604654894610-df63bc536371?q=80&w=900&auto=format&fit=crop",
  "Spa & Massage":
    "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=900&auto=format&fit=crop",
}
