# PayCore Security & Compliance Architecture

## Fundamental Security Directives

### 1. Authoritative Settlement Only
PayCore rejects any client-side declaration of payment success.
- **Frontend can NEVER transition status to PAID**.
- Payment status transitions to `PAID` exclusively via:
  1. Authoritative server-side webhook signature verification.
  2. Direct authenticated provider API status checks.

### 2. Zero Sensitive Financial Data Storage
PayCore is strictly an orchestration and routing layer. It **never** asks for, processes, or stores:
- UPI PINs
- Debit / Credit Card Numbers
- CVVs
- Netbanking Passwords
- OTPs

All regulated authentication remains isolated within the customer's UPI application (GPay, PhonePe, BHIM) or the licensed PSP/Bank infrastructure.

### 3. Raw Body Webhook Verification
Signature verification utilizes the unmodified raw request body (`req.text()`) rather than parsed JSON to avoid JSON formatting or key-order alteration vulnerabilities.

### 4. Idempotency & Replay Prevention
Every mutating request accepts an `Idempotency-Key` to prevent double charges across retried network requests. Inbound webhooks track unique event IDs to prevent duplicate processing.

### 5. NPCI / UPI Merchant Ecosystem Compliance
Direct UPI Intent strings adhere strictly to NPCI guidelines. Static QR codes are treated as informational and require bank statement or PSP settlement reconciliation before order fulfillment.
