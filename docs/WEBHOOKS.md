# PayCore Webhook Guide

PayCore employs webhooks in two directions:
1. **Inbound Webhooks**: PayCore receives events from payment providers (Razorpay, Payhip, banks).
2. **Outbound Webhooks**: PayCore delivers cryptographically signed events to your external storefronts, bots, or apps.

---

## 1. Inbound Provider Webhooks

### Razorpay
- **Endpoint**: `https://your-domain.com/api/webhooks/razorpay`
- **Secret**: Configure `RAZORPAY_WEBHOOK_SECRET` in your environment.
- **Verification**: PayCore verifies the raw body HMAC-SHA256 against `X-Razorpay-Signature`.

### Payhip
- **Endpoint**: `https://your-domain.com/api/webhooks/payhip`
- **Secret**: Configure `PAYHIP_API_KEY` in your environment.

---

## 2. Outbound Webhook Delivery to Your App

When an order is paid, PayCore dispatches an HTTP POST to all endpoints registered in **Admin Dashboard → Webhooks**.

### Headers Delivered:
- `X-PayCore-Event`: e.g. `payment.paid`
- `X-PayCore-Signature`: HMAC-SHA256 hex digest of the raw payload
- `X-PayCore-Delivery`: Unique delivery ID

### Example Payload:
```json
{
  "id": "evt_172632900",
  "event": "payment.paid",
  "created": 1726329000,
  "data": {
    "orderId": "ord_101",
    "orderNumber": "ORD-82931",
    "amount": 49900,
    "currency": "INR",
    "status": "PAID",
    "provider": "razorpay"
  }
}
```

### Signature Verification Example (Node.js):
```javascript
import crypto from "crypto";

export function verifyPayCoreSignature(rawBody, signatureHeader, secret) {
  const expected = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signatureHeader));
}
```

### Retry Schedule:
If your server responds with an error code (5xx or 4xx) or times out (5 seconds), PayCore automatically retries according to the backoff schedule:
`1 min` → `5 min` → `15 min` → `1 hour` → `6 hours` → `24 hours`.
