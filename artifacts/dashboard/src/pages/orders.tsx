import { useState } from "react";
import { Layout } from "@/components/layout";
import {
  useListOrders,
  useUpdateOrderStatus,
  getListOrdersQueryKey,
  useGetDashboardSummary,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { ShoppingCart, Clock, CheckCircle, XCircle, AlertCircle, Search, Truck, Globe, Phone } from "lucide-react";

const statusConfig = {
  pending:   { label: "Beklemede",      cls: "bg-amber-100 text-amber-800 border-amber-200",  icon: <Clock size={12} /> },
  preparing: { label: "Hazırlanıyor",   cls: "bg-blue-100 text-blue-800 border-blue-200",     icon: <AlertCircle size={12} /> },
  delivered: { label: "Teslim Edildi",  cls: "bg-green-100 text-green-800 border-green-200",  icon: <CheckCircle size={12} /> },
  cancelled: { label: "İptal Edildi",   cls: "bg-red-100 text-red-800 border-red-200",        icon: <XCircle size={12} /> },
};

const channelConfig: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
  whatsapp: { color: "bg-green-500",  icon: <Truck size={11} className="text-white" />,  label: "WhatsApp" },
  phone:    { color: "bg-blue-500",   icon: <Phone size={11} className="text-white" />,  label: "Telefon"  },
  web:      { color: "bg-purple-500", icon: <Globe size={11} className="text-white" />,  label: "Web"      },
  other:    { color: "bg-gray-400",   icon: <ShoppingCart size={11} className="text-white" />, label: "Diğer" },
};

const nextStatus: Record<string, string> = { pending: "preparing", preparing: "delivered", delivered: "delivered", cancelled: "cancelled" };

const statusLabels: Record<string, string> = { all: "Tümü", pending: "Beklemede", preparing: "Hazırlanıyor", delivered: "Teslim Edildi", cancelled: "İptal" };

export default function OrdersPage() {
  const qc = useQueryClient();
  const { data: orders = [], isLoading } = useListOrders();
  const updateStatus = useUpdateOrderStatus();
  const { data: summary } = useGetDashboardSummary();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const handleAdvance = (id: number, status: string) => {
    const next = nextStatus[status];
    if (next === status) return;
    updateStatus.mutate({ id, data: { status: next as "pending" | "preparing" | "delivered" | "cancelled" } }, { onSuccess: () => qc.invalidateQueries({ queryKey: getListOrdersQueryKey() }) });
  };

  const filtered = orders
    .filter((o) => filterStatus === "all" || o.status === filterStatus)
    .filter((o) => !search || o.customerName.toLowerCase().includes(search.toLowerCase()) || o.items.toLowerCase().includes(search.toLowerCase()));

  const statusCounts = {
    all: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    preparing: orders.filter((o) => o.status === "preparing").length,
    delivered: orders.filter((o) => o.status === "delivered").length,
    cancelled: orders.filter((o) => o.status === "cancelled").length,
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-5">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <div className="bg-gradient-to-br from-blue-500 to-blue-700 p-2 rounded-xl shadow-md"><ShoppingCart size={20} className="text-white" /></div>
            Siparişler
          </h1>
          <p className="text-gray-400 text-sm mt-0.5">Tüm müşteri siparişlerini yönetin ve takip edin</p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Toplam Sipariş", value: summary?.totalOrders ?? orders.length, from: "from-blue-500", to: "to-blue-700" },
            { label: "Beklemede",      value: statusCounts.pending,                   from: "from-amber-400", to: "to-orange-500" },
            { label: "Hazırlanıyor",   value: statusCounts.preparing,                 from: "from-violet-500", to: "to-purple-700" },
            { label: "Teslim Edildi",  value: statusCounts.delivered,                 from: "from-emerald-400", to: "to-green-600" },
          ].map((c) => (
            <div key={c.label} className={`bg-gradient-to-br ${c.from} ${c.to} rounded-2xl p-4 text-center shadow-lg`}>
              <p className="text-3xl font-bold text-white">{c.value}</p>
              <p className="text-xs text-white/75 mt-0.5 font-medium">{c.label}</p>
            </div>
          ))}
        </div>

        <div className="bg-white border rounded-2xl p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Müşteri veya ürün ara..." className="w-full pl-9 pr-3 py-2.5 text-sm border-2 border-gray-100 rounded-xl bg-white focus:outline-none focus:border-blue-400 transition-all" />
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {(["all", "pending", "preparing", "delivered", "cancelled"] as const).map((s) => (
                <button key={s} onClick={() => setFilterStatus(s)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${filterStatus === s ? "text-white shadow-md" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
                  style={filterStatus === s ? { background: "linear-gradient(135deg,#3b82f6,#1d4ed8)" } : {}}>
                  {statusLabels[s]} ({statusCounts[s]})
                </button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-3">{[1, 2, 3, 4].map((i) => <div key={i} className="h-12 bg-gray-100 animate-pulse rounded-xl" />)}</div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-300">
              <ShoppingCart size={36} className="mb-2" />
              <p className="text-sm">Sipariş bulunamadı</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-gray-50">
                    <th className="text-left pb-3 text-gray-400 font-bold text-xs uppercase tracking-wider">Müşteri</th>
                    <th className="text-left pb-3 text-gray-400 font-bold text-xs uppercase tracking-wider">Kanal</th>
                    <th className="text-left pb-3 text-gray-400 font-bold text-xs uppercase tracking-wider">Ürünler</th>
                    <th className="text-right pb-3 text-gray-400 font-bold text-xs uppercase tracking-wider">Tutar</th>
                    <th className="text-right pb-3 text-gray-400 font-bold text-xs uppercase tracking-wider">Durum</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((order) => {
                    const st = statusConfig[order.status as keyof typeof statusConfig] ?? statusConfig.pending;
                    const ch = channelConfig[order.channel] ?? channelConfig.other;
                    const canAdvance = order.status === "pending" || order.status === "preparing";
                    return (
                      <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 pr-4">
                          <p className="font-bold text-gray-800">{order.customerName}</p>
                          <p className="text-xs text-gray-400">#{order.id}</p>
                        </td>
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-2">
                            <span className={`w-5 h-5 rounded-md flex items-center justify-center ${ch.color}`}>{ch.icon}</span>
                            <span className="text-sm text-gray-600 font-medium">{ch.label}</span>
                          </div>
                        </td>
                        <td className="py-3 pr-4 text-gray-500 max-w-[220px]">
                          <span className="truncate block text-xs">{order.items}</span>
                        </td>
                        <td className="py-3 pr-4 text-right font-bold text-gray-800">
                          {Number(order.total).toFixed(2)} ₺
                        </td>
                        <td className="py-3 text-right">
                          <button
                            onClick={() => canAdvance && handleAdvance(order.id, order.status)}
                            disabled={!canAdvance}
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${st.cls} ${canAdvance ? "cursor-pointer hover:opacity-80" : "cursor-default"} transition-opacity`}
                            title={canAdvance ? "Durumu ilerlet" : ""}
                          >
                            {st.icon} {st.label}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
