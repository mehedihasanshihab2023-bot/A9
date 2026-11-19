import type { Metadata } from "next"
import { Bricolage_Grotesque, JetBrains_Mono, Manrope } from "next/font/google"
import { Toaster } from "sonner"

import "./globals.css"
import { AuthProvider } from "@/components/providers/auth-provider"
import { cn } from "@/lib/utils"

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
})

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
})

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
})

export const metadata: Metadata = {
  title: {
    default: "SalonBook — Modern grooming, booked properly",
    template: "%s · SalonBook",
  },
  description:
    "Browse salon services, request appointments and pay securely once the salon confirms. Hair, skin, nails and spa rituals in one place.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "antialiased",
        manrope.variable,
        bricolage.variable,
        jetbrains.variable
      )}
    >
      <body>
        <AuthProvider>{children}</AuthProvider>
        <Toaster
          position="top-center"
          richColors
          closeButton
          toastOptions={{
            style: {
              borderRadius: "14px",
              fontFamily: "var(--font-manrope)",
            },
          }}
        />
      </body>
    </html>
  )
}
