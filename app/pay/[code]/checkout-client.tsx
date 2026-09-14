"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { formatPaise } from "@/lib/utils";
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  Smartphone,
  QrCode,
  Copy,
  Check,
  Sparkles,
  ArrowRight,
  RefreshCw,
  ExternalLink,
  Download,
  Key,
  FileText,
  Zap,
} from "lucide-react";

interface CheckoutClientProps {
  orderId: string;
  orderNumber: string;
  title: string;
  description: string;
  amount: number;
  currency: string;
  qrImageUrl: string;
  upiIntentUrl: string;
  referenceId: string;
  providerName: string;
  providerId: string;
  vpa?: string;
  productType?: "standard" | "digital";
  downloadUrl?: string;
  licenseKey?: string;
  deliveryInstructions?: string;
}

export function CheckoutClient({
  orderId,
  orderNumber,
  title,
  description,
  amount,
  currency,
  qrImageUrl,
  upiIntentUrl,
  referenceId,
  providerName,
  providerId,
  vpa = "princetarikislam-4@okaxis",
  productType = "standard",
  downloadUrl,
  licenseKey,
  deliveryInstructions,
}: CheckoutClientProps) {
  const [secondsRemaining, setSecondsRemaining] = useState(15 * 60);
  const [copied, setCopied] = useState(false);
  const [copiedVpa, setCopiedVpa] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [status, setStatus] = useState<"PENDING" | "PAID" | "FAILED">("PENDING");
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationMessage, setSimulationMessage] = useState("");
  const [utrInput, setUtrInput] = useState("");
  const [isSubmittingUtr, setIsSubmittingUtr] = useState(false);
  const [utrMessage, setUtrMessage] = useState("");

  // Countdown timer
  useEffect(() => {
    if (status === "PAID") return;
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [status]);

  // Real-time authoritative polling for payment status
  useEffect(() => {
    if (status === "PAID") return;

    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch(`/api/v1/checkout/session/${orderId}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data?.isPaid) {
            setStatus("PAID");
          }
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 2500);

    return () => clearInterval(pollInterval);
  }, [orderId, status]);

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const timerDisplay = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

  const copyUpiPayload = () => {
    navigator.clipboard.writeText(upiIntentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyVpa = () => {
    navigator.clipboard.writeText(vpa);
    setCopiedVpa(true);
    setTimeout(() => setCopiedVpa(false), 2000);
  };

  const copyLicenseKey = () => {
    if (!licenseKey) return;
    navigator.clipboard.writeText(licenseKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleConfirmUtr = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!utrInput.trim()) return;

    setIsSubmittingUtr(true);
    setUtrMessage("");
    try {
      const res = await fetch("/api/v1/checkout/confirm-utr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          utrNumber: utrInput.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setUtrMessage("Payment confirmed! Loading receipt...");
        setStatus("PAID");
      } else {
        setUtrMessage(data.error || "Failed to confirm UTR");
      }
    } catch (err: any) {
      setUtrMessage(err.message || "Network error. Please try again.");
    } finally {
      setIsSubmittingUtr(false);
    }
  };

  // Immediate simulation trigger for sandbox testing
  const handleSimulatePayment = async () => {
    setIsSimulating(true);
    setSimulationMessage("Simulating authorized bank confirmation...");
    try {
      const res = await fetch("/api/test/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "SUCCESS",
          orderId,
          amount,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSimulationMessage("Authoritative webhook received! Payment marked PAID.");
        setStatus("PAID");
      } else {
        setSimulationMessage(data.error || "Simulation failed");
      }
    } catch (err: any) {
      setSimulationMessage(err.message || "Failed to trigger simulator");
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] flex flex-col justify-between items-center p-4 sm:p-6 lg:p-8">
      {/* Top Brand Bar */}
      <header className="w-full max-w-lg flex items-center justify-between pb-4">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">
            P
          </div>
          <div>
            <div className="font-semibold text-sm tracking-tight text-white">PayCore</div>
            <div className="text-[11px] text-slate-400">Personal Payment Gateway</div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-500/20 px-3 py-1 rounded-full">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>256-bit Encrypted</span>
        </div>
      </header>

      {/* Main Checkout Card */}
      <main className="w-full max-w-lg">
        {status === "PAID" ? (
          <div className="glass-panel p-8 rounded-3xl border border-emerald-500/30 text-center animate-in fade-in zoom-in-95 duration-500 glow-emerald">
            <div className="mx-auto w-20 h-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500/40 flex items-center justify-center text-emerald-400 mb-6">
              <CheckCircle2 className="w-12 h-12 stroke-[2.2]" />
            </div>

            <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1 rounded-full mb-3">
              Authoritatively Verified
            </div>

            <h1 className="text-2xl font-bold text-white tracking-tight">Payment Successful!</h1>
            <p className="text-slate-400 text-sm mt-1 mb-6">Your transaction has settled and the order is marked as PAID.</p>

            <div className="bg-slate-900/80 rounded-2xl p-4 text-left border border-slate-800 mb-6 space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Order Reference</span>
                <span className="font-mono font-medium text-white">{orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Amount Paid</span>
                <span className="font-semibold text-emerald-400 text-sm">{formatPaise(amount, currency)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Payment Engine</span>
                <span className="text-slate-300 font-mono">{providerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Timestamp</span>
                <span className="text-slate-300">{new Date().toLocaleTimeString()}</span>
              </div>
            </div>

            {/* Instant Digital Product Delivery Section */}
            {productType === "digital" && (downloadUrl || licenseKey || deliveryInstructions) && (
              <div className="bg-gradient-to-br from-indigo-950/70 to-blue-950/70 border border-indigo-500/30 rounded-2xl p-5 mb-6 text-left shadow-lg">
                <div className="flex items-center gap-2 text-indigo-300 font-semibold text-sm mb-3">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>Your Digital Content is Unlocked!</span>
                </div>

                {downloadUrl && (
                  <a
                    href={downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    className="w-full mb-3 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold py-3 px-4 rounded-xl transition shadow-lg shadow-emerald-600/20 text-sm"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Digital Files Now</span>
                  </a>
                )}

                {licenseKey && (
                  <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-700/80 mb-3">
                    <div className="text-[11px] text-slate-400 mb-1 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Key className="w-3.5 h-3.5 text-amber-400" /> License / Serial Key
                      </span>
                      <button
                        onClick={copyLicenseKey}
                        className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1"
                      >
                        {copiedKey ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedKey ? "Copied" : "Copy Key"}</span>
                      </button>
                    </div>
                    <div className="font-mono text-sm text-emerald-300 select-all font-semibold tracking-wide">
                      {licenseKey}
                    </div>
                  </div>
                )}

                {deliveryInstructions && (
                  <div className="text-xs text-slate-300 bg-slate-900/50 rounded-xl p-3 border border-slate-800">
                    <div className="text-[11px] text-slate-400 font-medium mb-1 flex items-center gap-1">
                      <FileText className="w-3 h-3 text-slate-400" /> Delivery Instructions:
                    </div>
                    <p className="text-slate-300 text-xs leading-relaxed">{deliveryInstructions}</p>
                  </div>
                )}
              </div>
            )}

            <a
              href="/dashboard"
              className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium py-3 px-6 rounded-xl transition shadow-lg shadow-blue-500/25 text-sm"
            >
              <span>Go to Admin Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        ) : (
          <div className="glass-panel rounded-3xl border border-slate-800 shadow-2xl overflow-hidden glow-blue">
            {/* Header / Product summary */}
            <div className="p-6 border-b border-slate-800/80 bg-slate-900/40">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-blue-400 bg-blue-950/60 border border-blue-500/20 px-2 py-0.5 rounded">
                      {orderNumber}
                    </span>
                    {productType === "digital" && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-indigo-300 bg-indigo-950/80 border border-indigo-500/30 px-2 py-0.5 rounded-full">
                        <Zap className="w-3 h-3 text-amber-400" />
                        <span>Digital Delivery</span>
                      </span>
                    )}
                  </div>
                  <h2 className="text-lg font-bold text-white mt-1.5">{title}</h2>
                  <p className="text-xs text-slate-400 line-clamp-1">{description}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-extrabold text-white tracking-tight">
                    {formatPaise(amount, currency)}
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center justify-end gap-1 mt-0.5">
                    <Clock className="w-3 h-3 text-amber-400" />
                    <span className="font-mono text-amber-300">{timerDisplay}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Dynamic QR & Payment Area */}
            <div className="p-6 text-center">
              <div className="relative inline-block p-3 bg-white rounded-2xl shadow-xl border border-slate-200">
                {qrImageUrl ? (
                  <img
                    src={qrImageUrl}
                    alt="Scan UPI QR"
                    width={220}
                    height={220}
                    className="rounded-lg mx-auto"
                  />
                ) : (
                  <div className="w-[220px] h-[220px] flex items-center justify-center bg-slate-100 rounded-lg text-slate-400 text-xs">
                    Generating dynamic QR...
                  </div>
                )}
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2.5 py-0.5 rounded-full border border-slate-700 font-medium">
                  Scan with any UPI App
                </div>
              </div>

              {/* Direct UPI App Buttons for Mobile */}
              <div className="mt-5 grid grid-cols-3 gap-2">
                <a
                  href={upiIntentUrl}
                  className="py-2.5 px-2 bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 rounded-xl text-center transition flex flex-col items-center justify-center gap-1 group"
                >
                  <span className="text-xs font-semibold text-white group-hover:text-blue-400">Google Pay</span>
                  <span className="text-[10px] text-slate-400">Tap to Pay</span>
                </a>
                <a
                  href={upiIntentUrl}
                  className="py-2.5 px-2 bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 rounded-xl text-center transition flex flex-col items-center justify-center gap-1 group"
                >
                  <span className="text-xs font-semibold text-purple-400 group-hover:text-purple-300">PhonePe</span>
                  <span className="text-[10px] text-slate-400">Tap to Pay</span>
                </a>
                <a
                  href={upiIntentUrl}
                  className="py-2.5 px-2 bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 rounded-xl text-center transition flex flex-col items-center justify-center gap-1 group"
                >
                  <span className="text-xs font-semibold text-sky-400 group-hover:text-sky-300">Paytm / BHIM</span>
                  <span className="text-[10px] text-slate-400">Tap to Pay</span>
                </a>
              </div>

              {/* Main Pay Intent Button */}
              <div className="mt-4 space-y-2">
                <a
                  href={upiIntentUrl}
                  className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium py-3 px-5 rounded-xl transition shadow-lg shadow-blue-500/20 text-sm"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>Open in Any UPI App</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                </a>

                {/* Copy VPA button */}
                <button
                  onClick={copyVpa}
                  className="w-full inline-flex items-center justify-between bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 font-mono py-2 px-3 rounded-xl transition text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400">UPI ID:</span>
                    <span className="text-white font-semibold">{vpa}</span>
                  </div>
                  <span className="text-[11px] text-blue-400 flex items-center gap-1">
                    {copiedVpa ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedVpa ? "Copied!" : "Copy"}</span>
                  </span>
                </button>
              </div>

              {/* Enter UTR Proof Form */}
              <div className="mt-5 p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-left">
                <div className="text-xs font-semibold text-white mb-1">Paid via UPI? Verify Instantly:</div>
                <p className="text-[11px] text-slate-400 mb-3">
                  Enter the 12-digit UPI Ref / UTR number from your payment app receipt to complete the order immediately.
                </p>
                <form onSubmit={handleConfirmUtr} className="flex gap-2">
                  <input
                    type="text"
                    value={utrInput}
                    onChange={(e) => setUtrInput(e.target.value)}
                    placeholder="e.g. 425718291034"
                    maxLength={20}
                    className="flex-1 bg-slate-950 border border-slate-700 text-white text-xs px-3 py-2 rounded-xl font-mono focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="submit"
                    disabled={isSubmittingUtr || !utrInput.trim()}
                    className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2 rounded-xl transition flex items-center gap-1"
                  >
                    {isSubmittingUtr ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                    <span>Verify</span>
                  </button>
                </form>
                {utrMessage && (
                  <p className="text-[11px] text-amber-400 mt-2 font-mono">{utrMessage}</p>
                )}
              </div>

              {/* Live Polling Status */}
              <div className="mt-6 pt-5 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span>Awaiting verified payment confirmation...</span>
                </div>
                <div className="font-mono text-[11px] text-slate-500">{providerId}</div>
              </div>

              {/* Sandbox Simulation Widget */}
              <div className="mt-4 p-3 rounded-xl bg-amber-950/20 border border-amber-500/20 text-left">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-amber-400 text-xs font-semibold">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Sandbox Test Mode</span>
                  </div>
                  <button
                    disabled={isSimulating}
                    onClick={handleSimulatePayment}
                    className="text-[11px] bg-amber-500 hover:bg-amber-400 text-black font-semibold px-2.5 py-1 rounded-md transition flex items-center gap-1"
                  >
                    {isSimulating ? <RefreshCw className="w-3 h-3 animate-spin" /> : null}
                    <span>Simulate Payment</span>
                  </button>
                </div>
                {simulationMessage && (
                  <p className="text-[11px] text-amber-300/80 mt-1.5 font-mono">{simulationMessage}</p>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full max-w-lg text-center pt-6 text-[11px] text-slate-500">
        Powered by <span className="text-slate-400 font-medium">PayCore</span> Personal Payment Gateway
      </footer>
    </div>
  );
}
