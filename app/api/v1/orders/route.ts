import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ApiKeyService } from "@/lib/services/api-keys";
import { IdempotencyService } from "@/lib/services/idempotency";
import { generateId, generateOrderNumber } from "@/lib/utils";
import { Order } from "@/lib/types";

export async function GET(req: NextRequest) {
  const requestId = `req_${Date.now()}`;
  const auth = await ApiKeyService.authenticate(req, "orders:read");
  if (!auth.authenticated) {
    return NextResponse.json(
      { success: false, data: null, error: { code: "UNAUTHORIZED", message: auth.error }, request_id: requestId },
      { status: 401 }
    );
  }

  const list = await db.orders.list();
  return NextResponse.json({
    success: true,
    data: list,
    error: null,
    request_id: requestId,
  });
}

export async function POST(req: NextRequest) {
  const requestId = `req_${Date.now()}`;
  const auth = await ApiKeyService.authenticate(req, "orders:write");
  if (!auth.authenticated) {
    return NextResponse.json(
      { success: false, data: null, error: { code: "UNAUTHORIZED", message: auth.error }, request_id: requestId },
      { status: 401 }
    );
  }

  // Idempotency check
  const cachedResponse = await IdempotencyService.check(req);
  if (cachedResponse) return cachedResponse;

  try {
    const body = await req.json();
    if (!body.amount || typeof body.amount !== "number" || body.amount <= 0) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: { code: "INVALID_AMOUNT", message: "Amount must be a positive integer in paise (e.g. 49900 for ₹499.00)" },
          request_id: requestId,
        },
        { status: 400 }
      );
    }

    const orderId = generateId("ord");
    const orderNumber = body.orderNumber || generateOrderNumber();

    const order: Order = {
      id: orderId,
      orderNumber,
      customerId: body.customerId,
      amount: Math.round(body.amount),
      currency: (body.currency || "INR").toUpperCase(),
      status: "PENDING",
      description: body.description || "",
      metadata: body.metadata || {},
      checkoutSessionId: body.checkoutSessionId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      expiresAt: body.expiresInMinutes
        ? new Date(Date.now() + body.expiresInMinutes * 60 * 1000).toISOString()
        : undefined,
    };

    await db.orders.create(order);
    await db.audit.log(auth.apiKey?.name || "api", "ORDER_CREATED", order.id, {
      amount: order.amount,
      orderNumber,
    });

    const responseBody = {
      success: true,
      data: order,
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
