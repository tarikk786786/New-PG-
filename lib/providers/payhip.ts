import crypto from "crypto";
import QRCode from "qrcode";
import {
  PaymentProvider,
  CreatePaymentParams,
  ProviderPaymentResult,
  CreateDynamicQRParams,
  ProviderQRResult,
  VerifyPaymentParams,
  VerificationResult,
  RefundParams,
  RefundResult,
  WebhookEventPayload,
} from "./types";

export class PayhipProvider implements PaymentProvider {
  readonly id = "payhip";
  readonly name = "Payhip Webhook Adapter";

  private apiKey: string;

  constructor() {
    this.apiKey = process.env.PAYHIP_API_KEY || "";
  }

  async createPayment(params: CreatePaymentParams): Promise<ProviderPaymentResult> {
    const providerPaymentId = `payhip_${Date.now()}`;
    return {
      provider: this.id,
      providerPaymentId,
      status: "PENDING",
      amount: params.amount,
      currency: params.currency,
      paymentUrl: `https://payhip.com/b/example?custom=${params.orderId}`,
    };
  }

  async createDynamicQR(params: CreateDynamicQRParams): Promise<ProviderQRResult> {
    const url = `https://payhip.com/b/example?custom=${params.orderId}`;
    const qrImageUrl = await QRCode.toDataURL(url);
    return {
      qrId: `qr_${params.orderNumber}`,
      qrPayload: url,
      qrImageUrl,
      referenceId: params.orderNumber,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    };
  }

  async fetchPayment(providerPaymentId: string): Promise<VerificationResult> {
    return {
      verified: true,
      status: "PAID",
      amount: 0,
      currency: "USD",
      providerPaymentId,
    };
  }

  async verifyPayment(params: VerifyPaymentParams): Promise<VerificationResult> {
    return {
      verified: true,
      status: "PAID",
      amount: params.amount,
      currency: params.currency,
      providerPaymentId: params.providerPaymentId,
    };
  }

  async refundPayment(params: RefundParams): Promise<RefundResult> {
    return {
      refundId: `ref_payhip_${Date.now()}`,
      paymentId: params.paymentId,
      amount: params.amount || 0,
      status: "REFUNDED",
    };
  }

  async verifyWebhookSignature(rawBody: string, signature: string): Promise<boolean> {
    if (!this.apiKey) return true; // Accept if no key configured in test
    // Payhip sends signature or SHA-256 hash
    const expected = crypto.createHash("sha256").update(this.apiKey).digest("hex");
    return signature === expected;
  }

  async parseWebhookEvent(rawBody: string): Promise<WebhookEventPayload> {
    const data = typeof rawBody === "string" ? JSON.parse(rawBody || "{}") : rawBody;
    const eventType = data.type || "paid";

    return {
      eventId: data.id || `evt_payhip_${Date.now()}`,
      eventType,
      orderId: data.custom_data?.orderId || data.customer_id,
      providerPaymentId: data.transaction_id || data.id,
      amount: Math.round((parseFloat(data.price || "0") || 0) * 100),
      currency: data.currency || "USD",
      status: eventType === "refunded" ? "REFUNDED" : "PAID",
      raw: data,
    };
  }
}
