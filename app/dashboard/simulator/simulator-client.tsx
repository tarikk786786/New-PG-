"use client";

import { useState } from "react";
import { Order } from "@/lib/types";
import { formatPaise } from "@/lib/utils";
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldAlert,
  RotateCcw,
  RefreshCw,
  Terminal,
} from "lucide-react";

export function SimulatorClient({ initialOrders }: { initialOrders: Order[] }) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [selectedOrderId, setSelectedOrderId] = useState<string>(initialOrders[0]?.id || "");
  const [isFiring, setIsFiring] = useState(false);
  const [outputLog, setOutputLog] = useState<string[]>([]);

  const addLog = (msg: string) => {
    setOutputLog((prev) => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev]);
  };

  const fireSimulation = async (action: "SUCCESS" | "FAILED" | "INVALID_SIGNATURE" | "DUPLICATE_WEBHOOK") => {
    if (!selectedOrderId) {
      addLog("Error: Please select an order first.");
      return;
    }

    setIsFiring(true);
    addLog(`Firing action: ${action} for order ${selectedOrderId}...`);

    try {
      if (action === "INVALID_SIGNATURE") {
        const res = await fetch("/api/webhooks/mock", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-signature": "invalid_signature_test",
          },
          body: JSON.stringify({
            event: "payment.paid",
            orderId: selectedOrderId,
            amount: 49900,
          }),
        });
        const json = await res.json();
        addLog(`Response HTTP ${res.status}: ${JSON.stringify(json)}`);
        addLog("Verification check: System correctly rejected unauthorized signature!");
      } else {
        const res = await fetch("/api/test/payments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action, orderId: selectedOrderId }),
        });
        const json = await res.json();
        addLog(`Simulator Output: ${JSON.stringify(json, null, 2)}`);

        if (json.success) {
          addLog(`State machine transitioned order ${selectedOrderId} to ${action === "SUCCESS" ? "PAID" : "FAILED"}`);
          setOrders((prev) =>
            prev.map((o) => (o.id === selectedOrderId ? { ...o, status: action === "SUCCESS" ? "PAID" : "CANCELLED" } : o))
          );
        }
      }
    } catch (err: any) {
      addLog(`Error: ${err.message}`);
    } finally {
      setIsFiring(false);
    }
  };

  const selectedOrder = orders.find((o) => o.id === selectedOrderId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-400" />
          <span>Sandbox Simulator</span>
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Simulate provider events, webhook arrivals, timeouts, and signatures without real money.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Control Panel */}
        <div className="lg:col-span-6 glass-panel p-6 rounded-3xl border border-slate-800 space-y-5 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1.5">Target Order</label>
            <select
              value={selectedOrderId}
              onChange={(e) => setSelectedOrderId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
            >
              {orders.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.orderNumber} — {formatPaise(o.amount, o.currency)} [{o.status}]
                </option>
              ))}
            </select>
          </div>

          {selectedOrder && (
            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Current Status:</span>
                <span className="font-mono text-white font-bold">{selectedOrder.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Amount:</span>
                <span className="font-semibold text-emerald-400">{formatPaise(selectedOrder.amount, selectedOrder.currency)}</span>
              </div>
            </div>
          )}

          <div className="pt-2">
            <label className="block text-slate-300 font-medium mb-3">Trigger Simulated Event</label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                disabled={isFiring}
                onClick={() => fireSimulation("SUCCESS")}
                className="p-3 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 rounded-xl flex items-center justify-center gap-2 font-medium transition"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Simulate SUCCESS</span>
              </button>

              <button
                disabled={isFiring}
                onClick={() => fireSimulation("FAILED")}
                className="p-3 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 rounded-xl flex items-center justify-center gap-2 font-medium transition"
              >
                <XCircle className="w-4 h-4" />
                <span>Simulate FAILED</span>
              </button>

              <button
                disabled={isFiring}
                onClick={() => fireSimulation("INVALID_SIGNATURE")}
                className="p-3 bg-amber-600/20 hover:bg-amber-600/30 text-amber-400 border border-amber-500/30 rounded-xl flex items-center justify-center gap-2 font-medium transition"
              >
                <ShieldAlert className="w-4 h-4" />
                <span>Invalid Signature</span>
              </button>

              <button
                disabled={isFiring}
                onClick={() => fireSimulation("DUPLICATE_WEBHOOK")}
                className="p-3 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 border border-purple-500/30 rounded-xl flex items-center justify-center gap-2 font-medium transition"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Replay / Duplicate</span>
              </button>
            </div>
          </div>
        </div>

        {/* Live Terminal Log */}
        <div className="lg:col-span-6 glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <span className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                <Terminal className="w-4 h-4 text-blue-400" />
                <span>Real-time State Machine Stream</span>
              </span>
              <button
                onClick={() => setOutputLog([])}
                className="text-[11px] text-slate-500 hover:text-slate-300"
              >
                Clear Log
              </button>
            </div>

            <div className="h-64 overflow-y-auto space-y-1.5 font-mono text-[11px] text-slate-300">
              {outputLog.length === 0 ? (
                <div className="text-slate-600 pt-8 text-center">Awaiting simulator triggers...</div>
              ) : (
                outputLog.map((log, i) => (
                  <div key={i} className="leading-relaxed whitespace-pre-wrap">
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
