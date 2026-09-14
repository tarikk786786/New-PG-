import { store } from "./store";
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
  PaymentStatus,
  OrderStatus,
} from "@/lib/types";

export const db = {
  // --- Orders ---
  orders: {
    async create(data: Order): Promise<Order> {
      store.orders.set(data.id, { ...data });
      return data;
    },
    async get(id: string): Promise<Order | null> {
      return store.orders.get(id) || null;
    },
    async getByNumber(orderNumber: string): Promise<Order | null> {
      for (const ord of store.orders.values()) {
        if (ord.orderNumber === orderNumber) return ord;
      }
      return null;
    },
    async list(): Promise<Order[]> {
      return Array.from(store.orders.values()).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    },
    async updateStatus(id: string, status: OrderStatus): Promise<Order | null> {
      const ord = store.orders.get(id);
      if (!ord) return null;
      ord.status = status;
      ord.updatedAt = new Date().toISOString();
      store.orders.set(id, ord);
      return ord;
    },
  },

  // --- Payments ---
  payments: {
    async create(data: Payment): Promise<Payment> {
      store.payments.set(data.id, { ...data });
      return data;
    },
    async get(id: string): Promise<Payment | null> {
      return store.payments.get(id) || null;
    },
    async list(filters?: { status?: PaymentStatus; orderId?: string }): Promise<Payment[]> {
      let list = Array.from(store.payments.values());
      if (filters?.status) list = list.filter((p) => p.status === filters.status);
      if (filters?.orderId) list = list.filter((p) => p.orderId === filters.orderId);
      return list.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    },
    async updateStatus(
      id: string,
      status: PaymentStatus,
      extra?: { paidAt?: string; failedAt?: string; providerPaymentId?: string; referenceId?: string }
    ): Promise<Payment | null> {
      const pay = store.payments.get(id);
      if (!pay) return null;
      pay.status = status;
      if (extra?.paidAt) pay.paidAt = extra.paidAt;
      if (extra?.failedAt) pay.failedAt = extra.failedAt;
      if (extra?.providerPaymentId) pay.providerPaymentId = extra.providerPaymentId;
      if (extra?.referenceId) pay.referenceId = extra.referenceId;
      store.payments.set(id, pay);
      return pay;
    },
  },

  // --- Customers ---
  customers: {
    async create(data: Customer): Promise<Customer> {
      store.customers.set(data.id, { ...data });
      return data;
    },
    async get(id: string): Promise<Customer | null> {
      return store.customers.get(id) || null;
    },
    async list(): Promise<Customer[]> {
      return Array.from(store.customers.values()).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    },
  },

  // --- Payment Links ---
  paymentLinks: {
    async create(data: PaymentLink): Promise<PaymentLink> {
      store.paymentLinks.set(data.id, { ...data });
      return data;
    },
    async get(id: string): Promise<PaymentLink | null> {
      return store.paymentLinks.get(id) || null;
    },
    async getByCode(code: string): Promise<PaymentLink | null> {
      for (const l of store.paymentLinks.values()) {
        if (l.code.toLowerCase() === code.toLowerCase()) return l;
      }
      return null;
    },
    async list(): Promise<PaymentLink[]> {
      return Array.from(store.paymentLinks.values()).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    },
    async incrementCount(id: string): Promise<void> {
      const link = store.paymentLinks.get(id);
      if (link) {
        link.paymentCount = (link.paymentCount || 0) + 1;
        store.paymentLinks.set(id, link);
      }
    },
  },

  // --- QR Codes ---
  qrCodes: {
    async create(data: DynamicQRCode): Promise<DynamicQRCode> {
      store.qrCodes.set(data.id, { ...data });
      return data;
    },
    async get(id: string): Promise<DynamicQRCode | null> {
      return store.qrCodes.get(id) || null;
    },
  },

  // --- Webhooks ---
  webhooks: {
    async recordEvent(event: WebhookEventRecord): Promise<WebhookEventRecord> {
      store.webhookEvents.set(event.id, { ...event });
      return event;
    },
    async listEvents(): Promise<WebhookEventRecord[]> {
      return Array.from(store.webhookEvents.values()).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    },
    async createEndpoint(endpoint: WebhookEndpoint): Promise<WebhookEndpoint> {
      store.webhookEndpoints.set(endpoint.id, { ...endpoint });
      return endpoint;
    },
    async listEndpoints(): Promise<WebhookEndpoint[]> {
      return Array.from(store.webhookEndpoints.values());
    },
    async recordDelivery(delivery: WebhookDelivery): Promise<WebhookDelivery> {
      store.webhookDeliveries.set(delivery.id, { ...delivery });
      return delivery;
    },
    async listDeliveries(): Promise<WebhookDelivery[]> {
      return Array.from(store.webhookDeliveries.values()).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    },
  },

  // --- API Keys ---
  apiKeys: {
    async getByKey(key: string): Promise<ApiKey | null> {
      for (const k of store.apiKeys.values()) {
        if (k.keyHash === key && !k.revoked) return k;
      }
      return null;
    },
    async list(): Promise<ApiKey[]> {
      return Array.from(store.apiKeys.values());
    },
    async create(data: ApiKey): Promise<ApiKey> {
      store.apiKeys.set(data.id, { ...data });
      return data;
    },
    async revoke(id: string): Promise<boolean> {
      const k = store.apiKeys.get(id);
      if (!k) return false;
      k.revoked = true;
      store.apiKeys.set(id, k);
      return true;
    },
  },

  // --- Audit Logs ---
  audit: {
    async log(actor: string, action: string, resource: string, details?: Record<string, any>): Promise<AuditLog> {
      const entry: AuditLog = {
        id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        actor,
        action,
        resource,
        details,
        timestamp: new Date().toISOString(),
      };
      store.auditLogs.set(entry.id, entry);
      return entry;
    },
    async list(): Promise<AuditLog[]> {
      return Array.from(store.auditLogs.values()).sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    },
  },

  // --- Idempotency ---
  idempotency: {
    async get(key: string): Promise<{ status: number; body: any } | null> {
      const entry = store.idempotency.get(key);
      if (!entry) return null;
      if (entry.expiresAt < Date.now()) {
        store.idempotency.delete(key);
        return null;
      }
      return { status: entry.status, body: entry.body };
    },
    async set(key: string, status: number, body: any, ttlSeconds = 86400): Promise<void> {
      store.idempotency.set(key, {
        status,
        body,
        expiresAt: Date.now() + ttlSeconds * 1000,
      });
    },
  },
};
