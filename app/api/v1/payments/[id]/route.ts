import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ApiKeyService } from "@/lib/services/api-keys";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const requestId = `req_${Date.now()}`;
  const auth = await ApiKeyService.authenticate(req, "payments:read");
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

  const order = await db.orders.get(payment.orderId);

  return NextResponse.json({
    success: true,
    data: { ...payment, order },
    error: null,
    request_id: requestId,
  });
}
