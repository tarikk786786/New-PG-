import { db } from "@/lib/db";
import { Users, Mail, Phone, Calendar } from "lucide-react";

export const revalidate = 0;

export default async function CustomersPage() {
  const customers = await db.customers.list();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">Customer Database</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Directory of registered payers and checkout identities.
        </p>
      </div>

      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4 font-medium">Customer ID</th>
                <th className="py-3 px-4 font-medium">Name</th>
                <th className="py-3 px-4 font-medium">Email</th>
                <th className="py-3 px-4 font-medium">Phone</th>
                <th className="py-3 px-4 font-medium text-right">Registered</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-500">
                    No customers found.
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-900/40 transition">
                    <td className="py-3 px-4 font-mono font-medium text-blue-400">{c.id}</td>
                    <td className="py-3 px-4 font-medium text-white">{c.name || "Anonymous"}</td>
                    <td className="py-3 px-4 text-slate-300">
                      <span className="flex items-center gap-1.5">
                        <Mail className="w-3 h-3 text-slate-500" />
                        {c.email || "N/A"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      <span className="flex items-center gap-1.5">
                        <Phone className="w-3 h-3 text-slate-500" />
                        {c.phone || "N/A"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-slate-400">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
