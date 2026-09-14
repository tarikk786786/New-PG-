import { QRStudioClient } from "./qr-client";

export default function QRStudioPage() {
  const defaultVpa = process.env.UPI_VPA || "princetarikislam-4@okaxis";
  const defaultMerchantName = process.env.UPI_MERCHANT_NAME || "Tarik Islam";

  return <QRStudioClient defaultVpa={defaultVpa} defaultMerchantName={defaultMerchantName} />;
}
