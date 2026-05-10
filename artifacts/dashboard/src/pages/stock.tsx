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

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-5">
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Package size={22} className="text-primary" />
            Stock Control
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Monitor inventory levels and weekly order quantities
          </p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
          <div className="bg-card border rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-primary">{allStock.length}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Total Products</p>
          </div>
          <div className="bg-card border rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-red-600">{criticalItems.length}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Critical Stock</p>
          </div>
          <div className="bg-card border rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{allStock.length - criticalItems.length}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Stock OK</p>
          </div>
        </div>

        <div className="bg-card border rounded-xl p-5">
          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by product or wholesaler..."
                className="w-full pl-9 pr-3 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="flex gap-1.5">
              {(["all", "critical", "weekly"] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium capitalize transition-colors ${
                    view === v ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {v === "weekly" ? "Weekly Order" : v}
                </button>
              ))}
            </div>
          </div>

          {/* Stock list */}
          {isLoading ? (
            <div className="space-y-3">{[1, 2, 3, 4].map((i) => <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />)}</div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
              <CheckCircle size={36} className="mb-2 opacity-20" />
              <p className="text-sm">All stock levels OK</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filtered.map((item) => {
                const pct = Math.min((Number(item.currentStock) / Math.max(Number(item.minStock), 1)) * 100, 100);
                const isCritical = item.isCritical;
                return (
                  <div
                    key={item.id}
                    className={`p-4 rounded-xl border ${isCritical ? "bg-red-50 border-red-200" : "bg-muted/20"}`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-foreground text-sm">{item.name}</p>
                          {isCritical && (
                            <span className="flex items-center gap-1 text-xs text-red-600 font-medium bg-red-100 px-1.5 py-0.5 rounded">
                              <AlertTriangle size={10} />
                              Critical
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Building2 size={11} className="text-muted-foreground" />
                          <p className="text-xs text-muted-foreground">{item.wholesaler}</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className={`text-lg font-bold ${isCritical ? "text-red-600" : "text-foreground"}`}>
                          {Number(item.currentStock)}
                          <span className="text-xs font-normal text-muted-foreground ml-1">{item.unit}</span>
                        </p>
                        <p className="text-xs text-muted-foreground">min: {Number(item.minStock)} {item.unit}</p>
                      </div>
                    </div>

                    {/* Stock bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                      <div
                        className={`h-2 rounded-full transition-all ${isCritical ? "bg-red-500" : pct < 75 ? "bg-amber-400" : "bg-green-500"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>

                    {item.weeklyOrderQty && Number(item.weeklyOrderQty) > 0 && (
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-muted-foreground">Weekly order qty</span>
                        <span className="text-xs font-semibold text-primary">
                          {Number(item.weeklyOrderQty)} {item.unit}
                        </span>
                      </div>
                    )}

                    {isCritical && (
                      <div className="flex items-center gap-1 mt-2 text-red-600">
                        <TrendingDown size={12} />
                        <span className="text-xs font-medium">Needs immediate reorder</span>
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
