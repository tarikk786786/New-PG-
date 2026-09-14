# PayCore — Personal Universal Payment Gateway & Orchestration Platform

> **Engineered for India's UPI Ecosystem, Razorpay, Payhip, and Global Payment Service Providers.**
> *A private, developer-first payment gateway layer deployed on Vercel and Supabase.*

---

## 🌟 The Core Vision

**PayCore** is your personal payment orchestration platform that acts like a lightweight Stripe/Razorpay layer for all your websites, apps, digital products, and offline operations.

Instead of hardcoding payment logic or bank credentials across every single side-project, you integrate with **PayCore's unified v1 REST API & SDK**.

```
┌────────────────────────────────────────────────────────┐
│               YOUR WEBSITES / APPS / STORES            │
└───────────────────────────┬────────────────────────────┘
                            │ REST API (v1) / Webhooks
                            ▼
┌────────────────────────────────────────────────────────┐
│                        PAYCORE                         │
│  - Orders & Payments       - Dynamic & Static UPI QR   │
│  - Branded Hosted Checkout - Webhook Ingest & Delivery │
│  - Authoritative Engine    - Outbound Retries & Alerts │
└───────────────────────────┬────────────────────────────┘
                            │ Provider Abstraction
         ┌──────────────────┼──────────────────┐
         ▼                  ▼                  ▼
┌──────────────────┐┌──────────────────┐┌──────────────────┐
│  UPI / PSP (NPCI)││  Razorpay (UPI)  ││ Payhip / Sandbox │
└────────┬─────────┘└────────┬─────────┘└────────┬─────────┘
         │                   │                   │
         └───────────────────┼───────────────────┘
                             ▼
                 YOUR BANK ACCOUNT / SETTLEMENT
```

---

## ⚡ The Authoritative Settlement Principle

A critical architectural mandate of PayCore:

> **Never trust frontend claims or simple QR scans alone.**
> An order or payment **CANNOT** be marked as `PAID` merely because a customer scanned a QR code or the browser reported a redirect. 
> Transitions to `PAID` occur **solely** via:
> 1. Server-side raw HMAC-SHA256 signature-verified provider webhooks.
> 2. Direct authenticated provider API verification.

---

## 🚀 Quick Start

### 1. Prerequisites
- Node.js 18+ or 20+ (Node 24 tested)
- `pnpm` (or `npm`)

### 2. Installation
```bash
# Clone or enter directory
cd "payment gateway"

# Install dependencies
pnpm install
```

