import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { providerFactory } from "@/lib/providers";
import { CheckoutClient } from "./checkout-client";
import { generateId, generateOrderNumber } from "@/lib/utils";

export default async function PayPage({
  params,
  searchParams,
}: {
  params: Promise<{ code: string }>;
  searchParams?: Promise<{ amount?: string; title?: string; desc?: string }>;
}) {
  const { code } = await params;
  const query = searchParams ? await searchParams : {};

  let title = query.title || "Secure Payment";
  let amount = query.amount ? Math.round(parseFloat(query.amount) * 100) : 49900; // default 499.00
  let currency = "INR";
  let description = query.desc || "Order payment";
  let orderId = "";
  let orderNumber = "";
  let qrImageUrl = "";
  let upiIntentUrl = "";
  let referenceId = "";

  // 1. Check if code matches a Payment Link
  const link = await db.paymentLinks.getByCode(code);
  if (link) {
    if (!link.active) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="glass-panel p-8 rounded-2xl max-w-md w-full text-center border border-red-500/20">
            <h1 className="text-xl font-bold text-red-400">Payment Link Inactive</h1>
            <p className="text-slate-400 mt-2 text-sm">This payment link has expired or has been deactivated by the merchant.</p>
          </div>
        </div>
      );
    }

    title = link.title;
    amount = link.amount;
    currency = link.currency;
    description = link.description || `Payment for ${link.title}`;

    // Create a dynamic order for this checkout session
    orderId = generateId("ord");
    orderNumber = generateOrderNumber();
    await db.orders.create({
      id: orderId,
      orderNumber,
      amount,
      currency,
      status: "PENDING",
      description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  } else {
    // 2. Check if code is an existing Order ID or Order Number
    const existingOrder = (await db.orders.get(code)) || (await db.orders.getByNumber(code));
    if (existingOrder) {
      orderId = existingOrder.id;
      orderNumber = existingOrder.orderNumber;
      amount = existingOrder.amount;
      currency = existingOrder.currency;
      description = existingOrder.description || `Order ${existingOrder.orderNumber}`;
    } else {
      // Default fallback demo link if arbitrary code used
      orderId = generateId("ord");
      orderNumber = generateOrderNumber();
      await db.orders.create({
        id: orderId,
        orderNumber,
        amount,
        currency,
        status: "PENDING",
        description: `Payment for request ${code}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  }

  // Generate dynamic QR and UPI intent for this specific order
  const activeProvider = providerFactory.get();
  const qrResult = await activeProvider.createDynamicQR({
    orderId,
    orderNumber,
    amount,
    currency,
    description,
    expiresInMinutes: 15,
  });

  qrImageUrl = qrResult.qrImageUrl;
  upiIntentUrl = qrResult.qrPayload;
  referenceId = qrResult.referenceId;

  // Record payment attempt
  const paymentId = generateId("pay");
  await db.payments.create({
    id: paymentId,
    orderId,
    provider: activeProvider.id,
    providerPaymentId: referenceId,
    amount,
    currency,
    status: "PENDING",
    method: "upi",
    referenceId,
    createdAt: new Date().toISOString(),
  });

  const vpa = process.env.UPI_VPA || "princetarikislam-4@okaxis";

  return (
    <CheckoutClient
      orderId={orderId}
      orderNumber={orderNumber}
      title={title}
      description={description}
      amount={amount}
      currency={currency}
      qrImageUrl={qrImageUrl}
      upiIntentUrl={upiIntentUrl}
      referenceId={referenceId}
      providerName={activeProvider.name}
      providerId={activeProvider.id}
      vpa={vpa}
    />
  );
}
