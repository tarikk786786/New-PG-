import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ApiKeyService } from "@/lib/services/api-keys";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const requestId = `req_${Date.now()}`;
  const auth = await ApiKeyService.authenticate(req, "orders:read");
  if (!auth.authenticated) {
    return NextResponse.json(
      { success: false, data: null, error: { code: "UNAUTHORIZED", message: auth.error }, request_id: requestId },
      { status: 401 }
    );
  }

  const { id } = await params;
  const order = (await db.orders.get(id)) || (await db.orders.getByNumber(id));
  if (!order) {
    return NextResponse.json(
      { success: false, data: null, error: { code: "ORDER_NOT_FOUND", message: `Order '${id}' not found` }, request_id: requestId },
      { status: 404 }
    );
  }

  // Also include associated payments
  const payments = await db.payments.list({ orderId: order.id });

  return NextResponse.json({
    success: true,
    data: { ...order, payments },
    error: null,
    request_id: requestId,
  });
}
