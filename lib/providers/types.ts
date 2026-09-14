import { PaymentMethod, PaymentStatus, ProviderType } from "@/lib/types";

export interface CreatePaymentParams {
  orderId: string;
  orderNumber: string;
  amount: number; // in paise
  currency: string;
  description?: string;
  customer?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  method?: PaymentMethod;
  metadata?: Record<string, any>;
}

export interface ProviderPaymentResult {
  provider: ProviderType;
  providerPaymentId: string;
  status: PaymentStatus;
  amount: number;
  currency: string;
  paymentUrl?: string;
  qrPayload?: string;
  qrImageUrl?: string;
  upiIntentUrl?: string;
  rawResponse?: Record<string, any>;
}

export interface CreatePaymentLinkParams {
  title: string;
  amount: number;
  currency: string;
  description?: string;
  customer?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  redirectUrl?: string;
  expiresInMinutes?: number;
}

export interface ProviderPaymentLinkResult {
  id: string;
  shortUrl: string;
  amount: number;
  currency: string;
  status: string;
}

export interface CreateDynamicQRParams {
  orderId: string;
  orderNumber: string;
  amount: number; // in paise
  currency: string;
  description?: string;
  expiresInMinutes?: number;
}

export interface ProviderQRResult {
  qrId: string;
  qrPayload: string; // the upi:// string or provider QR string
  qrImageUrl: string; // data:image/png;base64...
  referenceId: string;
  expiresAt: string;
}

export interface VerifyPaymentParams {
  orderId: string;
  providerPaymentId: string;
  amount: number; // in paise
  currency: string;
  signature?: string;
  rawBody?: string;
}

export interface VerificationResult {
  verified: boolean;
  status: PaymentStatus;
  amount: number;
  currency: string;
  providerPaymentId: string;
  referenceId?: string;
  rawResponse?: Record<string, any>;
  errorMessage?: string;
}

export interface RefundParams {
  paymentId: string;
  providerPaymentId: string;
  amount?: number; // in paise (for partial refund)
  reason?: string;
}

export interface RefundResult {
  refundId: string;
  paymentId: string;
  amount: number;
  status: "REFUNDED" | "REFUND_PENDING" | "FAILED";
}

export interface WebhookEventPayload {
  eventId?: string;
  eventType: string;
  orderId?: string;
  providerPaymentId?: string;
  amount?: number;
  currency?: string;
  status: PaymentStatus;
  raw: Record<string, any>;
}

export interface PaymentProvider {
  readonly id: ProviderType;
  readonly name: string;

  createPayment(params: CreatePaymentParams): Promise<ProviderPaymentResult>;
  createPaymentLink?(params: CreatePaymentLinkParams): Promise<ProviderPaymentLinkResult>;
  createDynamicQR(params: CreateDynamicQRParams): Promise<ProviderQRResult>;
  fetchPayment(providerPaymentId: string): Promise<VerificationResult>;
  verifyPayment(params: VerifyPaymentParams): Promise<VerificationResult>;
  refundPayment(params: RefundParams): Promise<RefundResult>;
  verifyWebhookSignature(rawBody: string, signature: string, headers?: Record<string, string>): Promise<boolean>;
  parseWebhookEvent(rawBody: string, headers?: Record<string, string>): Promise<WebhookEventPayload>;
}
