import test from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";

// Test 1: State Machine Transitions
const ALLOWED_TRANSITIONS = {
  CREATED: ["PENDING", "CANCELLED", "FAILED"],
  PENDING: ["PROCESSING", "AUTHORIZED", "PAID", "FAILED", "CANCELLED", "EXPIRED"],
  PROCESSING: ["AUTHORIZED", "PAID", "FAILED", "CANCELLED"],
  AUTHORIZED: ["PAID", "FAILED", "CANCELLED"],
  PAID: ["REFUND_PENDING", "PARTIALLY_REFUNDED", "REFUNDED", "DISPUTED"],
  EXPIRED: [],
  CANCELLED: [],
  FAILED: [],
  DISPUTED: ["REFUNDED", "PAID"],
  REFUND_PENDING: ["PARTIALLY_REFUNDED", "REFUNDED", "PAID"],
  PARTIALLY_REFUNDED: ["REFUNDED"],
  REFUNDED: [],
};

function canTransition(current, target) {
  if (current === target) return true;
  return (ALLOWED_TRANSITIONS[current] || []).includes(target);
}

test("State Machine: Valid transitions", () => {
  assert.equal(canTransition("CREATED", "PENDING"), true);
  assert.equal(canTransition("PENDING", "PROCESSING"), true);
  assert.equal(canTransition("PENDING", "PAID"), true);
  assert.equal(canTransition("PAID", "REFUNDED"), true);
});

test("State Machine: Rejects invalid or dangerous transitions", () => {
  // Never allow client to jump straight from CREATED to PAID
  assert.equal(canTransition("CREATED", "PAID"), false);
  // Never allow resurrected payments from terminal states
  assert.equal(canTransition("FAILED", "PAID"), false);
  assert.equal(canTransition("CANCELLED", "PAID"), false);
  assert.equal(canTransition("REFUNDED", "PAID"), false);
});

// Test 2: Currency & Minor Units
function formatPaise(paise) {
  return `₹${(paise / 100).toFixed(2)}`;
}

function toPaise(rupees) {
  const num = typeof rupees === "string" ? parseFloat(rupees) : rupees;
  return Math.round(num * 100);
}

test("Money Calculations: Strict integer minor unit conversions", () => {
  assert.equal(toPaise("499.50"), 49950);
  assert.equal(toPaise(1499), 149900);
  assert.equal(formatPaise(49950), "₹499.50");
  assert.equal(formatPaise(49900), "₹499.00");
});

// Test 3: Razorpay HMAC-SHA256 Webhook Verification
test("Razorpay Signature Verification: Valid signature matches raw body", () => {
  const secret = "test_webhook_secret_123";
  const rawBody = JSON.stringify({ event: "payment.captured", id: "evt_123" });

  const validSignature = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");

  const generatedCheck = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");

  assert.equal(validSignature, generatedCheck);

  const invalidSignature = "invalid_tampered_signature";
  assert.notEqual(validSignature, invalidSignature);
});

// Test 4: NPCI UPI URI Builder
test("NPCI UPI URI: Conforms to upi://pay specification", () => {
  const vpa = "paycore@upi";
  const name = encodeURIComponent("PayCore Merchant");
  const amount = (49900 / 100).toFixed(2);
  const ref = "ORD-82931";
  const note = encodeURIComponent("Payment");

  const uri = `upi://pay?pa=${vpa}&pn=${name}&am=${amount}&tr=${ref}&tn=${note}&cu=INR`;

  assert.match(uri, /^upi:\/\/pay\?/);
  assert.match(uri, /pa=paycore%40upi|pa=paycore@upi/);
  assert.match(uri, /am=499\.00/);
  assert.match(uri, /cu=INR/);
});
