import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { providerFactory } from "@/lib/providers";
import { VerificationService } from "@/lib/services/verification";
import { WebhookDispatcher } from "@/lib/services/webhook-dispatcher";
import { NotificationService } from "@/lib/services/notifications";

export async function POST(req: NextRequest, { params }: { params: Promise<{ provider: string }> }) {
  const { provider: providerName } = await params;
  const rawBody = await req.text();

  // Extract signature headers
  const signature =
    req.headers.get("x-razorpay-signature") ||
    req.headers.get("x-payhip-signature") ||
    req.headers.get("x-signature") ||
    "";

  const provider = providerFactory.get(providerName);

  // 1. Verify Webhook Signature with Raw Body
  const isValidSignature = await provider.verifyWebhookSignature(rawBody, signature);
  if (!isValidSignature) {
    await db.audit.log("webhook", "INVALID_SIGNATURE", providerName, { signature });
    return NextResponse.json(
      { success: false, error: "Invalid webhook signature" },
      { status: 400 }
    );
  }

  // 2. Parse Event
  const event = await provider.parseWebhookEvent(rawBody);

  // 3. Record Webhook Audit
  const eventRecord = await db.webhooks.recordEvent({
    id: event.eventId || `wh_${Date.now()}`,
    provider: providerName,
    eventId: event.eventId,
    eventType: event.eventType,
    payload: event.raw,
    signature,
    verified: true,
    processed: false,
    createdAt: new Date().toISOString(),
  });

  // 4. Update Payment and Order if applicable
  if (event.status === "PAID" && event.orderId) {
    const order = await db.orders.get(event.orderId) || await db.orders.getByNumber(event.orderId);
    if (order) {
      await VerificationService.verify({
        orderId: order.id,
        providerPaymentId: event.providerPaymentId || `wh_tx_${Date.now()}`,
        expectedAmountPaise: event.amount || order.amount,
        expectedCurrency: event.currency || order.currency,
        provider: providerName,
      });

      // Outbound dispatch to customer endpoints
      await WebhookDispatcher.dispatch("payment.paid", {
        orderId: order.id,
        orderNumber: order.orderNumber,
        amount: order.amount,
        currency: order.currency,
        provider: providerName,
      });

      // Telegram alert
      await NotificationService.sendTelegramAlert({
        amountPaise: order.amount,
        orderNumber: order.orderNumber,
        status: "PAID",
        provider: providerName,
      });
    }
  }

  return NextResponse.json({
    success: true,
    message: "Webhook received and verified successfully",
    event_id: eventRecord.id,
  });
}
