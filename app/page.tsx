import Link from "next/link";
import {
  ShieldCheck,
  Zap,
  ArrowRight,
  QrCode,
  CreditCard,
  Lock,
  Smartphone,
  CheckCircle2,
  ExternalLink,
  Code2,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col justify-between">
      {/* Navbar */}
      <header className="border-b border-slate-800/80 bg-[#090d16]/70 backdrop-blur sticky top-0 z-50 px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">
            P
          </div>
          <span className="font-bold text-base tracking-tight text-white">PayCore</span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/pay/devcourse"
            className="text-xs bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 font-medium px-3.5 py-2 rounded-xl transition flex items-center gap-1.5"
          >
            <span>Demo Checkout</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-60" />
          </Link>
          <Link
            href="/dashboard"
            className="text-xs bg-blue-600 hover:bg-blue-500 text-white font-medium px-4 py-2 rounded-xl transition shadow-lg shadow-blue-500/20 flex items-center gap-1.5"
          >
            <span>Admin Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-5xl mx-auto px-6 py-16 sm:py-24 text-center">
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-blue-400 bg-blue-950/60 border border-blue-500/30 px-3.5 py-1.5 rounded-full mb-6">
          <ShieldCheck className="w-4 h-4" />
          <span>Authoritative Payment Orchestration Layer</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-3xl mx-auto leading-tight">
          Your Personal <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-teal-300 bg-clip-text text-transparent">Universal Payment Gateway</span>
        </h1>

        <p className="mt-5 text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
          One unified payment API and checkout engine for all your websites, apps, and side-projects.
          Engineered for India's UPI ecosystem, Razorpay, Payhip, and future PSPs with pure server-side verification.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/dashboard"
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold px-6 py-3 rounded-xl transition shadow-xl shadow-blue-500/25 flex items-center gap-2 text-sm"
          >
            <span>Open Admin Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/pay/devcourse"
            className="bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-800 font-semibold px-6 py-3 rounded-xl transition flex items-center gap-2 text-sm"
          >
            <Smartphone className="w-4 h-4 text-blue-400" />
            <span>Test Hosted Checkout</span>
          </Link>
        </div>

        {/* Feature Highlights Grid */}
        <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
          <div className="glass-panel p-6 rounded-2xl border border-slate-800">
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-4">
              <QrCode className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-white">Dynamic & Static UPI</h2>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Standardized NPCI-compliant UPI Intent links and auto-expiring dynamic QR codes generated server-side.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-slate-800">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
              <Lock className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-white">Authoritative Verification</h2>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Never trust client status claims. State machine enforces transition to PAID strictly via raw HMAC-SHA256 provider webhooks.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-slate-800">
            <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-4">
              <Code2 className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-white">Provider Abstraction</h2>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Unified interface for Razorpay, Direct UPI, Payhip, and a built-in Sandbox Simulator with zero code rewrites.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-500">
        PayCore — Open Architecture Personal Payment Orchestration
      </footer>
    </div>
  );
}
