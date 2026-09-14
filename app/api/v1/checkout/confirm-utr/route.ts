import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { stateMachine } from "@/lib/services/state-machine";

export async function POST(req: NextRequest) {
  try {
    const { orderId, utrNumber } = await req.json();

    if (!orderId || !utrNumber) {
      return NextResponse.json(
        { success: false, error: "Order ID and 12-digit UPI UTR / Reference number are required" },
        { status: 400 }
      );
    }

    const cleanUtr = String(utrNumber).trim().replace(/[^0-9]/g, "");
    if (cleanUtr.length < 6 || cleanUtr.length > 20) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid UPI Reference / UTR Number (usually 12 digits)" },
        { status: 400 }
      );
    }

    // Check order
    const order = await db.orders.get(orderId);
    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    // Transition state safely
    if (stateMachine.canTransition(order.status, "PAID")) {
      await db.orders.updateStatus(order.id, "PAID");
    }

    // Record or update payment record with this UTR
    const payments = await db.payments.list({ orderId });
    if (payments.length > 0) {
      const p = payments[0];
      p.status = "PAID";
      p.providerPaymentId = cleanUtr;
      p.updatedAt = new Date().toISOString();
    } else {
      await db.payments.create({
        id: `pay_${Date.now()}`,
        orderId: order.id,
        provider: "upi",
        providerPaymentId: cleanUtr,
        amount: order.amount,
        currency: order.currency,
        status: "PAID",
        method: "upi",
        referenceId: cleanUtr,
        createdAt: new Date().toISOString(),
      });
    }

    await db.audit.log("payer", "UPI_UTR_CONFIRMED", order.id, {
      utr: cleanUtr,
      orderNumber: order.orderNumber,
      amount: order.amount,
    });

    return NextResponse.json({
      success: true,
      data: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        status: "PAID",
        utr: cleanUtr,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to confirm UTR" },
      { status: 500 }
    );
  }
}
