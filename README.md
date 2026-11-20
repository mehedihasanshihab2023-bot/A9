# SalonBook — Client

**SalonBook** is a role-based salon appointment booking platform. Customers
browse the grooming menu, request a time and pay for confirmed visits through
Stripe. Salon administrators run the studio from a private dashboard: services,
appointment requests, customers and verified payments.

This repository contains the **Next.js frontend**. The Express.js + MongoDB +
Better Auth REST API lives in a separate server repository.

---

## Design

The interface uses an original editorial identity built for this project — not
a template or a clone of any reference screenshot:

- **Palette:** ink/forest `#101915`, warm cream `#f5f0e6`, clay `#c5663e`, sage
- **Type:** Bricolage Grotesque (display), Manrope (body), JetBrains Mono (labels)
- **Layout:** asymmetric hero with male grooming photography, ticker marquee,
  numbered service-category index, team section, dark editorial footer
- Fully responsive from 360 px to wide desktop, including a tablet drawer

---

## ✨ Features

### Public

- Landing page with a live featured-services rail, category index, studio team
  and visit information
- **Browse services** with live search, category filters and price sorting
- Service detail pages with a gallery, duration/price facts and booking form
  (authentication required — unauthenticated visitors are redirected back after
  signing in)
- Email/password and Google sign-in through Better Auth
- Dedicated 404 and error pages

### Customer

- Dashboard with request counts, next visit and recent activity
- **Request an appointment** (date, time slot, optional note) with duplicate-slot
  protection handled by the API
- **My appointments:** cancel a pending request, pay a confirmed one via Stripe
  Checkout, review status and payment state
- **Payment history** — receipts appear only after a signature-verified Stripe
  webhook on the server
- **Profile:** update name, phone and avatar (ImgBB upload or image URL)

### Admin

- Overview statistics: customers, active services, appointment states, verified revenue
- **Services:** create, edit, activate/deactivate and delete, with ImgBB image
  upload through the API
- **Appointments:** confirm pending requests, cancel bookings, search/filter
- **Customers:** search, block/unblock (blocking revokes the customer's sessions)
- **Transactions:** read-only ledger of Stripe checkouts; no client-side mutation

### Quality

- Session-aware navbar and dashboard shell; navigation updates immediately after
  sign-in/sign-out
- Route guards on every private page — roles are re-verified **server-side** on
  every API call, never trusted from the client
- Blocked-customer screen with a single action to sign out
- Toast notifications (sonner) instead of `alert()`
- Skeleton loaders, empty states and inline error recovery on every data view
- Safe behaviour when optional integrations (Stripe/ImgBB/Google) are not
  configured — errors surface as toasts, never as crashes

---

## 🛠 Technology Stack

- [Next.js 16](https://nextjs.org/) App Router, React 19, TypeScript
- [Tailwind CSS v4](https://tailwindcss.com/) with custom design tokens
- [Better Auth](https://www.better-auth.com/) client (credentials + Google)
- [Stripe](https://stripe.com/) Checkout (payment state is webhook-driven on the server)
- [ImgBB](https://imgbb.com/) image hosting (uploads proxied through the API)
- [sonner](https://sonner.emilkowal.ski/) toasts, [lucide-react](https://lucide.dev/) icons
- REST API: Express.js + MongoDB (separate repository)

---

## ⚙️ Getting Started

### Prerequisites

- Node.js 20+
- The SalonBook **server** running locally (or a deployed API URL)

### Installation

```bash
git clone <client-repo-url>
cd salonbook-client
npm install
```

### Environment Variables

Create `.env.local` (never commit it):

```env
NEXT_PUBLIC_SERVER_URL=http://localhost:5000   # Express API / Better Auth base URL
NEXT_PUBLIC_APP_URL=http://localhost:3000      # Public URL of this frontend
```

All secrets — MongoDB URI, Better Auth secret, JWT secret, Google OAuth,
Stripe keys and the ImgBB key — belong to the **server** environment only.

### Run locally

```bash
npm run dev      # http://localhost:3000
```

### Scripts

```bash
npm run dev        # development server
npm run build      # production build
npm run start      # serve the production build
npm run lint       # eslint
npm run typecheck  # tsc --noEmit
npm run format     # prettier
```

---

## 🧭 Routes

| Route | Access | Purpose |
| ----- | ------ | ------- |
| `/` | public | Editorial home page |
| `/services` | public | Search, filter and sort the menu |
| `/services/[id]` | signed in | Service detail + appointment request |
| `/sign-in`, `/sign-up` | public | Better Auth credentials / Google |
| `/dashboard` | customer/admin | Role-aware overview |
| `/dashboard/appointments` | customer | Requests, cancellation, Stripe payment |
| `/dashboard/profile` | customer/admin | Profile and avatar |
| `/dashboard/admin` | admin | Studio statistics |
| `/dashboard/admin/services` | admin | Service CRUD + activation |
| `/dashboard/admin/services/new` | admin | Create a service |
| `/dashboard/admin/services/[id]/edit` | admin | Edit a service |
| `/dashboard/admin/appointments` | admin | Confirm / cancel requests |
| `/dashboard/admin/users` | admin | Block / unblock customers |
| `/dashboard/admin/transactions` | admin | Read-only payment ledger |
| `/payment/success`, `/payment/cancel` | public | Stripe Checkout return pages |

---

## 👤 Demo Accounts

When the server runs with its development seed, these accounts are available:

| Role | Email | Password |
| ---- | ----- | -------- |
| Admin | `admin@salonbook.com` | `Admin123` |
| Customer | `customer@salonbook.com` | `Customer123` |

The sign-in page only advertises the demo customer, because production admins
must be provisioned securely on the server (`npm run create-admin`).

---

## 🚀 Deployment Notes

1. Deploy the server first, then set `NEXT_PUBLIC_SERVER_URL` here to its public
   HTTPS URL.
2. Set the server's `CLIENT_URL` to this app's public URL so CORS and Better Auth
   callbacks match exactly.
3. Stripe redirects return to `/payment/success` and `/payment/cancel` on this
   app; the webhook lives on the server at `/api/v1/payments/webhook`.
4. Authentication cookies are `httpOnly`; cross-site production deployments rely
   on `SameSite=None; Secure`, which requires HTTPS on both origins.
5. All dashboard routes are statically buildable and reload-safe — the guard runs
   again on every fresh load and API request.

---

## 🔗 Live Site & Repositories

- **Live website:** _add your Vercel deployment URL here_
- **Client repository:** https://github.com/mehedihasanshihab2023-bot/A9
- **Server repository:** https://github.com/mehedihasanshihab2023-bot/salonbook-server

---

## 🔗 Related

- **Server repository:** Express + MongoDB API (see its README for endpoints,
  environment variables and the Stripe webhook setup)
