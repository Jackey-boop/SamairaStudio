# Samaira Studio ✦

A complete website **and** order-management system for *Samaira Studio*, a
content creation / influencer studio that also sells products. Doodly,
handwritten aesthetic with a full India-first shopping journey: cart, Razorpay
checkout, order tracking, transactional emails and a password-protected admin
panel.

## Tech stack

| Area      | Choice                                            |
| --------- | ------------------------------------------------- |
| Framework | Next.js 14 (App Router) + TypeScript              |
| Styling   | Tailwind CSS, Caveat + Inter (Google Fonts)       |
| Database  | Prisma ORM. SQLite for local dev, Postgres in prod |
| Payments  | Razorpay (UPI, cards, netbanking, wallets)        |
| Email     | Resend (transactional)                            |
| CMS       | `content.json` for brands + reels                 |
| Cart      | Zustand (persisted to localStorage)               |
| State     | Admin protected by `ADMIN_PASSWORD` env variable  |

## Features

**Website**
- Sticky navbar with live cart badge
- About / hero, top reels, brands, work-with-us contact form, products
- Reusable doodle components: `<Squiggle />`, `<DoodleStar />`, hand-drawn envelope & signature
- Cards tilt `-0.5deg` and straighten on hover, squiggly underlines, coral accents

**Shopping journey**
- Add to cart, cart page with quantity controls, checkout form
- Razorpay order creation, signature-verified payment, confirmation email
- Order success page + public order tracking with a status stepper
- `/track` lookup by Order ID + email (no login needed)

**Admin panel (`/admin`)**
- Orders: filter / search, detail view, change status, add courier + tracking + ETA, "Save & notify customer"
- Products: add / edit / delete, stock, active toggle
- Brands & Reels: edit `content.json`
- Contact submissions list

## Getting started

```bash
# 1. install
npm install

# 2. configure env (copy and edit)
cp .env.example .env

# 3. create the database + tables (SQLite by default)
npm run db:push

# 4. seed sample products
npm run db:seed

# 5. run
npm run dev
```

Open http://localhost:3000 and the admin at http://localhost:3000/admin
(default dev password in `.env` is `samaira-admin`).

### Useful scripts

| Script            | What it does                          |
| ----------------- | ------------------------------------- |
| `npm run dev`     | Start the dev server                  |
| `npm run build`   | `prisma generate` + production build  |
| `npm run start`   | Run the production build              |
| `npm run db:push` | Sync the schema to the database       |
| `npm run db:seed` | Seed sample products                  |
| `npm run db:studio` | Open Prisma Studio                  |

## Mock payment mode (local dev)

If `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` are **not** set and
`NODE_ENV !== production`, checkout runs in a **mock** mode: a fake Razorpay
order is created and the verify step accepts a `mock_signature`, so you can
walk the entire purchase flow without real keys. Add real keys to use the
genuine Razorpay Checkout modal. Mock mode is never enabled in production.

Likewise, if `RESEND_API_KEY` is missing, emails are logged to the console and
skipped instead of failing.

## Environment variables

See `.env.example`. Summary:

```
DATABASE_URL              SQLite file (dev) or Postgres URL (prod)
ADMIN_PASSWORD            password for /admin
RAZORPAY_KEY_ID           Razorpay key id (server)
RAZORPAY_KEY_SECRET       Razorpay key secret (server)
RAZORPAY_WEBHOOK_SECRET   secret used to verify webhook signatures
RESEND_API_KEY            Resend API key
EMAIL_FROM                from-address for emails
CONTACT_NOTIFY_EMAIL      inbox that receives contact-form enquiries
NEXT_PUBLIC_RAZORPAY_KEY_ID  Razorpay key id (browser)
NEXT_PUBLIC_BASE_URL      site origin, used in emails + metadata
```

## Switching to PostgreSQL for production

The schema ships with SQLite so it runs with zero setup. SQLite has no native
`enum` or `Json` types, so `Order.status` is a `String` (allowed values in
`src/lib/orderStatus.ts`) and `Order.address` is JSON stored as a `String`
(helpers in `src/lib/orders.ts`).

To move to Postgres:

1. In `prisma/schema.prisma` set `provider = "postgresql"`.
2. Point `DATABASE_URL` at your Postgres instance.
3. Optionally promote `status` to a native `enum OrderStatus` and `address` to
   a native `Json` column (commented example is in the schema header).
4. Run `npx prisma migrate deploy`.

## Razorpay webhook

Point a Razorpay webhook at `POST /api/webhooks/razorpay` and set
`RAZORPAY_WEBHOOK_SECRET`. It verifies the HMAC SHA256 signature and handles
`payment.captured` / `order.paid` (confirms the order) and `payment.failed`
(cancels a still-pending order). Confirmation is idempotent, so the webhook and
the client-side verify step can't double-process an order.

## Project structure

```
prisma/            schema + seed
content.json       brands + reels CMS
src/
  app/
    (site)/        customer-facing pages (navbar + footer)
    admin/         password-gated admin panel
    api/           route handlers (checkout, orders, contact, webhook, admin)
  components/       UI + doodle components, sections, admin tabs
  lib/             prisma, razorpay, email, auth, cart store, helpers
```

## Notes

- Prices are stored in **paise** (₹1 = 100 paise) to match Razorpay and avoid
  rounding issues.
- Product/brand/reel images are admin-provided URLs, rendered with plain
  `<img>` (any host allowed in `next.config.js`).
- `content.json` writes persist on a long-running server. On read-only
  serverless filesystems, back brands/reels with a database instead.
