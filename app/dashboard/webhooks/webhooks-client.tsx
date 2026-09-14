"use client";

import { useState } from "react";
import { WebhookEventRecord, WebhookEndpoint, WebhookDelivery } from "@/lib/types";
import {
  Webhook,
  Plus,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCw,
  Code,
  X,
} from "lucide-react";

interface WebhooksClientProps {
  initialEvents: WebhookEventRecord[];
  initialEndpoints: WebhookEndpoint[];
  initialDeliveries: WebhookDelivery[];
}

export function WebhooksClient({
  initialEvents,
  initialEndpoints,
  initialDeliveries,
}: WebhooksClientProps) {
  const [activeTab, setActiveTab] = useState<"INBOUND" | "OUTBOUND">("INBOUND");
  const [events] = useState<WebhookEventRecord[]>(initialEvents);
  const [endpoints, setEndpoints] = useState<WebhookEndpoint[]>(initialEndpoints);
  const [deliveries] = useState<WebhookDelivery[]>(initialDeliveries);

  // New endpoint modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [secret, setSecret] = useState("whsec_" + Math.random().toString(36).substring(2, 12));
  const [description, setDescription] = useState("");

  const handleCreateEndpoint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    const newEndpoint: WebhookEndpoint = {
      id: "ep_" + Date.now(),
      url,
      secret,
      description,
      events: ["*"],
      active: true,
      createdAt: new Date().toISOString(),
    };

    setEndpoints([newEndpoint, ...endpoints]);
    setIsModalOpen(false);
    setUrl("");
    setDescription("");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Webhook Center</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Monitor inbound PSP provider webhooks and outbound application deliveries.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="text-xs bg-blue-600 hover:bg-blue-500 text-white font-medium px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 shadow-lg shadow-blue-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>Add Outbound Endpoint</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab("INBOUND")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
            activeTab === "INBOUND"
              ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
              : "bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800"
          }`}
        >
          Inbound Events from PSPs ({events.length})
        </button>
        <button
          onClick={() => setActiveTab("OUTBOUND")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
            activeTab === "OUTBOUND"
              ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
              : "bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800"
          }`}
        >
          Outbound Delivery Logs ({deliveries.length})
        </button>
      </div>

      {/* Inbound Events View */}
      {activeTab === "INBOUND" && (
        <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300">
              Provider Inbound Webhooks (/api/webhooks/:provider)
            </span>
            <span className="text-[11px] text-slate-500">HMAC-SHA256 Validated</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4 font-medium">Event ID</th>
                  <th className="py-3 px-4 font-medium">Provider</th>
                  <th className="py-3 px-4 font-medium">Event Type</th>
                  <th className="py-3 px-4 font-medium">Signature Status</th>
                  <th className="py-3 px-4 font-medium text-right">Received</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {events.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-500">
                      No inbound webhooks received yet. Use the Sandbox Simulator to fire a mock webhook.
                    </td>
                  </tr>
                ) : (
                  events.map((evt) => (
                    <tr key={evt.id} className="hover:bg-slate-900/40 transition">
                      <td className="py-3 px-4 font-mono font-medium text-blue-400">{evt.id}</td>
                      <td className="py-3 px-4 font-mono uppercase text-slate-300">{evt.provider}</td>
                      <td className="py-3 px-4 font-semibold text-white">{evt.eventType}</td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-950/60 text-emerald-400 border border-emerald-500/20">
                          <ShieldCheck className="w-3 h-3" />
                          <span>Verified Signature</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right text-slate-400">
                        {new Date(evt.createdAt).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Outbound Delivery View */}
      {activeTab === "OUTBOUND" && (
        <div className="space-y-6">
          {/* Active Endpoints List */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800">
            <h2 className="text-sm font-semibold text-white mb-3">Registered Downstream Webhook Destinations</h2>
            {endpoints.length === 0 ? (
              <p className="text-xs text-slate-500">No external endpoints configured. Click 'Add Outbound Endpoint'.</p>
            ) : (
              <div className="space-y-2">
                {endpoints.map((ep) => (
                  <div
                    key={ep.id}
                    className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-mono text-white font-medium">{ep.url}</div>
                      <div className="text-slate-400 text-[11px] mt-0.5">
                        Secret: <span className="font-mono text-slate-300">{ep.secret}</span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-950/60 text-emerald-400 border border-emerald-500/20 rounded text-[10px]">
                      Active
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Delivery Log Table */}
          <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
            <div className="p-4 border-b border-slate-800">
              <span className="text-xs font-semibold text-slate-300">Outbound Dispatch & Retry History</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4 font-medium">Delivery ID</th>
                    <th className="py-3 px-4 font-medium">Event Type</th>
                    <th className="py-3 px-4 font-medium">HTTP Status</th>
                    <th className="py-3 px-4 font-medium">Attempts</th>
                    <th className="py-3 px-4 font-medium text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {deliveries.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-slate-500">
                        No outbound webhooks dispatched yet.
                      </td>
                    </tr>
                  ) : (
                    deliveries.map((del) => (
                      <tr key={del.id} className="hover:bg-slate-900/40 transition">
                        <td className="py-3 px-4 font-mono font-medium text-blue-400">{del.id}</td>
                        <td className="py-3 px-4 font-semibold text-white">{del.eventType}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border ${
                              del.status === "SUCCESS"
                                ? "bg-emerald-950/60 text-emerald-400 border-emerald-500/20"
                                : "bg-red-950/60 text-red-400 border-red-500/20"
                            }`}
                          >
                            {del.statusCode ? `HTTP ${del.statusCode}` : del.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-300">{del.attempts} / 6</td>
                        <td className="py-3 px-4 text-right text-slate-400">
                          {new Date(del.createdAt).toLocaleTimeString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal to Add Outbound Endpoint */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md rounded-3xl border border-slate-700 p-6 shadow-2xl relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800 transition"
            >
              <X className="w-4 h-4" />
            </button>

            <h2 className="text-lg font-bold text-white tracking-tight mb-1">Add Webhook Endpoint</h2>
            <p className="text-xs text-slate-400 mb-5">
              Register a URL to receive signed event notifications from PayCore.
            </p>

            <form onSubmit={handleCreateEndpoint} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Destination Webhook URL</label>
                <input
                  type="url"
                  required
                  placeholder="https://mystore.com/api/webhooks/paycore"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Signing Secret</label>
                <input
                  type="text"
                  required
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Description (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Production Shopify or Next.js App"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl transition text-xs shadow-lg shadow-blue-500/25 mt-2"
              >
                Register Endpoint
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
