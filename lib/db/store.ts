import {
  Order,
  Payment,
  Customer,
  PaymentLink,
  DynamicQRCode,
  WebhookEventRecord,
  WebhookEndpoint,
  WebhookDelivery,
  ApiKey,
  AuditLog,
} from "@/lib/types";

// In-Memory Global Store with initial sample seed data
interface PayCoreStore {
  orders: Map<string, Order>;
  payments: Map<string, Payment>;
  customers: Map<string, Customer>;
  paymentLinks: Map<string, PaymentLink>;
  qrCodes: Map<string, DynamicQRCode>;
  webhookEvents: Map<string, WebhookEventRecord>;
  webhookEndpoints: Map<string, WebhookEndpoint>;
  webhookDeliveries: Map<string, WebhookDelivery>;
  apiKeys: Map<string, ApiKey>;
  auditLogs: Map<string, AuditLog>;
  idempotency: Map<string, { status: number; body: any; expiresAt: number }>;
}

const globalForStore = global as unknown as { paycoreStore?: PayCoreStore };

function initStore(): PayCoreStore {
  const now = new Date().toISOString();

  const store: PayCoreStore = {
    orders: new Map(),
    payments: new Map(),
    customers: new Map(),
    paymentLinks: new Map(),
    qrCodes: new Map(),
    webhookEvents: new Map(),
    webhookEndpoints: new Map(),
    webhookDeliveries: new Map(),
    apiKeys: new Map(),
    auditLogs: new Map(),
    idempotency: new Map(),
  };

  // Seed sample customer
  const cust1: Customer = {
    id: "cust_demo123",
    name: "Arjun Verma",
    email: "arjun@example.com",
    phone: "+919876543210",
    createdAt: now,
  };
  store.customers.set(cust1.id, cust1);

  // Seed sample orders & payments
  const ord1: Order = {
    id: "ord_101",
    orderNumber: "ORD-82931",
    customerId: cust1.id,
    amount: 49900, // ₹499.00
    currency: "INR",
    status: "PAID",
    description: "Pro Lifetime Subscription",
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
  };
  store.orders.set(ord1.id, ord1);

  const pay1: Payment = {
    id: "pay_201",
    orderId: ord1.id,
    provider: "mock",
    providerPaymentId: "mock_tx_998822",
    amount: 49900,
    currency: "INR",
    status: "PAID",
    method: "upi",
    upiIdMasked: "arjun****@okaxis",
    referenceId: "UPI-REF-998811",
    createdAt: ord1.createdAt,
    paidAt: ord1.updatedAt,
  };
  store.payments.set(pay1.id, pay1);

  const ord2: Order = {
    id: "ord_102",
    orderNumber: "ORD-82932",
    customerId: cust1.id,
    amount: 149900, // ₹1,499.00
    currency: "INR",
    status: "PENDING",
    description: "Cloud Developer Bundle",
    createdAt: new Date(Date.now() - 1800000).toISOString(),
    updatedAt: new Date(Date.now() - 1800000).toISOString(),
  };
  store.orders.set(ord2.id, ord2);

  const pay2: Payment = {
    id: "pay_202",
    orderId: ord2.id,
    provider: "mock",
    providerPaymentId: "mock_tx_998833",
    amount: 149900,
    currency: "INR",
    status: "PENDING",
    method: "upi",
    referenceId: "UPI-REF-998812",
    createdAt: ord2.createdAt,
  };
  store.payments.set(pay2.id, pay2);

  // Seed sample Payment Link
  const link1: PaymentLink = {
    id: "plink_dev_course",
    code: "devcourse",
    title: "Full-Stack SaaS Masterclass",
    amount: 99900, // ₹999.00
    currency: "INR",
    description: "Instant access to all modules, source code, and community access.",
    active: true,
    paymentCount: 14,
    collectEmail: true,
    collectPhone: true,
    createdAt: now,
  };
  store.paymentLinks.set(link1.id, link1);

  // Seed standard API Keys
  const defaultLiveKey: ApiKey = {
    id: "key_live_master",
    name: "Production Master Key",
    keyPrefix: "sk_live_paycore",
    keyHash: "sk_live_paycore_master_default_key",
    type: "live",
    permissions: ["orders:*", "payments:*", "refunds:*", "customers:*", "webhooks:*"],
    revoked: false,
    createdAt: now,
  };
  store.apiKeys.set(defaultLiveKey.id, defaultLiveKey);

  const defaultTestKey: ApiKey = {
    id: "key_test_sandbox",
    name: "Sandbox Testing Key",
    keyPrefix: "sk_test_paycore",
    keyHash: "sk_test_paycore_sandbox_default_key",
    type: "test",
    permissions: ["orders:*", "payments:*", "refunds:*", "customers:*", "webhooks:*"],
    revoked: false,
    createdAt: now,
  };
  store.apiKeys.set(defaultTestKey.id, defaultTestKey);

  return store;
}

export const store = globalForStore.paycoreStore ?? (globalForStore.paycoreStore = initStore());
