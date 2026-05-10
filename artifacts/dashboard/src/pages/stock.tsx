import { useState } from "react";
import { Layout } from "@/components/layout";
import { useListStockItems, useListCriticalStock } from "@workspace/api-client-react";
import { Package, TrendingDown, CheckCircle, AlertTriangle, Search, Building2 } from "lucide-react";

export default function StockPage() {
  const { data: allStock = [], isLoading } = useListStockItems();
  const { data: criticalItems = [] } = useListCriticalStock();
  const [view, setView] = useState<"all" | "critical" | "weekly">("all");
  const [search, setSearch] = useState("");

  const filtered = allStock
    .filter((s) => {
      if (view === "critical") return s.isCritical;
      if (view === "weekly") return s.weeklyOrderQty && Number(s.weeklyOrderQty) > 0;
      return true;
    })
    .filter((s) => !search || s.name.toLowerCase().includes(search.toLowerCase()) || (s.wholesaler ?? "").toLowerCase().includes(search.toLowerCase()));

  const viewLabels = { all: "Tümü", critical: "Kritik", weekly: "Haftalık Sipariş" };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-5">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <div className="bg-gradient-to-br from-emerald-400 to-green-600 p-2 rounded-xl shadow-md"><Package size={20} className="text-white" /></div>
            Stok Kontrolü
          </h1>
          <p className="text-gray-400 text-sm mt-0.5">Stok seviyelerini ve haftalık sipariş miktarlarını takip edin</p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
          {[
            { label: "Toplam Ürün",   value: allStock.length,                         from: "from-blue-500",    to: "to-blue-700"   },
            { label: "Kritik Stok",   value: criticalItems.length,                    from: "from-red-500",     to: "to-rose-700"   },
            { label: "Stok Yeterli",  value: allStock.length - criticalItems.length,  from: "from-emerald-400", to: "to-green-600"  },
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
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Ürün veya toptancı ara..." className="w-full pl-9 pr-3 py-2.5 text-sm border-2 border-gray-100 rounded-xl focus:outline-none focus:border-emerald-400 transition-all" />
            </div>
            <div className="flex gap-1.5">
              {(["all", "critical", "weekly"] as const).map((v) => (
                <button key={v} onClick={() => setView(v)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${view === v ? "text-white shadow-md" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
                  style={view === v ? { background: "linear-gradient(135deg,#10b981,#059669)" } : {}}>
                  {viewLabels[v]}
                </button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">{[1, 2, 3, 4].map((i) => <div key={i} className="h-24 bg-gray-100 animate-pulse rounded-2xl" />)}</div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-300">
              <CheckCircle size={36} className="mb-2" />
              <p className="text-sm">Tüm stok seviyeleri yeterli</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filtered.map((item) => {
                const pct = Math.min((Number(item.currentStock) / Math.max(Number(item.minStock), 1)) * 100, 100);
                const isCritical = item.isCritical;
                return (
                  <div key={item.id} className={`p-4 rounded-2xl border-2 ${isCritical ? "bg-red-50 border-red-200" : "bg-slate-50 border-gray-100"}`}>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-gray-800">{item.name}</p>
                          {isCritical && (
                            <span className="flex items-center gap-1 text-xs text-white font-bold bg-gradient-to-r from-red-500 to-rose-600 px-2 py-0.5 rounded-full shadow-sm">
                              <AlertTriangle size={10} /> Kritik
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Building2 size={11} className="text-gray-400" />
                          <p className="text-xs text-gray-400">{item.wholesaler}</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className={`text-xl font-bold ${isCritical ? "text-red-600" : "text-gray-800"}`}>
                          {Number(item.currentStock)}<span className="text-xs font-normal text-gray-400 ml-1">{item.unit}</span>
                        </p>
                        <p className="text-xs text-gray-400">min: {Number(item.minStock)} {item.unit}</p>
                      </div>
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                      <div
                        className={`h-2.5 rounded-full transition-all ${isCritical ? "bg-gradient-to-r from-red-500 to-rose-600" : pct < 75 ? "bg-gradient-to-r from-amber-400 to-orange-500" : "bg-gradient-to-r from-emerald-400 to-green-500"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>

                    {item.weeklyOrderQty && Number(item.weeklyOrderQty) > 0 && (
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-400">Haftalık sipariş miktarı</span>
                        <span className="text-xs font-bold text-emerald-600">{Number(item.weeklyOrderQty)} {item.unit}</span>
                      </div>
                    )}
                    {isCritical && (
                      <div className="flex items-center gap-1 mt-2 text-red-500">
                        <TrendingDown size={12} />
                        <span className="text-xs font-bold">Acil yeniden sipariş gerekiyor</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
