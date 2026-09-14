import Link from "next/link";
import {
  LayoutDashboard,
  Receipt,
  Link as LinkIcon,
  QrCode,
  Webhook,
  Sparkles,
  Key,
  Settings,
  ExternalLink,
  ShieldCheck,
  CreditCard,
} from "lucide-react";
import { NavLinks } from "./nav-links";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex">
      {/* Desktop Sidebar */}
      <aside className="w-64 border-r border-slate-800/80 bg-[#0b0f19] flex flex-col justify-between p-4 shrink-0">
        <div>
          {/* Brand */}
          <div className="flex items-center gap-2.5 px-3 py-3 mb-6">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">
              P
            </div>
            <div>
              <div className="font-bold text-sm tracking-tight text-white flex items-center gap-1.5">
                PayCore
                <span className="text-[10px] bg-blue-950 text-blue-400 border border-blue-500/20 px-1.5 py-0.2 rounded">
                  v1
                </span>
              </div>
              <div className="text-[11px] text-slate-400">Payment Gateway</div>
            </div>
          </div>

          {/* Navigation Links */}
          <NavLinks />
        </div>

        {/* Bottom Status / Links */}
        <div className="pt-4 border-t border-slate-800/80 px-2 space-y-2">
          <div className="flex items-center justify-between text-[11px] text-slate-400 px-2 py-1">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Gateway Online
            </span>
            <span className="font-mono text-slate-500">v1.0.0</span>
          </div>

          <a
            href="/pay/devcourse"
            target="_blank"
            rel="noreferrer"
            className="w-full flex items-center justify-between px-3 py-2 text-xs text-slate-300 hover:text-white bg-slate-900/60 hover:bg-slate-900 border border-slate-800 rounded-xl transition"
          >
            <span className="flex items-center gap-2">
              <CreditCard className="w-3.5 h-3.5 text-blue-400" />
              <span>Demo Checkout</span>
            </span>
            <ExternalLink className="w-3.5 h-3.5 opacity-60" />
          </a>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top bar */}
        <header className="h-14 border-b border-slate-800/80 bg-[#090d16]/80 backdrop-blur sticky top-0 z-10 px-6 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Environment:</span>
            <span className="font-mono px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-500/20">
              SANDBOX / HYBRID
            </span>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/dashboard/simulator"
              className="text-xs bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Sandbox Simulator</span>
            </a>
            <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-xs text-slate-300">
              AD
            </div>
          </div>
        </header>

        <main className="p-6 flex-1">{children}</main>
      </div>
    </div>
  );
}
