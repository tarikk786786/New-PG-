import { db } from "@/lib/db";
import { WebhooksClient } from "./webhooks-client";

export const revalidate = 0;

export default async function WebhooksPage() {
  const events = await db.webhooks.listEvents();
  const endpoints = await db.webhooks.listEndpoints();
  const deliveries = await db.webhooks.listDeliveries();

  return (
    <WebhooksClient
      initialEvents={events}
      initialEndpoints={endpoints}
      initialDeliveries={deliveries}
    />
  );
}
