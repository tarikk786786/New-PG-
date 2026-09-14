import { SettingsClient } from "./settings-client";

export default function SettingsPage() {
  const currentProvider = process.env.PAYMENT_PROVIDER || "mock";
  const currentVpa = process.env.UPI_VPA || "paycore@upi";
  const currentMerchantName = process.env.UPI_MERCHANT_NAME || "PayCore Merchant";
  const razorpayKeyId = process.env.RAZORPAY_KEY_ID || "";
  const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN || "";
  const telegramChatId = process.env.TELEGRAM_ADMIN_CHAT_ID || "";

  return (
    <SettingsClient
      initialProvider={currentProvider}
      initialVpa={currentVpa}
      initialMerchantName={currentMerchantName}
      initialRazorpayKeyId={razorpayKeyId}
      initialTelegramBotToken={telegramBotToken}
      initialTelegramChatId={telegramChatId}
    />
  );
}
