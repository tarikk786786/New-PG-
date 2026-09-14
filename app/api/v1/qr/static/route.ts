import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";
import { ApiKeyService } from "@/lib/services/api-keys";

export async function POST(req: NextRequest) {
  const requestId = `req_${Date.now()}`;
  const auth = await ApiKeyService.authenticate(req, "payments:read");
  if (!auth.authenticated) {
    return NextResponse.json(
      { success: false, data: null, error: { code: "UNAUTHORIZED", message: auth.error }, request_id: requestId },
      { status: 401 }
    );
  }

  try {
    const body = await req.json().catch(() => ({}));
    const vpa = body.vpa || process.env.UPI_VPA || "princetarikislam-4@okaxis";
    const name = encodeURIComponent(body.merchantName || process.env.UPI_MERCHANT_NAME || "Tarik Islam");
    const note = encodeURIComponent(body.note || "PayCore Merchant Payment");

    // Static QR contains no fixed amount, user enters amount at scan time
    const upiUri = `upi://pay?pa=${vpa}&pn=${name}&tn=${note}&cu=INR`;

    const qrImageUrl = await QRCode.toDataURL(upiUri, {
      errorCorrectionLevel: "H",
      margin: 2,
      width: 360,
      color: {
        dark: body.darkColor || "#0f172a",
        light: body.lightColor || "#ffffff",
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        type: "STATIC",
        vpa,
        merchantName: decodeURIComponent(name),
        upiUri,
        qrImageUrl,
        note: decodeURIComponent(note),
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
