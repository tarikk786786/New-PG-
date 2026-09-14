import { db } from "@/lib/db";
import { formatPaise } from "@/lib/utils";
import {
  TrendingUp,
  CreditCard,
  Clock,
  AlertCircle,
  RotateCcw,
  ArrowUpRight,
  Sparkles,
  QrCode,
  Link as LinkIcon,
} from "lucide-react";
import Link from "next/link";
import { RevenueChart } from "./revenue-chart";

export const revalidate = 0; // Dynamic on load

export default async function DashboardOverviewPage() {
  const orders = await db.orders.list();
  const payments = await db.payments.list();
  const paymentLinks = await db.paymentLinks.list();

  // Compute metrics
  const paidPayments = payments.filter((p) => p.status === "PAID");
  const pendingPayments = payments.filter((p) => p.status === "PENDING");
  const failedPayments = payments.filter((p) => p.status === "FAILED");
  const refundedPayments = payments.filter((p) => p.status === "REFUNDED" || p.status === "PARTIALLY_REFUNDED");

  const totalRevenue = paidPayments.reduce((sum, p) => sum + p.amount, 0);
  const totalRefunded = refundedPayments.reduce((sum, p) => sum + p.amount, 0);
  const successRate = payments.length > 0 ? Math.round((paidPayments.length / payments.length) * 100) : 100;

  // Recent 5 transactions
  const recentPayments = payments.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Financial Overview</h1>
          <p className="text-xs text-slate-400 mt-0.5">Real-time payment analytics and gateway health.</p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/links"
            className="text-xs bg-blue-600 hover:bg-blue-500 text-white font-medium px-3 py-2 rounded-xl transition flex items-center gap-1.5 shadow-lg shadow-blue-500/20"
          >
            <LinkIcon className="w-3.5 h-3.5" />
            <span>Create Link</span>
          </Link>
          <Link
            href="/dashboard/qr"
            className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium px-3 py-2 rounded-xl transition flex items-center gap-1.5"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>New QR</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Total Settled Revenue</span>
            <div className="h-8 w-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white mt-3">{formatPaise(totalRevenue)}</div>
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 mt-2 font-medium">
            <span>+18.4%</span>
            <span className="text-slate-500 font-normal">from last cycle</span>
          </div>
        </div>

        {/* Successful Payments */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Successful Payments</span>
            <div className="h-8 w-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white mt-3">{paidPayments.length}</div>
          <div className="text-[11px] text-slate-400 mt-2">
            Success rate: <span className="text-white font-medium">{successRate}%</span>
          </div>
        </div>

        {/* Pending / In-Flight */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Pending / In-Flight</span>
            <div className="h-8 w-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white mt-3">{pendingPayments.length}</div>
          <div className="text-[11px] text-amber-400/90 mt-2">Awaiting provider confirmation</div>
        </div>

        {/* Refunded Amount */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Refunded Volume</span>
            <div className="h-8 w-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <RotateCcw className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white mt-3">{formatPaise(totalRefunded)}</div>
          <div className="text-[11px] text-slate-400 mt-2">
            {refundedPayments.length} {refundedPayments.length === 1 ? "refund" : "refunds"} processed
          </div>
        </div>
      </div>

      {/* Revenue Chart Section */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-white">Daily Volume & Ingestion</h2>
            <p className="text-[11px] text-slate-400">Aggregated transaction volume processed through PayCore.</p>
          </div>
          <span className="text-[11px] font-mono bg-slate-800/80 px-2.5 py-1 rounded text-slate-300">
            Last 7 Days
          </span>
        </div>
        <RevenueChart />
      </div>

      {/* Recent Transactions Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white">Recent Transactions</h2>
            <p className="text-[11px] text-slate-400">Live payment state machine logs</p>
          </div>
          <Link
            href="/dashboard/transactions"
            className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/60 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4 font-medium">Payment ID</th>
                <th className="py-3 px-4 font-medium">Order</th>
                <th className="py-3 px-4 font-medium">Amount</th>
                <th className="py-3 px-4 font-medium">Provider</th>
                <th className="py-3 px-4 font-medium">Method</th>
                <th className="py-3 px-4 font-medium">Status</th>
                <th className="py-3 px-4 font-medium text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {recentPayments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No transactions recorded yet.
                  </td>
                </tr>
              ) : (
                recentPayments.map((p) => {
                  let badgeColor = "bg-slate-800 text-slate-300 border-slate-700";
                  if (p.status === "PAID") badgeColor = "bg-emerald-950/60 text-emerald-400 border-emerald-500/20";
                  else if (p.status === "PENDING") badgeColor = "bg-amber-950/60 text-amber-400 border-amber-500/20";
                  else if (p.status === "FAILED") badgeColor = "bg-red-950/60 text-red-400 border-red-500/20";
                  else if (p.status.includes("REFUND")) badgeColor = "bg-purple-950/60 text-purple-400 border-purple-500/20";

                  return (
                    <tr key={p.id} className="hover:bg-slate-900/40 transition">
                      <td className="py-3 px-4 font-mono font-medium text-blue-400">{p.id}</td>
                      <td className="py-3 px-4 font-mono text-slate-300">{p.orderId}</td>
                      <td className="py-3 px-4 font-semibold text-white">{formatPaise(p.amount, p.currency)}</td>
                      <td className="py-3 px-4 font-mono text-slate-400 capitalize">{p.provider}</td>
                      <td className="py-3 px-4 uppercase text-[10px] tracking-wider text-slate-400">{p.method}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border ${badgeColor}`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right text-slate-400">
                        {new Date(p.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
