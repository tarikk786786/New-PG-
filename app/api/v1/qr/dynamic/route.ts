import { NextRequest, NextResponse } from "next/server";
import { providerFactory } from "@/lib/providers";
import { ApiKeyService } from "@/lib/services/api-keys";
import { db } from "@/lib/db";
import { generateId } from "@/lib/utils";

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
    if (!body.amount || typeof body.amount !== "number") {
      return NextResponse.json(
        { success: false, data: null, error: { code: "BAD_REQUEST", message: "amount is required in paise" }, request_id: requestId },
        { status: 400 }
      );
    }

    const orderId = body.orderId || generateId("ord");
    const orderNumber = body.orderNumber || `ORD-${Math.floor(100000 + Math.random() * 900000)}`;

    const providerName = body.provider || "upi";
    const provider = providerFactory.get(providerName);

    const qrResult = await provider.createDynamicQR({
      orderId,
      orderNumber,
      amount: Math.round(body.amount),
      currency: (body.currency || "INR").toUpperCase(),
      description: body.description,
      expiresInMinutes: body.expiresInMinutes || 15,
    });

    // Save QR record in DB
    await db.qrCodes.create({
      id: qrResult.qrId,
      orderId,
      referenceId: qrResult.referenceId,
      amount: body.amount,
      currency: body.currency || "INR",
      qrPayload: qrResult.qrPayload,
      expiresAt: qrResult.expiresAt,
      status: "ACTIVE",
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      data: {
        qrId: qrResult.qrId,
        referenceId: qrResult.referenceId,
        amount: body.amount,
        currency: body.currency || "INR",
        qrPayload: qrResult.qrPayload,
        qrImageUrl: qrResult.qrImageUrl,
        expiresAt: qrResult.expiresAt,
      },
      error: null,
      request_id: requestId,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, data: null, error: { code: "INTERNAL_ERROR", message: err.message }, request_id: requestId },
      { status: 500 }
    );
  }
}
