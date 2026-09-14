import { db } from "@/lib/db";
import { SimulatorClient } from "./simulator-client";

export const revalidate = 0;

export default async function SimulatorPage() {
  const orders = await db.orders.list();
  return <SimulatorClient initialOrders={orders} />;
}
