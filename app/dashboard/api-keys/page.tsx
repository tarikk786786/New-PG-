import { db } from "@/lib/db";
import { ApiKeysClient } from "./api-keys-client";

export const revalidate = 0;

export default async function ApiKeysPage() {
  const keys = await db.apiKeys.list();
  return <ApiKeysClient initialKeys={keys} />;
}
