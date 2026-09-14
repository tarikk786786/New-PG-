"use client";

import { useState } from "react";
import { formatPaise } from "@/lib/utils";
import {
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  RotateCcw,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Check,
  ArrowRight,
  RefreshCw,
  X,
} from "lucide-react";

interface EnrichedPayment {
  id: string;
  orderId: string;
  orderNumber: string;
  orderDescription?: string;
  provider: string;
  providerPaymentId?: string;
  amount: number;
  currency: string;
  status: string;
  method: string;
  upiIdMasked?: string;
  referenceId?: string;
  createdAt: string;
  paidAt?: string;
  failedAt?: string;
}

export function TransactionsClient({ initialPayments }: { initialPayments: EnrichedPayment[] }) {
  const [payments, setPayments] = useState<EnrichedPayment[]>(initialPayments);
  const [filter, setFilter] = useState<string>("ALL");
  const [search, setSearch] = useState<string>("");
  const [selectedPayment, setSelectedPayment] = useState<EnrichedPayment | null>(null);
  const [isRefunding, setIsRefunding] = useState(false);
  const [refundMsg, setRefundMsg] = useState("");

  const filtered = payments.filter((p) => {
    if (filter !== "ALL" && p.status !== filter) return false;
    if (
      search &&
      !p.id.toLowerCase().includes(search.toLowerCase()) &&
      !p.orderNumber.toLowerCase().includes(search.toLowerCase()) &&
      !p.provider.toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const handleRefund = async (paymentId: string) => {
    setIsRefunding(true);
    setRefundMsg("");
    try {
      const res = await fetch("/api/v1/refunds", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer sk_live_paycore_master_default_key",
        },
        body: JSON.stringify({ paymentId }),
      });
      const data = await res.json();
      if (data.success) {
        setRefundMsg("Refund successfully processed!");
        setPayments((prev) =>
          prev.map((item) => (item.id === paymentId ? { ...item, status: "REFUNDED" } : item))
        );
        if (selectedPayment) {
          setSelectedPayment({ ...selectedPayment, status: "REFUNDED" });
        }
      } else {
        setRefundMsg(data.error?.message || "Refund failed");
      }
    } catch (err: any) {
      setRefundMsg(err.message || "Network error");
    } finally {
      setIsRefunding(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Transactions & State Logs</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Audit trail of payment states verified through provider adapters.
          </p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {["ALL", "PAID", "PENDING", "FAILED", "REFUNDED"].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${
                filter === tab
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                  : "bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search ID, Order, Provider..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900/80 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition"
          />
        </div>
      </div>

      {/* Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4 font-medium">Payment ID</th>
                <th className="py-3 px-4 font-medium">Order Reference</th>
                <th className="py-3 px-4 font-medium">Amount</th>
                <th className="py-3 px-4 font-medium">Provider</th>
                <th className="py-3 px-4 font-medium">Method</th>
                <th className="py-3 px-4 font-medium">Status</th>
                <th className="py-3 px-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No transactions match current filters.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => {
                  let badge = "bg-slate-800 text-slate-300 border-slate-700";
                  if (p.status === "PAID") badge = "bg-emerald-950/60 text-emerald-400 border-emerald-500/20";
                  else if (p.status === "PENDING") badge = "bg-amber-950/60 text-amber-400 border-amber-500/20";
                  else if (p.status === "FAILED") badge = "bg-red-950/60 text-red-400 border-red-500/20";
                  else if (p.status.includes("REFUND")) badge = "bg-purple-950/60 text-purple-400 border-purple-500/20";

                  return (
                    <tr key={p.id} className="hover:bg-slate-900/40 transition">
                      <td className="py-3 px-4 font-mono font-medium text-blue-400">{p.id}</td>
                      <td className="py-3 px-4 font-mono text-slate-300">{p.orderNumber}</td>
                      <td className="py-3 px-4 font-semibold text-white">{formatPaise(p.amount, p.currency)}</td>
                      <td className="py-3 px-4 font-mono capitalize text-slate-400">{p.provider}</td>
                      <td className="py-3 px-4 uppercase text-[10px] text-slate-400">{p.method}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border ${badge}`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setSelectedPayment(p)}
                          className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition"
                        >
                          Inspect
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction Detail Modal / Drawer */}
      {selectedPayment && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-lg rounded-3xl border border-slate-700 p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setSelectedPayment(null);
                setRefundMsg("");
              }}
              className="absolute right-4 top-4 text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800/80 transition"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <span className="font-mono text-xs text-blue-400 font-semibold">{selectedPayment.id}</span>
              <span className="text-slate-500">•</span>
              <span className="text-xs text-slate-400">{selectedPayment.orderNumber}</span>
            </div>

            <h2 className="text-2xl font-bold text-white tracking-tight">
              {formatPaise(selectedPayment.amount, selectedPayment.currency)}
            </h2>

            {/* Lifecycle Timeline */}
            <div className="mt-6 pt-4 border-t border-slate-800">
              <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-4">
                Lifecycle State Timeline
              </h3>

              <div className="space-y-4 text-xs">
                {/* Step 1 */}
                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="font-medium text-white">Order & Payment Request Created</div>
                    <div className="text-slate-400 text-[11px]">Amount registered: {formatPaise(selectedPayment.amount)}</div>
                    <div className="text-slate-500 text-[10px] font-mono mt-0.5">{new Date(selectedPayment.createdAt).toLocaleString()}</div>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="font-medium text-white">Provider Dispatch ({selectedPayment.provider})</div>
                    <div className="text-slate-400 text-[11px]">Dynamic QR & UPI Intent URL generated</div>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex items-start gap-3">
                  <div
                    className={`h-6 w-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                      selectedPayment.status === "PAID" || selectedPayment.status.includes("REFUND")
                        ? "bg-emerald-500/20 text-emerald-400"
                        : selectedPayment.status === "FAILED"
                        ? "bg-red-500/20 text-red-400"
                        : "bg-amber-500/20 text-amber-400"
                    }`}
                  >
                    {selectedPayment.status === "PAID" || selectedPayment.status.includes("REFUND") ? (
                      <Check className="w-3.5 h-3.5" />
                    ) : (
                      <Clock className="w-3.5 h-3.5" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-white">Authoritative Server Verification</div>
                    <div className="text-slate-400 text-[11px]">
                      {selectedPayment.status === "PAID" || selectedPayment.status.includes("REFUND")
                        ? "Provider webhook verified with raw signature. Transitioned to PAID."
                        : "Awaiting provider callback or API confirmation."}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions / Refund */}
            {selectedPayment.status === "PAID" && (
              <div className="mt-6 pt-4 border-t border-slate-800">
                <button
                  disabled={isRefunding}
                  onClick={() => handleRefund(selectedPayment.id)}
                  className="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-medium text-xs rounded-xl transition flex items-center justify-center gap-2"
                >
                  {isRefunding ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
                  <span>Issue Full Refund ({formatPaise(selectedPayment.amount)})</span>
                </button>
                {refundMsg && (
                  <p className="text-xs text-center mt-2 font-mono text-emerald-400">{refundMsg}</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
