import { db } from "@/lib/db";
import { LinksClient } from "./links-client";

export const revalidate = 0;

export default async function PaymentLinksPage() {
  const links = await db.paymentLinks.list();
  return <LinksClient initialLinks={links} />;
}
