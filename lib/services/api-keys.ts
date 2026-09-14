import { db } from "@/lib/db";
import { ApiKey } from "@/lib/types";

export interface AuthResult {
  authenticated: boolean;
  apiKey?: ApiKey;
  mode: "live" | "test";
  error?: string;
}

export class ApiKeyService {
  /**
   * Validate incoming Authorization header (Bearer sk_...) or query parameter
   */
  static async authenticate(req: Request, requiredPermission?: string): Promise<AuthResult> {
    const authHeader = req.headers.get("Authorization");
    let token = "";

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7).trim();
    } else {
      const url = new URL(req.url);
      token = url.searchParams.get("api_key") || "";
    }

    if (!token) {
      return { authenticated: false, mode: "live", error: "Missing API Key. Provide Authorization: Bearer <key>" };
    }

    // Master Key check from env
    const masterKey = process.env.PAYCORE_SECRET_KEY || "sk_live_paycore_master_default_key";
    if (token === masterKey) {
      return {
        authenticated: true,
        mode: "live",
        apiKey: {
          id: "master_env",
          name: "Master Environment Key",
          keyPrefix: "sk_live",
          keyHash: masterKey,
          type: "live",
          permissions: ["*"],
          revoked: false,
          createdAt: new Date().toISOString(),
        },
      };
    }

    const apiKey = await db.apiKeys.getByKey(token);
    if (!apiKey) {
      return { authenticated: false, mode: "live", error: "Invalid or revoked API Key" };
    }

    // Check permissions
    if (requiredPermission && !apiKey.permissions.includes("*") && !apiKey.permissions.includes(requiredPermission)) {
      // Check for wildcard category (e.g. orders:* matches orders:read)
      const category = requiredPermission.split(":")[0];
      const hasWildcardCategory = apiKey.permissions.includes(`${category}:*`);
      if (!hasWildcardCategory) {
        return {
          authenticated: false,
          mode: apiKey.type,
          error: `API Key lacks required permission: '${requiredPermission}'`,
        };
      }
    }

    return {
      authenticated: true,
      mode: apiKey.type,
      apiKey,
    };
  }

  static generateKey(type: "live" | "test", name: string, permissions: string[]): { key: string; apiKey: ApiKey } {
    const prefix = type === "live" ? "sk_live_" : "sk_test_";
    const rand = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const key = `${prefix}${rand}`;

    const apiKey: ApiKey = {
      id: `key_${Date.now()}`,
      name,
      keyPrefix: prefix,
      keyHash: key,
      type,
      permissions,
      revoked: false,
      createdAt: new Date().toISOString(),
    };

    return { key, apiKey };
  }
}
