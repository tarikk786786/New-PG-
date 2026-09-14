import { QRStudioClient } from "./qr-client";

export default function QRStudioPage() {
  const defaultVpa = process.env.UPI_VPA || "paycore@upi";
  const defaultMerchantName = process.env.UPI_MERCHANT_NAME || "PayCore Merchant";

  return <QRStudioClient defaultVpa={defaultVpa} defaultMerchantName={defaultMerchantName} />;
}
