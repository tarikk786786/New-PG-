import { formatPaise } from "@/lib/utils";

export class NotificationService {
  /**
   * Send payment notification to Telegram Admin Bot if configured
   */
  static async sendTelegramAlert(payment: {
    amountPaise: number;
    orderNumber: string;
    customerEmail?: string;
    method?: string;
    status: string;
    provider: string;
  }): Promise<void> {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_ADMIN_CHAT_ID;

    if (!token || !chatId) return;

    const text = `💰 <b>PAYMENT RECEIVED</b>\n\n` +
      `<b>Amount:</b> ${formatPaise(payment.amountPaise)}\n` +
      `<b>Order:</b> ${payment.orderNumber}\n` +
      `<b>Customer:</b> ${payment.customerEmail || "N/A"}\n` +
      `<b>Method:</b> ${payment.method?.toUpperCase() || "UPI"}\n` +
      `<b>Provider:</b> ${payment.provider}\n` +
      `<b>Status:</b> ${payment.status} ✅\n` +
      `<b>Timestamp:</b> ${new Date().toLocaleString("en-IN")}`;

    try {
      await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: "HTML",
        }),
      });
    } catch (err) {
      console.error("Telegram notification failed:", err);
    }
  }
}
