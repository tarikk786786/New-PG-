export type PaymentStatus =
  | "CREATED"
  | "PENDING"
  | "PROCESSING"
  | "AUTHORIZED"
  | "PAID"
  | "EXPIRED"
  | "CANCELLED"
  | "FAILED"
  | "DISPUTED"
  | "REFUND_PENDING"
  | "PARTIALLY_REFUNDED"
  | "REFUNDED";

export type OrderStatus = "PENDING" | "PAID" | "CANCELLED" | "EXPIRED";

export type PaymentMethod = "upi" | "card" | "netbanking" | "wallet" | "qr" | "simulator";

export type ProviderType = "razorpay" | "upi" | "payhip" | "mock" | string;

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  } | null;
  request_id: string;
}

export interface Customer {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId?: string;
  amount: number; // in integer paise (e.g. 49900 = ₹499.00)
  currency: string;
  status: OrderStatus;
  description?: string;
  metadata?: Record<string, any>;
  checkoutSessionId?: string;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
}

export interface Payment {
  id: string;
  orderId: string;
  provider: ProviderType;
  providerPaymentId?: string;
  amount: number; // in integer paise
  currency: string;
  status: PaymentStatus;
  method: PaymentMethod;
  upiIdMasked?: string;
  referenceId?: string;
  providerResponse?: Record<string, any>;
  createdAt: string;
  paidAt?: string;
  failedAt?: string;
}

export interface PaymentLink {
  id: string;
  code: string;
  title: string;
  amount: number; // in paise
  currency: string;
  description?: string;
  active: boolean;
  maxPayments?: number;
  paymentCount: number;
  redirectUrl?: string;
  successMessage?: string;
  collectEmail?: boolean;
  collectPhone?: boolean;
  collectAddress?: boolean;
  expiresAt?: string;
  createdAt: string;
}

export interface DynamicQRCode {
  id: string;
  orderId?: string;
  paymentId?: string;
  referenceId: string;
  amount: number;
  currency: string;
  qrPayload: string;
  qrImageUrl?: string;
  expiresAt: string;
  status: "ACTIVE" | "EXPIRED" | "USED";
  createdAt: string;
}

export interface WebhookEventRecord {
  id: string;
  provider: ProviderType;
  eventId?: string;
  eventType: string;
  payload: Record<string, any>;
  signature?: string;
  verified: boolean;
  processed: boolean;
  createdAt: string;
}

export interface WebhookEndpoint {
  id: string;
  url: string;
  description?: string;
  secret: string;
  events: string[];
  active: boolean;
  createdAt: string;
}

export interface WebhookDelivery {
  id: string;
  endpointId: string;
  eventId: string;
  eventType: string;
  payload: Record<string, any>;
  status: "SUCCESS" | "FAILED" | "PENDING";
  statusCode?: number;
  responseBody?: string;
  attempts: number;
  nextAttemptAt?: string;
  createdAt: string;
}

export interface ApiKey {
  id: string;
  name: string;
  keyPrefix: string;
  keyHash: string;
  type: "live" | "test";
  permissions: string[];
  revoked: boolean;
  createdAt: string;
  lastUsedAt?: string;
}

export interface AuditLog {
  id: string;
  actor: string;
  action: string;
  resource: string;
  details?: Record<string, any>;
  timestamp: string;
}

export interface CheckoutConfig {
  logo?: string;
  businessName: string;
  theme?: "light" | "dark" | "system";
  primaryColor?: string;
  currency: string;
  showQRCode?: boolean;
  showUPIApps?: boolean;
  collectName?: boolean;
  collectEmail?: boolean;
  collectPhone?: boolean;
  termsUrl?: string;
  privacyUrl?: string;
  successUrl?: string;
  cancelUrl?: string;
}
