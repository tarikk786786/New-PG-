"use client";

import { useState } from "react";
import { Settings, Check, Send, Sparkles, ShieldCheck } from "lucide-react";

interface SettingsClientProps {
  initialProvider: string;
  initialVpa: string;
  initialMerchantName: string;
  initialRazorpayKeyId: string;
  initialTelegramBotToken: string;
  initialTelegramChatId: string;
}

export function SettingsClient({
  initialProvider,
  initialVpa,
  initialMerchantName,
  initialRazorpayKeyId,
  initialTelegramBotToken,
  initialTelegramChatId,
}: SettingsClientProps) {
  const [provider, setProvider] = useState(initialProvider);
  const [vpa, setVpa] = useState(initialVpa);
  const [merchantName, setMerchantName] = useState(initialMerchantName);
  const [razorpayKeyId, setRazorpayKeyId] = useState(initialRazorpayKeyId);
  const [telegramToken, setTelegramToken] = useState(initialTelegramBotToken);
  const [telegramChatId, setTelegramChatId] = useState(initialTelegramChatId);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">Gateway Settings</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Configure active PSP adapters, merchant UPI information, and alerts.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Provider Routing Selection */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <div>
            <h2 className="text-sm font-bold text-white">Active Payment Routing Provider</h2>
            <p className="text-xs text-slate-400">
              Select which backend engine processes payment requests and dynamic QRs.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {[
              { id: "mock", name: "Sandbox / Mock Simulator", desc: "For zero-cost testing with simulated webhooks" },
              { id: "upi", name: "Direct UPI Intent & Dynamic QR", desc: "NPCI intent URI & instant dynamic QR code" },
              { id: "razorpay", name: "Razorpay (UPI / Links / Cards)", desc: "Production settlement with HMAC-SHA256 webhooks" },
              { id: "payhip", name: "Payhip Webhook Adapter", desc: "Inbound digital product webhooks" },
            ].map((item) => (
              <div
                key={item.id}
                onClick={() => setProvider(item.id)}
                className={`p-4 rounded-2xl border cursor-pointer transition ${
                  provider === item.id
                    ? "bg-blue-600/10 border-blue-500 shadow-md shadow-blue-500/10"
                    : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white">{item.name}</span>
                  {provider === item.id && (
                    <span className="h-4 w-4 rounded-full bg-blue-600 text-white flex items-center justify-center">
                      <Check className="w-2.5 h-2.5" />
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* UPI Merchant Details */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4 text-xs">
          <div>
            <h2 className="text-sm font-bold text-white">UPI Merchant Configuration</h2>
            <p className="text-xs text-slate-400">
              Configured bank VPA for Direct UPI and QR generation.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Merchant UPI VPA</label>
              <input
                type="text"
                value={vpa}
                onChange={(e) => setVpa(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Merchant Display Name</label>
              <input
                type="text"
                value={merchantName}
                onChange={(e) => setMerchantName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Telegram Bot Alerts */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4 text-xs">
          <div>
            <h2 className="text-sm font-bold text-white">Telegram Instant Alerts</h2>
            <p className="text-xs text-slate-400">
              Receive real-time push notifications on your phone whenever a payment succeeds.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Telegram Bot Token</label>
              <input
                type="password"
                placeholder="123456789:ABCdefGhI..."
                value={telegramToken}
                onChange={(e) => setTelegramToken(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Admin Chat ID</label>
              <input
                type="text"
                placeholder="e.g. 987654321"
                value={telegramChatId}
                onChange={(e) => setTelegramChatId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl transition text-xs shadow-lg shadow-blue-500/20 flex items-center gap-2"
        >
          {saved ? <Check className="w-4 h-4 text-emerald-300" /> : null}
          <span>{saved ? "Settings Saved" : "Save Gateway Settings"}</span>
        </button>
      </form>
    </div>
  );
}
