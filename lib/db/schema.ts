import { pgTable, text, integer, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";

export const customers = pgTable("customers", {
  id: text("id").primaryKey(),
  name: text("name"),
  email: text("email"),
  phone: text("phone"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const orders = pgTable("orders", {
  id: text("id").primaryKey(),
  orderNumber: text("order_number").notNull().unique(),
  customerId: text("customer_id").references(() => customers.id),
  amount: integer("amount").notNull(), // in paise
  currency: text("currency").default("INR").notNull(),
  status: text("status").default("PENDING").notNull(),
  description: text("description"),
  metadata: jsonb("metadata"),
  checkoutSessionId: text("checkout_session_id"),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const payments = pgTable("payments", {
  id: text("id").primaryKey(),
  orderId: text("order_id").references(() => orders.id).notNull(),
  provider: text("provider").notNull(),
  providerPaymentId: text("provider_payment_id"),
  amount: integer("amount").notNull(),
  currency: text("currency").default("INR").notNull(),
  status: text("status").default("CREATED").notNull(),
  method: text("method").default("upi").notNull(),
  upiIdMasked: text("upi_id_masked"),
  referenceId: text("reference_id"),
  providerResponse: jsonb("provider_response"),
  paidAt: timestamp("paid_at", { withTimezone: true }),
  failedAt: timestamp("failed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const paymentLinks = pgTable("payment_links", {
  id: text("id").primaryKey(),
  code: text("code").notNull().unique(),
  title: text("title").notNull(),
  amount: integer("amount").notNull(),
  currency: text("currency").default("INR").notNull(),
  description: text("description"),
  active: boolean("active").default(true).notNull(),
  maxPayments: integer("max_payments"),
  paymentCount: integer("payment_count").default(0).notNull(),
  redirectUrl: text("redirect_url"),
  successMessage: text("success_message"),
  collectEmail: boolean("collect_email").default(true),
  collectPhone: boolean("collect_phone").default(false),
  collectAddress: boolean("collect_address").default(false),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const qrCodes = pgTable("qr_codes", {
  id: text("id").primaryKey(),
  orderId: text("order_id").references(() => orders.id),
  paymentId: text("payment_id").references(() => payments.id),
  referenceId: text("reference_id").notNull(),
  amount: integer("amount").notNull(),
  currency: text("currency").default("INR").notNull(),
  qrPayload: text("qr_payload").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  status: text("status").default("ACTIVE").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const webhookEvents = pgTable("webhook_events", {
  id: text("id").primaryKey(),
  provider: text("provider").notNull(),
  eventId: text("event_id"),
  eventType: text("event_type").notNull(),
  payload: jsonb("payload").notNull(),
  signature: text("signature"),
  verified: boolean("verified").default(false).notNull(),
  processed: boolean("processed").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const webhookEndpoints = pgTable("webhook_endpoints", {
  id: text("id").primaryKey(),
  url: text("url").notNull(),
  description: text("description"),
  secret: text("secret").notNull(),
  events: jsonb("events").notNull(),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const webhookDeliveries = pgTable("webhook_deliveries", {
  id: text("id").primaryKey(),
  endpointId: text("endpoint_id").references(() => webhookEndpoints.id).notNull(),
  eventId: text("event_id").notNull(),
  eventType: text("event_type").notNull(),
  payload: jsonb("payload").notNull(),
  status: text("status").default("PENDING").notNull(),
  statusCode: integer("status_code"),
  responseBody: text("response_body"),
  attempts: integer("attempts").default(0).notNull(),
  nextAttemptAt: timestamp("next_attempt_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const apiKeys = pgTable("api_keys", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  keyPrefix: text("key_prefix").notNull(),
  keyHash: text("key_hash").notNull(),
  type: text("type").notNull(), // 'live' | 'test'
  permissions: jsonb("permissions").notNull(),
  revoked: boolean("revoked").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  lastUsedAt: timestamp("last_used_at", { withTimezone: true }),
});

export const auditLogs = pgTable("audit_logs", {
  id: text("id").primaryKey(),
  actor: text("actor").notNull(),
  action: text("action").notNull(),
  resource: text("resource").notNull(),
  details: jsonb("details"),
  timestamp: timestamp("timestamp", { withTimezone: true }).defaultNow().notNull(),
});

export const idempotencyKeys = pgTable("idempotency_keys", {
  id: text("id").primaryKey(),
  key: text("key").notNull().unique(),
  path: text("path").notNull(),
  responseStatus: integer("response_status").notNull(),
  responseBody: jsonb("response_body").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
});
