import { useState } from "react";
import { Layout } from "@/components/layout";
import {
  useListOrders,
  useUpdateOrderStatus,
  getListOrdersQueryKey,
  useGetDashboardSummary,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import {
  ShoppingCart,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
} from "lucide-react";

const statusConfig = {
  pending: { label: "Pending", cls: "bg-amber-100 text-amber-800", icon: <Clock size={12} /> },
  preparing: { label: "Preparing", cls: "bg-blue-100 text-blue-800", icon: <AlertCircle size={12} /> },
  delivered: { label: "Delivered", cls: "bg-green-100 text-green-800", icon: <CheckCircle size={12} /> },
  cancelled: { label: "Cancelled", cls: "bg-red-100 text-red-800", icon: <XCircle size={12} /> },
};

const channelColors: Record<string, string> = {
  whatsapp: "bg-green-500",
  phone: "bg-blue-500",
  web: "bg-purple-500",
  other: "bg-gray-400",
};

const nextStatus: Record<string, string> = {
  pending: "preparing",
  preparing: "delivered",
  delivered: "delivered",
  cancelled: "cancelled",
};

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
    updateStatus.mutate(
      { id, data: { status: next as "pending" | "preparing" | "delivered" | "cancelled" } },
      { onSuccess: () => qc.invalidateQueries({ queryKey: getListOrdersQueryKey() }) }
    );
  };

  const filtered = orders
    .filter((o) => filterStatus === "all" || o.status === filterStatus)
    .filter(
      (o) =>
        !search ||
        o.customerName.toLowerCase().includes(search.toLowerCase()) ||
        o.items.toLowerCase().includes(search.toLowerCase())
    );

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
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <ShoppingCart size={22} className="text-primary" />
            Orders
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Manage and track all customer orders
          </p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-card border rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-primary">{summary?.totalOrders ?? orders.length}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Total Orders</p>
          </div>
          <div className="bg-card border rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-amber-600">{statusCounts.pending}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Pending</p>
          </div>
          <div className="bg-card border rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{statusCounts.preparing}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Preparing</p>
          </div>
          <div className="bg-card border rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{statusCounts.delivered}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Delivered</p>
          </div>
        </div>

        <div className="bg-card border rounded-xl p-5">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by customer or items..."
                className="w-full pl-9 pr-3 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {(["all", "pending", "preparing", "delivered", "cancelled"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium capitalize transition-colors ${
                    filterStatus === s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {s} ({statusCounts[s]})
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="space-y-3">{[1, 2, 3, 4, 5].map((i) => <div key={i} className="h-12 bg-muted animate-pulse rounded-lg" />)}</div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
              <ShoppingCart size={36} className="mb-2 opacity-20" />
              <p className="text-sm">No orders found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left pb-3 text-muted-foreground font-medium text-xs uppercase tracking-wider">Customer</th>
                    <th className="text-left pb-3 text-muted-foreground font-medium text-xs uppercase tracking-wider">Channel</th>
                    <th className="text-left pb-3 text-muted-foreground font-medium text-xs uppercase tracking-wider">Items</th>
                    <th className="text-right pb-3 text-muted-foreground font-medium text-xs uppercase tracking-wider">Total</th>
                    <th className="text-right pb-3 text-muted-foreground font-medium text-xs uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filtered.map((order) => {
                    const st = statusConfig[order.status as keyof typeof statusConfig] ?? statusConfig.pending;
                    const canAdvance = order.status === "pending" || order.status === "preparing";
                    return (
                      <tr key={order.id} className="hover:bg-muted/20 transition-colors">
                        <td className="py-3 pr-4">
                          <p className="font-medium text-foreground">{order.customerName}</p>
                          <p className="text-xs text-muted-foreground">#{order.id}</p>
                        </td>
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${channelColors[order.channel] ?? channelColors.other}`} />
                            <span className="capitalize text-sm">{order.channel}</span>
                          </div>
                        </td>
                        <td className="py-3 pr-4 text-muted-foreground max-w-[240px]">
                          <span className="truncate block">{order.items}</span>
                        </td>
                        <td className="py-3 pr-4 text-right font-semibold text-foreground">
                          {Number(order.total).toFixed(2)} TL
                        </td>
                        <td className="py-3 text-right">
                          <button
                            onClick={() => canAdvance && handleAdvance(order.id, order.status)}
                            disabled={!canAdvance}
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${st.cls} ${canAdvance ? "cursor-pointer hover:opacity-80" : "cursor-default"} transition-opacity`}
                            title={canAdvance ? "Click to advance status" : ""}
                          >
                            {st.icon}
                            {st.label}
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
