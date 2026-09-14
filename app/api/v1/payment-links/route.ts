import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ApiKeyService } from "@/lib/services/api-keys";
import { generateId } from "@/lib/utils";
import { PaymentLink } from "@/lib/types";

export async function GET(req: NextRequest) {
  const requestId = `req_${Date.now()}`;
  const auth = await ApiKeyService.authenticate(req, "payments:read");
  if (!auth.authenticated) {
    return NextResponse.json(
      { success: false, data: null, error: { code: "UNAUTHORIZED", message: auth.error }, request_id: requestId },
      { status: 401 }
    );
  }

  const list = await db.paymentLinks.list();
  return NextResponse.json({
    success: true,
    data: list,
    error: null,
    request_id: requestId,
  });
}

export async function POST(req: NextRequest) {
  const requestId = `req_${Date.now()}`;
  const auth = await ApiKeyService.authenticate(req, "payments:write");
  if (!auth.authenticated) {
    return NextResponse.json(
      { success: false, data: null, error: { code: "UNAUTHORIZED", message: auth.error }, request_id: requestId },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    if (!body.title || !body.amount) {
      return NextResponse.json(
        { success: false, data: null, error: { code: "BAD_REQUEST", message: "title and amount (in paise) are required" }, request_id: requestId },
        { status: 400 }
      );
    }

    const code = body.code || Math.random().toString(36).substring(2, 8);
    const link: PaymentLink = {
      id: generateId("plink"),
      code,
      title: body.title,
      amount: Math.round(body.amount),
      currency: (body.currency || "INR").toUpperCase(),
      description: body.description || "",
      active: body.active ?? true,
      maxPayments: body.maxPayments,
      paymentCount: 0,
      redirectUrl: body.redirectUrl,
      successMessage: body.successMessage,
      collectEmail: body.collectEmail ?? true,
      collectPhone: body.collectPhone ?? false,
      collectAddress: body.collectAddress ?? false,
      expiresAt: body.expiresInMinutes
        ? new Date(Date.now() + body.expiresInMinutes * 60 * 1000).toISOString()
        : undefined,
      createdAt: new Date().toISOString(),
    };

    await db.paymentLinks.create(link);
    await db.audit.log(auth.apiKey?.name || "api", "PAYMENT_LINK_CREATED", link.id, {
      code: link.code,
      amount: link.amount,
    });

    const proto = req.headers.get("x-forwarded-proto") || "https";
    const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "pay.tarikislam.in";
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `${proto}://${host}`;

    return NextResponse.json(
      {
        success: true,
        data: {
          ...link,
          url: `${baseUrl}/pay/${link.code}`,
        },
        error: null,
        request_id: requestId,
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, data: null, error: { code: "INTERNAL_ERROR", message: err.message }, request_id: requestId },
      { status: 500 }
    );
  }
}
