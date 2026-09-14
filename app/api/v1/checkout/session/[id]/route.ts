import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // id can be an orderId, paymentId, or paymentLink code
  let order = await db.orders.get(id);
  if (!order) {
    order = await db.orders.getByNumber(id);
  }

  let payment = null;
  if (order) {
    const list = await db.payments.list({ orderId: order.id });
    if (list.length > 0) payment = list[0];
  } else {
    // Check if id is a payment ID
    payment = await db.payments.get(id);
    if (payment) {
      order = await db.orders.get(payment.orderId);
    }
  }

  if (!order) {
    return NextResponse.json(
      { success: false, data: null, error: { code: "NOT_FOUND", message: "Session or order not found" } },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    data: {
      orderId: order.id,
      orderNumber: order.orderNumber,
      amount: order.amount,
      currency: order.currency,
      status: payment?.status || order.status,
      isPaid: (payment?.status === "PAID" || order.status === "PAID"),
      paymentId: payment?.id,
      paidAt: payment?.paidAt,
    },
  });
}
