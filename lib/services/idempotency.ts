import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export class IdempotencyService {
  /**
   * Check if a request has an Idempotency-Key header and if a cached response already exists.
   */
  static async check(req: Request): Promise<NextResponse | null> {
    const key = req.headers.get("Idempotency-Key") || req.headers.get("x-idempotency-key");
    if (!key) return null;

    const cached = await db.idempotency.get(key);
    if (cached) {
      return NextResponse.json(cached.body, {
        status: cached.status,
        headers: {
          "X-Cache-Lookup": "HIT",
          "Idempotency-Key": key,
        },
      });
    }

    return null;
  }

  /**
   * Store response against idempotency key
   */
  static async store(req: Request, status: number, body: any): Promise<void> {
    const key = req.headers.get("Idempotency-Key") || req.headers.get("x-idempotency-key");
    if (!key) return;

    await db.idempotency.set(key, status, body);
  }
}
