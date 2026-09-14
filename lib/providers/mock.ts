import QRCode from "qrcode";
import {
  PaymentProvider,
  CreatePaymentParams,
  ProviderPaymentResult,
  CreatePaymentLinkParams,
  ProviderPaymentLinkResult,
  CreateDynamicQRParams,
  ProviderQRResult,
  VerifyPaymentParams,
  VerificationResult,
  RefundParams,
  RefundResult,
  WebhookEventPayload,
} from "./types";

export class MockSimulatorProvider implements PaymentProvider {
  readonly id = "mock";
  readonly name = "PayCore Sandbox Simulator";

  async createPayment(params: CreatePaymentParams): Promise<ProviderPaymentResult> {
    const providerPaymentId = `mock_tx_${Date.now()}`;
    const qrResult = await this.createDynamicQR({
      orderId: params.orderId,
      orderNumber: params.orderNumber,
      amount: params.amount,
      currency: params.currency,
      description: params.description,
    });

    return {
      provider: this.id,
      providerPaymentId,
      status: "PENDING",
      amount: params.amount,
      currency: params.currency,
      qrPayload: qrResult.qrPayload,
      qrImageUrl: qrResult.qrImageUrl,
      upiIntentUrl: qrResult.qrPayload,
      rawResponse: {
        simulated: true,
        mode: "sandbox",
        providerPaymentId,
      },
    };
  }

  async createDynamicQR(params: CreateDynamicQRParams): Promise<ProviderQRResult> {
    const referenceId = `SANDBOX-${params.orderNumber}`;
    const amountRupees = (params.amount / 100).toFixed(2);
    // Standard mock UPI intent
    const upiUri = `upi://pay?pa=paycore.sandbox@mockupi&pn=PayCore+Sandbox&am=${amountRupees}&tr=${referenceId}&tn=Sandbox+Payment&cu=INR`;

    const qrImageUrl = await QRCode.toDataURL(upiUri, {
      color: {
        dark: "#4f46e5", // Indigo for sandbox theme
        light: "#ffffff",
      },
      margin: 2,
    });

    const expiresAt = new Date(Date.now() + (params.expiresInMinutes || 15) * 60 * 1000).toISOString();

    return {
      qrId: `qr_${referenceId}`,
      qrPayload: upiUri,
      qrImageUrl,
      referenceId,
      expiresAt,
    };
  }

  async createPaymentLink(params: CreatePaymentLinkParams): Promise<ProviderPaymentLinkResult> {
    const linkId = `plink_mock_${Date.now()}`;
    return {
      id: linkId,
      shortUrl: `/pay/${linkId}`,
      amount: params.amount,
      currency: params.currency,
      status: "active",
    };
  }

  async fetchPayment(providerPaymentId: string): Promise<VerificationResult> {
    return {
      verified: true,
      status: "PAID",
      amount: 10000,
      currency: "INR",
      providerPaymentId,
    };
  }

  async verifyPayment(params: VerifyPaymentParams): Promise<VerificationResult> {
    // In sandbox, verification succeeds if not explicitly simulated as failing
    const isFailed = params.providerPaymentId.includes("fail");
    return {
      verified: !isFailed,
      status: isFailed ? "FAILED" : "PAID",
      amount: params.amount,
      currency: params.currency,
      providerPaymentId: params.providerPaymentId,
      referenceId: `REF-${params.providerPaymentId}`,
    };
  }

  async refundPayment(params: RefundParams): Promise<RefundResult> {
    return {
      refundId: `ref_mock_${Date.now()}`,
      paymentId: params.paymentId,
      amount: params.amount || 0,
      status: "REFUNDED",
    };
  }

  async verifyWebhookSignature(rawBody: string, signature: string): Promise<boolean> {
    if (signature === "invalid_signature_test") return false;
    return true;
  }

  async parseWebhookEvent(rawBody: string): Promise<WebhookEventPayload> {
    const data = typeof rawBody === "string" ? JSON.parse(rawBody || "{}") : rawBody;
    return {
      eventId: data.id || `mock_evt_${Date.now()}`,
      eventType: data.event || "payment.paid",
      orderId: data.orderId,
      providerPaymentId: data.providerPaymentId,
      amount: data.amount,
      currency: data.currency || "INR",
      status: data.status || "PAID",
      raw: data,
    };
  }
}
