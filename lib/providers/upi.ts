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

export class UPIProvider implements PaymentProvider {
  readonly id = "upi";
  readonly name = "Direct UPI (NPCI Intent & Dynamic QR)";

  private vpa: string;
  private merchantName: string;

  constructor() {
    this.vpa = process.env.UPI_VPA || "princetarikislam-4@okaxis";
    this.merchantName = process.env.UPI_MERCHANT_NAME || "Tarik Islam";
  }

  /**
   * Build an NPCI-compliant UPI payment intent string
   */
  buildUpiUri(params: {
    vpa: string;
    name: string;
    amountPaise: number;
    transactionRef: string;
    note?: string;
  }): string {
    const amountRupees = (params.amountPaise / 100).toFixed(2);
    const note = encodeURIComponent(params.note || "PayCore Order Payment");
    const name = encodeURIComponent(params.name);

    return `upi://pay?pa=${params.vpa}&pn=${name}&am=${amountRupees}&tr=${params.transactionRef}&tn=${note}&cu=INR`;
  }

  async createDynamicQR(params: CreateDynamicQRParams): Promise<ProviderQRResult> {
    const referenceId = `UPI-${params.orderNumber}-${Math.floor(1000 + Math.random() * 9000)}`;
    const upiUri = this.buildUpiUri({
      vpa: this.vpa,
      name: this.merchantName,
      amountPaise: params.amount,
      transactionRef: referenceId,
      note: params.description || `Order ${params.orderNumber}`,
    });

    const qrImageUrl = await QRCode.toDataURL(upiUri, {
      errorCorrectionLevel: "M",
      margin: 2,
      width: 300,
      color: {
        dark: "#0f172a",
        light: "#ffffff",
      },
    });

    const expiresInMinutes = params.expiresInMinutes || 15;
    const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000).toISOString();

    return {
      qrId: `qr_${Date.now()}`,
      qrPayload: upiUri,
      qrImageUrl,
      referenceId,
      expiresAt,
    };
  }

  async createPayment(params: CreatePaymentParams): Promise<ProviderPaymentResult> {
    const qrResult = await this.createDynamicQR({
      orderId: params.orderId,
      orderNumber: params.orderNumber,
      amount: params.amount,
      currency: params.currency,
      description: params.description,
    });

    return {
      provider: this.id,
      providerPaymentId: qrResult.referenceId,
      status: "PENDING",
      amount: params.amount,
      currency: params.currency,
      qrPayload: qrResult.qrPayload,
      qrImageUrl: qrResult.qrImageUrl,
      upiIntentUrl: qrResult.qrPayload,
    };
  }

  async fetchPayment(providerPaymentId: string): Promise<VerificationResult> {
    // Direct UPI without PSP API cannot authoritatively confirm without bank webhook/reconciliation
    return {
      verified: false,
      status: "PENDING",
      amount: 0,
      currency: "INR",
      providerPaymentId,
      errorMessage: "Direct UPI payments require bank webhook or PSP reconciliation to verify.",
    };
  }

  async verifyPayment(params: VerifyPaymentParams): Promise<VerificationResult> {
    // Mode 1/2 note: As stated in PRD, never trust client-claimed UPI payment without provider proof
    return {
      verified: false,
      status: "PENDING",
      amount: params.amount,
      currency: params.currency,
      providerPaymentId: params.providerPaymentId,
      errorMessage: "Direct UPI intent requires authoritative bank/PSP settlement confirmation.",
    };
  }

  async refundPayment(params: RefundParams): Promise<RefundResult> {
    return {
      refundId: `ref_mock_${Date.now()}`,
      paymentId: params.paymentId,
      amount: params.amount || 0,
      status: "REFUND_PENDING",
    };
  }

  async verifyWebhookSignature(rawBody: string, signature: string): Promise<boolean> {
    return true;
  }

  async parseWebhookEvent(rawBody: string): Promise<WebhookEventPayload> {
    const data = JSON.parse(rawBody || "{}");
    return {
      eventType: data.event || "payment.pending",
      status: data.status || "PENDING",
      raw: data,
    };
  }
}
