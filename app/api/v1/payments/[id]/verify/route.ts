import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ApiKeyService } from "@/lib/services/api-keys";
import { VerificationService } from "@/lib/services/verification";
import { WebhookDispatcher } from "@/lib/services/webhook-dispatcher";
import { NotificationService } from "@/lib/services/notifications";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const requestId = `req_${Date.now()}`;
  const auth = await ApiKeyService.authenticate(req, "payments:write");
  if (!auth.authenticated) {
    return NextResponse.json(
      { success: false, data: null, error: { code: "UNAUTHORIZED", message: auth.error }, request_id: requestId },
      { status: 401 }
    );
  }

  const { id } = await params;
  const payment = await db.payments.get(id);
  if (!payment) {
    return NextResponse.json(
      { success: false, data: null, error: { code: "PAYMENT_NOT_FOUND", message: `Payment '${id}' not found` }, request_id: requestId },
      { status: 404 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const order = await db.orders.get(payment.orderId);
  if (!order) {
    return NextResponse.json(
      { success: false, data: null, error: { code: "ORDER_NOT_FOUND", message: "Associated order not found" }, request_id: requestId },
      { status: 404 }
    );
  }

  const verification = await VerificationService.verify({
    orderId: order.id,
    paymentId: payment.id,
    providerPaymentId: body.providerPaymentId || payment.providerPaymentId || `sim_${Date.now()}`,
    expectedAmountPaise: order.amount,
    expectedCurrency: order.currency,
    signature: body.signature,
    provider: payment.provider,
  });

  if (!verification.verified) {
    return NextResponse.json(
      {
        success: false,
        data: null,
        error: { code: "VERIFICATION_FAILED", message: verification.error || "Payment verification failed" },
        request_id: requestId,
      },
      { status: 400 }
    );
  }

  // Dispatch outbound application webhooks
  await WebhookDispatcher.dispatch("payment.paid", {
    paymentId: payment.id,
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    status: "PAID",
  });

  // Telegram alert
  await NotificationService.sendTelegramAlert({
    amountPaise: order.amount,
    orderNumber: order.orderNumber,
    status: "PAID",
    provider: payment.provider,
  });

  return NextResponse.json({
    success: true,
    data: {
      verified: true,
      status: "PAID",
      payment: verification.payment,
      order: verification.order,
    },
    error: null,
    request_id: requestId,
  });
}
