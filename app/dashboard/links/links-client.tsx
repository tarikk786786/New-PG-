"use client";

import { useState } from "react";
import { PaymentLink } from "@/lib/types";
import { formatPaise, toPaise } from "@/lib/utils";
import {
  Plus,
  Link as LinkIcon,
  Copy,
  Check,
  ExternalLink,
  QrCode,
  X,
  CreditCard,
  Zap,
  Download,
  Key,
} from "lucide-react";

export function LinksClient({ initialLinks }: { initialLinks: PaymentLink[] }) {
  const [links, setLinks] = useState<PaymentLink[]>(initialLinks);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [amountRupees, setAmountRupees] = useState("");
  const [description, setDescription] = useState("");
  const [code, setCode] = useState("");
  const [productType, setProductType] = useState<"standard" | "digital">("standard");
  const [downloadUrl, setDownloadUrl] = useState("");
  const [licenseKey, setLicenseKey] = useState("");
  const [deliveryInstructions, setDeliveryInstructions] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCopy = (code: string) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const url = `${origin}/pay/${code}`;
    navigator.clipboard.writeText(url);
    setCopiedId(code);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amountRupees) return;

    setIsSubmitting(true);
    try {
      const paise = toPaise(amountRupees);
      const res = await fetch("/api/v1/payment-links", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer sk_live_paycore_master_default_key",
        },
        body: JSON.stringify({
          title,
          amount: paise,
          currency: "INR",
          description,
          code: code.trim() || undefined,
          productType,
          downloadUrl: downloadUrl.trim() || undefined,
          licenseKey: licenseKey.trim() || undefined,
          deliveryInstructions: deliveryInstructions.trim() || undefined,
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setLinks([json.data, ...links]);
        setIsModalOpen(false);
        setTitle("");
        setAmountRupees("");
        setDescription("");
        setCode("");
        setProductType("standard");
        setDownloadUrl("");
        setLicenseKey("");
        setDeliveryInstructions("");
      }
    } catch (err) {
      console.error("Failed to create link:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Payment Links</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Shareable checkout URLs for products, subscriptions, and invoices.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="text-xs bg-blue-600 hover:bg-blue-500 text-white font-medium px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 shadow-lg shadow-blue-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>New Payment Link</span>
        </button>
      </div>

      {/* Grid of Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {links.map((l) => (
          <div
            key={l.id}
            className="glass-panel p-5 rounded-2xl border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <span className="text-[11px] font-mono uppercase bg-blue-950/60 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded">
                  /pay/{l.code}
                </span>
                <span
                  className={`text-[10px] font-medium px-2 py-0.5 rounded ${
                    l.active
                      ? "bg-emerald-950/60 text-emerald-400 border border-emerald-500/20"
                      : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {l.active ? "Active" : "Archived"}
                </span>
              </div>

              <h2 className="text-base font-bold text-white mt-3 line-clamp-1">{l.title}</h2>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2">{l.description || "No description provided."}</p>
              <div className="text-xl font-extrabold text-white mt-4">{formatPaise(l.amount, l.currency)}</div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-slate-400 text-[11px]">{l.paymentCount || 0} payments collected</span>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleCopy(l.code)}
                  title="Copy Link URL"
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
                >
                  {copiedId === l.code ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <a
                  href={`/pay/${l.code}`}
                  target="_blank"
                  rel="noreferrer"
                  title="Open Hosted Checkout"
                  className="p-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg transition"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal to Create Link */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md rounded-3xl border border-slate-700 p-6 shadow-2xl relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800 transition"
            >
              <X className="w-4 h-4" />
            </button>

            <h2 className="text-lg font-bold text-white tracking-tight mb-1">Create Payment Link</h2>
            <p className="text-xs text-slate-400 mb-5">Generate a branded UPI/card checkout link.</p>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Title / Product Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Design Consulting or Pro Lifetime"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Amount (₹ INR)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="e.g. 499.00"
                  value={amountRupees}
                  onChange={(e) => setAmountRupees(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Custom Slug (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. consult or masterclass"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Brief summary displayed on checkout"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Digital Product Delivery Options */}
              <div className="pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-slate-200 font-medium">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>Digital Product Delivery</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setProductType(productType === "digital" ? "standard" : "digital")}
                    className={`text-[11px] px-2.5 py-1 rounded-lg border transition ${
                      productType === "digital"
                        ? "bg-indigo-950 text-indigo-300 border-indigo-500/40 font-semibold"
                        : "bg-slate-800 text-slate-400 border-slate-700"
                    }`}
                  >
                    {productType === "digital" ? "Enabled (Digital)" : "Standard Payment"}
                  </button>
                </div>

                {productType === "digital" && (
                  <div className="space-y-3 p-3 rounded-xl bg-indigo-950/30 border border-indigo-500/20 animate-in fade-in">
                    <div>
                      <label className="block text-slate-400 text-[11px] mb-1">Download / Access URL</label>
                      <input
                        type="url"
                        placeholder="https://drive.google.com/... or https://yourdomain.com/file.zip"
                        value={downloadUrl}
                        onChange={(e) => setDownloadUrl(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 text-xs focus:outline-none focus:border-indigo-400"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 text-[11px] mb-1">License Key / Serial (Optional)</label>
                      <input
                        type="text"
                        placeholder="e.g. LIC-PRO-98412 or leave blank to auto-generate"
                        value={licenseKey}
                        onChange={(e) => setLicenseKey(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 text-xs focus:outline-none focus:border-indigo-400"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 text-[11px] mb-1">Delivery Instructions (Optional)</label>
                      <input
                        type="text"
                        placeholder="e.g. Unzip and run npm start, or redeem on our portal."
                        value={deliveryInstructions}
                        onChange={(e) => setDeliveryInstructions(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 text-xs focus:outline-none focus:border-indigo-400"
                      />
                    </div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl transition text-xs shadow-lg shadow-blue-500/25 mt-2"
              >
                {isSubmitting ? "Generating..." : "Generate Payment Link"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
