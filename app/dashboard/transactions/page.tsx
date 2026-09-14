import { db } from "@/lib/db";
import { TransactionsClient } from "./transactions-client";

export const revalidate = 0;

export default async function TransactionsPage() {
  const payments = await db.payments.list();
  const orders = await db.orders.list();

  // Attach order metadata to payments
  const enriched = payments.map((p) => {
    const order = orders.find((o) => o.id === p.orderId);
    return {
      ...p,
      orderNumber: order?.orderNumber || "UNKNOWN",
      orderDescription: order?.description,
    };
  });

  return <TransactionsClient initialPayments={enriched} />;
}
