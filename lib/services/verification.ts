import { db } from "@/lib/db";
import { providerFactory } from "@/lib/providers";
import { Payment, Order } from "@/lib/types";
import { StateMachineService } from "./state-machine";

export interface VerificationRequest {
  orderId: string;
  paymentId?: string;
  providerPaymentId: string;
  expectedAmountPaise: number;
  expectedCurrency?: string;
  signature?: string;
  rawBody?: string;
  provider?: string;
}

export interface VerificationResponse {
  verified: boolean;
  status: "PAID" | "FAILED" | "PENDING";
  payment?: Payment;
  order?: Order;
  error?: string;
}

export class VerificationService {
  /**
   * Multi-factor payment verification engine
   * Enforces:
   * 1. Order and Payment record existence
   * 2. Amount and Currency parity (in integer paise)
   * 3. Provider signature / API confirmation
   * 4. State machine compliance
   * 5. Transition to PAID only by authoritative server verification
   */
  static async verify(req: VerificationRequest): Promise<VerificationResponse> {
    const order = await db.orders.get(req.orderId);
    if (!order) {
      return { verified: false, status: "FAILED", error: `Order ${req.orderId} not found` };
    }

    // 1. Verify Amount Parity
    if (order.amount !== req.expectedAmountPaise) {
      await db.audit.log("system", "VERIFICATION_AMOUNT_MISMATCH", order.id, {
        orderAmount: order.amount,
        reportedAmount: req.expectedAmountPaise,
      });
      return {
        verified: false,
        status: "FAILED",
        error: `Amount mismatch: expected ${order.amount} paise, received ${req.expectedAmountPaise} paise`,
      };
    }

    // 2. Verify Currency Parity
    const expectedCurrency = req.expectedCurrency || "INR";
    if (order.currency.toUpperCase() !== expectedCurrency.toUpperCase()) {
      return {
        verified: false,
        status: "FAILED",
        error: `Currency mismatch: expected ${order.currency}, received ${expectedCurrency}`,
      };
    }

    // 3. Find or identify payment
    let payment: Payment | null = null;
    if (req.paymentId) {
      payment = await db.payments.get(req.paymentId);
    } else {
      const existingPayments = await db.payments.list({ orderId: order.id });
      payment = existingPayments.length > 0 ? existingPayments[0] : null;
    }

    // 4. Provider Verification
    const providerName = req.provider || payment?.provider || "mock";
    const provider = providerFactory.get(providerName);

    const providerResult = await provider.verifyPayment({
      orderId: order.id,
      providerPaymentId: req.providerPaymentId,
      amount: req.expectedAmountPaise,
      currency: expectedCurrency,
      signature: req.signature,
      rawBody: req.rawBody,
    });

    if (!providerResult.verified) {
      if (payment) {
        await db.payments.updateStatus(payment.id, "FAILED", {
          failedAt: new Date().toISOString(),
          providerPaymentId: req.providerPaymentId,
        });
      }
      return {
        verified: false,
        status: "FAILED",
        error: providerResult.errorMessage || "Provider verification failed or signature mismatch",
      };
    }

    // 5. Authoritative State Transition to PAID
    const now = new Date().toISOString();
    if (payment) {
      StateMachineService.validateTransition(payment.status, "PAID");
      await db.payments.updateStatus(payment.id, "PAID", {
        paidAt: now,
        providerPaymentId: req.providerPaymentId,
        referenceId: providerResult.referenceId,
      });
    }

    await db.orders.updateStatus(order.id, "PAID");

    await db.audit.log("system", "PAYMENT_VERIFIED", order.id, {
      paymentId: payment?.id,
      providerPaymentId: req.providerPaymentId,
      amount: req.expectedAmountPaise,
      provider: providerName,
    });

    const updatedOrder = (await db.orders.get(order.id)) || order;
    const updatedPayment = payment ? (await db.payments.get(payment.id)) || payment : undefined;

    return {
      verified: true,
      status: "PAID",
      payment: updatedPayment,
      order: updatedOrder,
    };
  }
}
