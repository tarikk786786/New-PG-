"use client";

import { useState } from "react";
import { ApiKey } from "@/lib/types";
import { Key, Plus, Copy, Check, ShieldAlert, X } from "lucide-react";

export function ApiKeysClient({ initialKeys }: { initialKeys: ApiKey[] }) {
  const [keys, setKeys] = useState<ApiKey[]>(initialKeys);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);

  // Form
  const [name, setName] = useState("");
  const [type, setType] = useState<"live" | "test">("live");
  const [permissions, setPermissions] = useState<string[]>([
    "orders:*",
    "payments:*",
    "refunds:*",
    "webhooks:*",
  ]);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    const prefix = type === "live" ? "sk_live_" : "sk_test_";
    const generatedSecret = `${prefix}${Math.random().toString(36).substring(2, 14)}${Math.random().toString(36).substring(2, 14)}`;

    const newKeyObj: ApiKey = {
      id: "key_" + Date.now(),
      name: name || `${type.toUpperCase()} Key`,
      keyPrefix: prefix,
      keyHash: generatedSecret,
      type,
      permissions,
      revoked: false,
      createdAt: new Date().toISOString(),
    };

    setKeys([newKeyObj, ...keys]);
    setNewlyCreatedKey(generatedSecret);
    setIsModalOpen(false);
    setName("");
  };

  const handleRevoke = (id: string) => {
    setKeys(keys.map((k) => (k.id === id ? { ...k, revoked: true } : k)));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">API Keys & Authentication</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage your secret and public credentials for integrating downstream storefronts.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="text-xs bg-blue-600 hover:bg-blue-500 text-white font-medium px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 shadow-lg shadow-blue-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>Generate New Key</span>
        </button>
      </div>

      {/* Newly Generated Key Alert */}
      {newlyCreatedKey && (
        <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-emerald-400">Save Your Secret Key</div>
            <div className="text-[11px] text-slate-300 mt-0.5">
              Copy this key now. For your security, it won't be shown again in full.
            </div>
            <div className="font-mono text-xs text-white bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 mt-2 select-all">
              {newlyCreatedKey}
            </div>
          </div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(newlyCreatedKey);
              setCopiedKey(true);
              setTimeout(() => setCopiedKey(false), 2000);
            }}
            className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-medium transition flex items-center gap-1.5 shrink-0"
          >
            {copiedKey ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedKey ? "Copied" : "Copy"}</span>
          </button>
        </div>
      )}

      {/* Keys List */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4 font-medium">Name</th>
                <th className="py-3 px-4 font-medium">Key Prefix</th>
                <th className="py-3 px-4 font-medium">Type</th>
                <th className="py-3 px-4 font-medium">Scopes</th>
                <th className="py-3 px-4 font-medium">Status</th>
                <th className="py-3 px-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {keys.map((k) => (
                <tr key={k.id} className="hover:bg-slate-900/40 transition">
                  <td className="py-3 px-4 font-medium text-white">{k.name}</td>
                  <td className="py-3 px-4 font-mono text-slate-300">
                    {k.keyPrefix}••••••••••••
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`uppercase text-[10px] font-bold px-2 py-0.5 rounded border ${
                        k.type === "live"
                          ? "bg-blue-950/60 text-blue-400 border-blue-500/20"
                          : "bg-amber-950/60 text-amber-400 border-amber-500/20"
                      }`}
                    >
                      {k.type}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-400 text-[11px]">
                    {k.permissions.join(", ")}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`text-[10px] font-medium px-2 py-0.5 rounded ${
                        k.revoked
                          ? "bg-red-950/60 text-red-400 border border-red-500/20"
                          : "bg-emerald-950/60 text-emerald-400 border border-emerald-500/20"
                      }`}
                    >
                      {k.revoked ? "Revoked" : "Active"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    {!k.revoked && (
                      <button
                        onClick={() => handleRevoke(k.id)}
                        className="text-red-400 hover:text-red-300 transition text-[11px]"
                      >
                        Revoke
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md rounded-3xl border border-slate-700 p-6 shadow-2xl relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800 transition"
            >
              <X className="w-4 h-4" />
            </button>

            <h2 className="text-lg font-bold text-white tracking-tight mb-1">Generate API Key</h2>
            <p className="text-xs text-slate-400 mb-5">Create a scoped key for server-to-server operations.</p>

            <form onSubmit={handleGenerate} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Key Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Next.js Web Store API Key"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Key Environment</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setType("live")}
                    className={`py-2 rounded-xl border text-xs font-medium transition ${
                      type === "live"
                        ? "bg-blue-600 text-white border-blue-500"
                        : "bg-slate-900 text-slate-400 border-slate-800"
                    }`}
                  >
                    Live (sk_live_)
                  </button>
                  <button
                    type="button"
                    onClick={() => setType("test")}
                    className={`py-2 rounded-xl border text-xs font-medium transition ${
                      type === "test"
                        ? "bg-blue-600 text-white border-blue-500"
                        : "bg-slate-900 text-slate-400 border-slate-800"
                    }`}
                  >
                    Test (sk_test_)
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl transition text-xs shadow-lg shadow-blue-500/25 mt-2"
              >
                Create Key
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
