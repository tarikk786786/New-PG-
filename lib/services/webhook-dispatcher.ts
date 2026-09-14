import crypto from "crypto";
import { db } from "@/lib/db";
import { WebhookDelivery } from "@/lib/types";

export class WebhookDispatcher {
  /**
   * Dispatch an internal payment/order event to all registered outbound endpoints.
   */
  static async dispatch(eventType: string, data: Record<string, any>): Promise<void> {
    const endpoints = await db.webhooks.listEndpoints();
    const activeEndpoints = endpoints.filter((ep) => ep.active && (ep.events.includes("*") || ep.events.includes(eventType)));

    const eventId = `evt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const payload = {
      id: eventId,
      event: eventType,
      created: Math.floor(Date.now() / 1000),
      data,
    };

    const payloadString = JSON.stringify(payload);

    for (const endpoint of activeEndpoints) {
      // Calculate HMAC signature
      const signature = crypto
        .createHmac("sha256", endpoint.secret)
        .update(payloadString)
        .digest("hex");

      const deliveryId = `del_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const deliveryRecord: WebhookDelivery = {
        id: deliveryId,
        endpointId: endpoint.id,
        eventId,
        eventType,
        payload,
        status: "PENDING",
        attempts: 1,
        createdAt: new Date().toISOString(),
      };

      // Perform non-blocking async HTTP dispatch
      try {
        const res = await fetch(endpoint.url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-PayCore-Event": eventType,
            "X-PayCore-Signature": signature,
            "X-PayCore-Delivery": deliveryId,
          },
          body: payloadString,
          signal: AbortSignal.timeout(5000), // 5s timeout
        });

        deliveryRecord.statusCode = res.status;
        if (res.ok) {
          deliveryRecord.status = "SUCCESS";
          deliveryRecord.responseBody = "OK";
        } else {
          deliveryRecord.status = "FAILED";
          deliveryRecord.responseBody = `HTTP ${res.status}`;
          // Set retry backoff (e.g. 1m)
          deliveryRecord.nextAttemptAt = new Date(Date.now() + 60 * 1000).toISOString();
        }
      } catch (err: any) {
        deliveryRecord.status = "FAILED";
        deliveryRecord.responseBody = err.message || "Network Error / Timeout";
        deliveryRecord.nextAttemptAt = new Date(Date.now() + 60 * 1000).toISOString();
      }

      await db.webhooks.recordDelivery(deliveryRecord);
    }
  }
}
