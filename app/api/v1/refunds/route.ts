import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { providerFactory } from "@/lib/providers";
import { ApiKeyService } from "@/lib/services/api-keys";
import { StateMachineService } from "@/lib/services/state-machine";
import { WebhookDispatcher } from "@/lib/services/webhook-dispatcher";

export async function POST(req: NextRequest) {
  const requestId = `req_${Date.now()}`;
  const auth = await ApiKeyService.authenticate(req, "refunds:write");
  if (!auth.authenticated) {
    return NextResponse.json(
      { success: false, data: null, error: { code: "UNAUTHORIZED", message: auth.error }, request_id: requestId },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    if (!body.paymentId) {
      return NextResponse.json(
        { success: false, data: null, error: { code: "BAD_REQUEST", message: "paymentId is required" }, request_id: requestId },
        { status: 400 }
      );
    }

    const payment = await db.payments.get(body.paymentId);
    if (!payment) {
      return NextResponse.json(
        { success: false, data: null, error: { code: "PAYMENT_NOT_FOUND", message: `Payment '${body.paymentId}' not found` }, request_id: requestId },
        { status: 404 }
      );
    }

    // State machine check: must be PAID before refund
    if (payment.status !== "PAID") {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: { code: "INVALID_STATE", message: `Cannot refund payment with status '${payment.status}'. Only PAID payments can be refunded.` },
          request_id: requestId,
        },
        { status: 400 }
      );
    }

    const provider = providerFactory.get(payment.provider);
    const refundResult = await provider.refundPayment({
      paymentId: payment.id,
      providerPaymentId: payment.providerPaymentId || payment.id,
      amount: body.amount || payment.amount,
      reason: body.reason,
    });

    const targetStatus = (body.amount && body.amount < payment.amount) ? "PARTIALLY_REFUNDED" : "REFUNDED";
    StateMachineService.validateTransition(payment.status, targetStatus);
    await db.payments.updateStatus(payment.id, targetStatus);

    await db.audit.log(auth.apiKey?.name || "api", "REFUND_CREATED", payment.id, {
      refundId: refundResult.refundId,
      amount: refundResult.amount,
      status: targetStatus,
    });

    await WebhookDispatcher.dispatch("payment.refunded", {
      paymentId: payment.id,
      refundId: refundResult.refundId,
      amount: refundResult.amount,
      status: targetStatus,
    });

    return NextResponse.json({
      success: true,
      data: {
        refundId: refundResult.refundId,
        paymentId: payment.id,
        amount: refundResult.amount,
        status: targetStatus,
      },
      error: null,
      request_id: requestId,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, data: null, error: { code: "INTERNAL_ERROR", message: err.message }, request_id: requestId },
      { status: 500 }
    );
  }
}
