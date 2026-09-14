import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { providerFactory } from "@/lib/providers";
import { ApiKeyService } from "@/lib/services/api-keys";
import { IdempotencyService } from "@/lib/services/idempotency";
import { generateId } from "@/lib/utils";
import { Payment } from "@/lib/types";

export async function GET(req: NextRequest) {
  const requestId = `req_${Date.now()}`;
  const auth = await ApiKeyService.authenticate(req, "payments:read");
  if (!auth.authenticated) {
    return NextResponse.json(
      { success: false, data: null, error: { code: "UNAUTHORIZED", message: auth.error }, request_id: requestId },
      { status: 401 }
    );
  }

  const url = new URL(req.url);
  const status = url.searchParams.get("status") as any;
  const orderId = url.searchParams.get("orderId") || undefined;

  const list = await db.payments.list({ status, orderId });
  return NextResponse.json({
    success: true,
    data: list,
    error: null,
    request_id: requestId,
  });
}

export async function POST(req: NextRequest) {
  const requestId = `req_${Date.now()}`;
  const auth = await ApiKeyService.authenticate(req, "payments:write");
  if (!auth.authenticated) {
    return NextResponse.json(
      { success: false, data: null, error: { code: "UNAUTHORIZED", message: auth.error }, request_id: requestId },
      { status: 401 }
    );
  }

  const cached = await IdempotencyService.check(req);
  if (cached) return cached;

  try {
    const body = await req.json();
    if (!body.orderId) {
      return NextResponse.json(
        { success: false, data: null, error: { code: "MISSING_ORDER_ID", message: "orderId is required" }, request_id: requestId },
        { status: 400 }
      );
    }

    const order = await db.orders.get(body.orderId);
    if (!order) {
      return NextResponse.json(
        { success: false, data: null, error: { code: "ORDER_NOT_FOUND", message: `Order '${body.orderId}' not found` }, request_id: requestId },
        { status: 404 }
      );
    }

    const providerName = body.provider || process.env.PAYMENT_PROVIDER || "mock";
    const provider = providerFactory.get(providerName);

    const providerResult = await provider.createPayment({
      orderId: order.id,
      orderNumber: order.orderNumber,
      amount: order.amount,
      currency: order.currency,
      description: order.description,
      customer: body.customer,
      method: body.method || "upi",
    });

    const paymentId = generateId("pay");
    const payment: Payment = {
      id: paymentId,
      orderId: order.id,
      provider: provider.id,
      providerPaymentId: providerResult.providerPaymentId,
      amount: order.amount,
      currency: order.currency,
      status: providerResult.status || "PENDING",
      method: body.method || "upi",
      referenceId: providerResult.qrPayload ? `REF-${order.orderNumber}` : undefined,
      providerResponse: providerResult.rawResponse,
      createdAt: new Date().toISOString(),
    };

    await db.payments.create(payment);
    await db.audit.log(auth.apiKey?.name || "api", "PAYMENT_CREATED", payment.id, {
      orderId: order.id,
      amount: order.amount,
      provider: provider.id,
    });

    const responseBody = {
      success: true,
      data: {
        payment,
        paymentUrl: providerResult.paymentUrl,
        qrPayload: providerResult.qrPayload,
        qrImageUrl: providerResult.qrImageUrl,
        upiIntentUrl: providerResult.upiIntentUrl,
      },
      error: null,
      request_id: requestId,
    };

    await IdempotencyService.store(req, 201, responseBody);
    return NextResponse.json(responseBody, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, data: null, error: { code: "INTERNAL_ERROR", message: err.message }, request_id: requestId },
      { status: 500 }
    );
  }
}