### 3. Start Development Server
```bash
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser:
- **Landing Page**: [http://localhost:3000](http://localhost:3000)
- **Admin Dashboard**: [http://localhost:3000/dashboard](http://localhost:3000/dashboard)
- **Demo Hosted Checkout**: [http://localhost:3000/pay/devcourse](http://localhost:3000/pay/devcourse)
- **Sandbox Simulator**: [http://localhost:3000/dashboard/simulator](http://localhost:3000/dashboard/simulator)

---

## 🧪 Automated Testing

Run the included test suite to verify the state machine, provider adapters, HMAC signatures, and UPI URI builders:
```bash
node --test tests/gateway.test.mjs
```

---

## 📂 Project Architecture

```
paycore/
├── app/
│   ├── api/
│   │   ├── v1/
│   │   │   ├── orders/               # POST (create), GET (list, fetch)
│   │   │   ├── payments/             # POST (create), GET (fetch), POST (/verify)
│   │   │   ├── payment-links/        # POST (create), GET (list)
│   │   │   ├── qr/                   # POST (/dynamic), POST (/static)
│   │   │   ├── customers/            # POST (create), GET (list)
│   │   │   ├── refunds/              # POST (process refund)
│   │   │   └── checkout/session/     # GET (real-time polling for checkout)
│   │   ├── webhooks/
│   │   │   └── [provider]/           # Inbound raw body webhook verifier
│   │   └── test/
│   │       └── payments/             # Interactive sandbox simulator API
│   ├── dashboard/                    # Full administrative portal
│   │   ├── page.tsx                  # Financial overview & KPIs
│   │   ├── transactions/             # Lifecycle timeline & refund actions
│   │   ├── links/                    # Payment Link manager
│   │   ├── qr/                       # Mode 1 & Mode 2 UPI QR Studio
│   │   ├── customers/                # Payer database
│   │   ├── webhooks/                 # Inbound events & outbound delivery retry
│   │   ├── simulator/                # Sandbox event simulation studio
│   │   ├── api-keys/                 # Scoped API key generator
│   │   └── settings/                 # Provider routing & UPI configuration
│   └── pay/[code]/                   # Branded, mobile-first hosted checkout
├── lib/
│   ├── db/
│   │   ├── schema.ts                 # Drizzle ORM PostgreSQL schemas
│   │   ├── store.ts                  # In-memory/persisted fallback store
│   │   └── index.ts                  # Repository abstraction
│   ├── providers/
│   │   ├── types.ts                  # Unified PaymentProvider interface
│   │   ├── razorpay.ts               # Razorpay UPI / Links / HMAC verification
│   │   ├── upi.ts                    # NPCI UPI intent & dynamic QR builder
│   │   ├── payhip.ts                 # Payhip webhook adapter
│   │   ├── mock.ts                   # Sandbox simulator provider
│   │   └── index.ts                  # Provider factory & router
│   ├── services/
│   │   ├── state-machine.ts          # Immutable payment status transitions
│   │   ├── verification.ts           # Multi-factor verification engine
│   │   ├── idempotency.ts            # Idempotency-Key support
│   │   ├── webhook-dispatcher.ts     # Outbound webhook delivery & exponential retry
│   │   ├── notifications.ts          # Telegram Bot instant alerts
│   │   └── api-keys.ts               # API key authentication & scopes
│   └── utils.ts                      # Integer paise formatting & generators
├── docs/
│   ├── API.md                        # Full REST API documentation
│   ├── WEBHOOKS.md                   # Inbound & Outbound webhook guide
│   └── SECURITY.md                   # Security & compliance standards
└── tests/
    └── gateway.test.mjs              # Automated unit and integration tests
```

---

## 🔑 Environment Variables Configuration

Copy `.env.example` to `.env` and configure credentials:

```env
# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Database Configuration (Supabase / Neon / Postgres)
DATABASE_URL=

# Default Active Payment Provider (mock | razorpay | upi | payhip)
PAYMENT_PROVIDER=mock

# Default UPI Merchant Configuration
UPI_VPA=paycore@upi
UPI_MERCHANT_NAME=PayCore Commerce

# Razorpay Credentials (Optional if using Mock / UPI)
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=

# Notifications (Optional)
TELEGRAM_BOT_TOKEN=
TELEGRAM_ADMIN_CHAT_ID=

# Master API Secret for PayCore
PAYCORE_SECRET_KEY=sk_live_paycore_master_default_key
```

---

## 🛡️ Payment State Machine

```
CREATED
  │
  ▼
PENDING ────────┬──────────────┬──────────────┐
  │             │              │              │
  ▼             ▼              ▼              ▼
PROCESSING   EXPIRED       CANCELLED        FAILED
  │
  ▼
AUTHORIZED
  │
  ▼
 PAID ──────────┬─────────────────────────────┐
  │             │                             │
  ▼             ▼                             ▼
REFUND_PENDING  PARTIALLY_REFUNDED        DISPUTED
  │             │
  ▼             ▼
REFUNDED ◄──────┘
```

---

## 🚢 Deployment to Vercel & Supabase

1. **Database (Supabase)**:
   - Create a free Supabase project at [supabase.com](https://supabase.com).
   - Copy the PostgreSQL connection string and set `DATABASE_URL` in your Vercel Environment Variables.
2. **Deploy to Vercel**:
   - Push this repository to GitHub.
   - Import into Vercel and set your environment variables.
   - PayCore runs within standard Vercel serverless compute limits.

---

## 📜 License
MIT License. Built for independent creators, builders, and developers.
