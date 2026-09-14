"use client";

import { useState } from "react";
import { QrCode, Download, Copy, Check, Sparkles, RefreshCw } from "lucide-react";
import { toPaise } from "@/lib/utils";

export function QRStudioClient({
  defaultVpa,
  defaultMerchantName,
}: {
  defaultVpa: string;
  defaultMerchantName: string;
}) {
  const [tab, setTab] = useState<"STATIC" | "DYNAMIC">("STATIC");

  // Static Form State
  const [vpa, setVpa] = useState(defaultVpa);
  const [merchantName, setMerchantName] = useState(defaultMerchantName);
  const [note, setNote] = useState("PayCore Store Payment");
  const [staticQrImage, setStaticQrImage] = useState<string>("");
  const [isGeneratingStatic, setIsGeneratingStatic] = useState(false);

  // Dynamic Form State
  const [amountRupees, setAmountRupees] = useState("499.00");
  const [orderRef, setOrderRef] = useState("ORD-" + Math.floor(100000 + Math.random() * 900000));
  const [dynamicQrImage, setDynamicQrImage] = useState<string>("");
  const [dynamicPayload, setDynamicPayload] = useState<string>("");
  const [isGeneratingDynamic, setIsGeneratingDynamic] = useState(false);

  const handleGenerateStatic = async () => {
    setIsGeneratingStatic(true);
    try {
      const res = await fetch("/api/v1/qr/static", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer sk_live_paycore_master_default_key",
        },
        body: JSON.stringify({ vpa, merchantName, note }),
      });
      const data = await res.json();
      if (data.success) {
        setStaticQrImage(data.data.qrImageUrl);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingStatic(false);
    }
  };

  const handleGenerateDynamic = async () => {
    setIsGeneratingDynamic(true);
    try {
      const paise = toPaise(amountRupees);
      const res = await fetch("/api/v1/qr/dynamic", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer sk_live_paycore_master_default_key",
        },
        body: JSON.stringify({
          amount: paise,
          orderNumber: orderRef,
          description: `Payment for ${orderRef}`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setDynamicQrImage(data.data.qrImageUrl);
        setDynamicPayload(data.data.qrPayload);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingDynamic(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">UPI QR Studio</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Generate NPCI-compliant Static Counter QRs and order-bound Dynamic Intent QRs.
        </p>
      </div>

      {/* Mode Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setTab("STATIC")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
            tab === "STATIC"
              ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
              : "bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800"
          }`}
        >
          Mode 1 — Permanent / Static UPI QR
        </button>
        <button
          onClick={() => setTab("DYNAMIC")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
            tab === "DYNAMIC"
              ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
              : "bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800"
          }`}
        >
          Mode 2 — Dynamic Order UPI QR
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Configurator */}
        <div className="lg:col-span-6 glass-panel p-6 rounded-3xl border border-slate-800">
          {tab === "STATIC" ? (
            <div className="space-y-4 text-xs">
              <div>
                <h2 className="text-sm font-bold text-white mb-1">Static Merchant QR Details</h2>
                <p className="text-slate-400 text-[11px] mb-4">
                  For counter payments, donations, and offline sales. Customer enters payment amount manually.
                </p>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Merchant UPI VPA (ID)</label>
                <input
                  type="text"
                  value={vpa}
                  onChange={(e) => setVpa(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Merchant / Business Name</label>
                <input
                  type="text"
                  value={merchantName}
                  onChange={(e) => setMerchantName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Transaction Note</label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <button
                onClick={handleGenerateStatic}
                disabled={isGeneratingStatic}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl transition text-xs shadow-lg shadow-blue-500/25 mt-2"
              >
                {isGeneratingStatic ? "Generating QR..." : "Generate Static QR Code"}
              </button>
            </div>
          ) : (
            <div className="space-y-4 text-xs">
              <div>
                <h2 className="text-sm font-bold text-white mb-1">Dynamic Order QR Details</h2>
                <p className="text-slate-400 text-[11px] mb-4">
                  Binds exact amount and reference ID. Expires in 15 minutes.
                </p>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Order Amount (₹ INR)</label>
                <input
                  type="number"
                  step="0.01"
                  value={amountRupees}
                  onChange={(e) => setAmountRupees(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Order Reference ID</label>
                <input
                  type="text"
                  value={orderRef}
                  onChange={(e) => setOrderRef(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-blue-500"
                />
              </div>

              <button
                onClick={handleGenerateDynamic}
                disabled={isGeneratingDynamic}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl transition text-xs shadow-lg shadow-blue-500/25 mt-2"
              >
                {isGeneratingDynamic ? "Generating Dynamic QR..." : "Generate Dynamic Order QR"}
              </button>
            </div>
          )}
        </div>

        {/* Live QR Preview & Download */}
        <div className="lg:col-span-6 glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col items-center justify-center text-center">
          {tab === "STATIC" ? (
            staticQrImage ? (
              <div className="space-y-4">
                <div className="p-3 bg-white rounded-2xl shadow-xl inline-block">
                  <img src={staticQrImage} alt="Static UPI QR" width={220} height={220} className="rounded-lg" />
                </div>
                <div>
                  <div className="font-semibold text-white text-sm">{merchantName}</div>
                  <div className="text-xs font-mono text-slate-400">{vpa}</div>
                </div>
                <a
                  href={staticQrImage}
                  download={`paycore_static_qr_${vpa}.png`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download High-Res PNG</span>
                </a>
              </div>
            ) : (
              <div className="py-12 text-slate-500 text-xs">
                <QrCode className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Click "Generate Static QR Code" to preview.</p>
              </div>
            )
          ) : dynamicQrImage ? (
            <div className="space-y-4">
              <div className="p-3 bg-white rounded-2xl shadow-xl inline-block">
                <img src={dynamicQrImage} alt="Dynamic UPI QR" width={220} height={220} className="rounded-lg" />
              </div>
              <div>
                <div className="font-bold text-emerald-400 text-lg">₹{amountRupees}</div>
                <div className="text-xs font-mono text-slate-400">{orderRef}</div>
              </div>
              <a
                href={dynamicQrImage}
                download={`paycore_dynamic_${orderRef}.png`}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download QR Image</span>
              </a>
            </div>
          ) : (
            <div className="py-12 text-slate-500 text-xs">
              <QrCode className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Click "Generate Dynamic Order QR" to preview.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
