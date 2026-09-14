import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { VerificationService } from "@/lib/services/verification";
import { WebhookDispatcher } from "@/lib/services/webhook-dispatcher";
import { NotificationService } from "@/lib/services/notifications";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action = "SUCCESS", orderId, amount } = body;

    if (!orderId) {
      return NextResponse.json({ success: false, error: "orderId is required" }, { status: 400 });
    }

    const order = await db.orders.get(orderId) || await db.orders.getByNumber(orderId);
    if (!order) {
      return NextResponse.json({ success: false, error: `Order '${orderId}' not found` }, { status: 404 });
    }

    if (action === "SUCCESS") {
      const verification = await VerificationService.verify({
        orderId: order.id,
        providerPaymentId: `sim_tx_${Date.now()}`,
        expectedAmountPaise: amount || order.amount,
        expectedCurrency: order.currency,
        provider: "mock",
      });

      if (!verification.verified) {
        return NextResponse.json({ success: false, error: verification.error }, { status: 400 });
      }

      await WebhookDispatcher.dispatch("payment.paid", {
        orderId: order.id,
        orderNumber: order.orderNumber,
        amount: order.amount,
        status: "PAID",
        provider: "sandbox",
      });

      await NotificationService.sendTelegramAlert({
        amountPaise: order.amount,
        orderNumber: order.orderNumber,
        status: "PAID",
        provider: "sandbox",
      });

      return NextResponse.json({
        success: true,
        message: "Simulated SUCCESS payment processed authoritatively",
        order: verification.order,
        payment: verification.payment,
      });
    }

    if (action === "FAILED") {
      const payments = await db.payments.list({ orderId: order.id });
      if (payments.length > 0) {
        await db.payments.updateStatus(payments[0].id, "FAILED", {
          failedAt: new Date().toISOString(),
        });
      }
      await db.orders.updateStatus(order.id, "CANCELLED");

      await WebhookDispatcher.dispatch("payment.failed", {
        orderId: order.id,
        status: "FAILED",
      });

      return NextResponse.json({
        success: true,
        message: "Simulated FAILED payment processed",
        orderId: order.id,
      });
    }

    return NextResponse.json({ success: false, error: `Unknown simulated action: ${action}` }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
