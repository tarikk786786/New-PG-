# PayCore REST API Specification (v1)

Base URL: `https://your-domain.com/api/v1` (or `http://localhost:3000/api/v1`)

## Universal Response Format

All responses adhere to the standard envelope:

```json
{
  "success": true,
  "data": { ... },
  "error": null,
  "request_id": "req_172632910"
}
```

Error response:
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "ORDER_NOT_FOUND",
    "message": "Order 'ord_123' not found"
  },
  "request_id": "req_172632911"
}
```

---

## Authentication & Headers

Provide your PayCore Secret Key in the Authorization header:
```
Authorization: Bearer sk_live_...
```
Or for test environments:
```
Authorization: Bearer sk_test_...
```

### Idempotency
All mutating POST endpoints accept an `Idempotency-Key` header:
```
Idempotency-Key: order_tx_829103
```
If the same key is submitted twice, PayCore returns the original cached response without re-processing.

---

## 1. Orders

### Create an Order
- **Endpoint**: `POST /api/v1/orders`
- **Permissions**: `orders:write`
- **Request Body**:
  ```json
  {
    "amount": 49900,
    "currency": "INR",
    "description": "Pro Membership",
    "orderNumber": "ORD-82931",
    "customerId": "cust_123",
    "expiresInMinutes": 15
  }
  ```
- **Note**: Amounts are represented strictly in integer minor units (**paise** for INR: ₹499.00 = `49900`).

### Retrieve an Order
- **Endpoint**: `GET /api/v1/orders/:id`
- **Permissions**: `orders:read`

---

## 2. Payments

### Initiate a Payment Request
- **Endpoint**: `POST /api/v1/payments`
- **Permissions**: `payments:write`
- **Request Body**:
  ```json
  {
    "orderId": "ord_101",
    "method": "upi",
    "provider": "mock"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "payment": { "id": "pay_201", "status": "PENDING", ... },
      "qrPayload": "upi://pay?pa=...&am=499.00...",
      "qrImageUrl": "data:image/png;base64,...",
      "upiIntentUrl": "upi://pay?pa=..."
    }
  }
  ```

### Authoritatively Verify a Payment
- **Endpoint**: `POST /api/v1/payments/:id/verify`
- **Permissions**: `payments:write`
- **Request Body**:
  ```json
  {
    "providerPaymentId": "pay_xyz",
    "signature": "hmac_signature_if_applicable"
  }
  ```

---

## 3. Payment Links

### Create a Payment Link
- **Endpoint**: `POST /api/v1/payment-links`
- **Request Body**:
  ```json
  {
    "title": "Design Workshop",
    "amount": 99900,
    "currency": "INR",
    "description": "Live 3-hour session"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "id": "plink_xyz",
      "code": "workshop",
      "url": "https://your-domain.com/pay/workshop"
    }
  }
  ```

---

## 4. QR Generation

### Generate Dynamic Order QR
- **Endpoint**: `POST /api/v1/qr/dynamic`
- **Request Body**:
  ```json
  {
    "amount": 49900,
    "orderNumber": "ORD-82931"
  }
  ```

### Generate Static Counter QR
- **Endpoint**: `POST /api/v1/qr/static`
- **Request Body**:
  ```json
  {
    "vpa": "merchant@upi",
    "merchantName": "My Store",
    "note": "Store Counter"
  }
  ```

---

## 5. Refunds

### Issue Full or Partial Refund
- **Endpoint**: `POST /api/v1/refunds`
- **Request Body**:
  ```json
  {
    "paymentId": "pay_201",
    "amount": 49900,
    "reason": "Customer cancellation"
  }
  ```
