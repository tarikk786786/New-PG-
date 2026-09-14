import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PayCore — Personal Universal Payment Gateway",
  description: "Next-gen personal payment orchestration platform with UPI, Razorpay, webhooks, and live checkout.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#090d16] text-slate-100 selection:bg-blue-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}
