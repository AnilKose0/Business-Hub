import { useState } from "react";
import { Layout } from "@/components/layout";
import {
  useListCalendarEvents,
  useListNotifications,
  useMarkNotificationRead,
  useListMails,
  useListOrders,
  useUpdateOrderStatus,
  useListStockItems,
  useListCriticalStock,
  useListContacts,
  useListNotes,
  useCreateNote,
  useDeleteNote,
  useGetDashboardSummary,
  getListNotificationsQueryKey,
  getListOrdersQueryKey,
  getListNotesQueryKey,
  getGetDashboardSummaryQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Bell,
  Mail,
  ShoppingCart,
  Package,
  Users,
  StickyNote,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Info,
  X,
  Plus,
  Trash2,
  Phone,
  MapPin,
  TrendingDown,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
} from "lucide-react";

// ─── CALENDAR WIDGET ────────────────────────────────────────────────────────
function CalendarWidget() {
  const [viewDate, setViewDate] = useState(new Date(2026, 4, 1)); // May 2026
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const { data: events = [] } = useListCalendarEvents();

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = viewDate.toLocaleString("default", { month: "long", year: "numeric" });

  const today = new Date();
  const isToday = (d: number) =>
    today.getFullYear() === year && today.getMonth() === month && today.getDate() === d;

  const monthStr = `${year}-${String(month + 1).padStart(2, "0")}`;
  const eventsForDay = (d: number) =>
    events.filter((e) => e.date.startsWith(`${monthStr}-${String(d).padStart(2, "0")}`));

  const selectedEvents = selectedDay ? eventsForDay(selectedDay) : [];

  const typeColors: Record<string, string> = {
    wholesaler: "bg-blue-500",
    meeting: "bg-purple-500",
    delivery: "bg-green-500",
    note: "bg-amber-500",
    other: "bg-gray-400",
  };

  const typeLabels: Record<string, string> = {
    wholesaler: "Wholesaler",
    meeting: "Meeting",
    delivery: "Delivery",
    note: "Note",
    other: "Other",
  };

  return (
    <div className="bg-card border rounded-xl p-5 h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <div className="w-2 h-2 bg-primary rounded-full" />
          Calendar
        </h3>
        <div className="flex items-center gap-1">
          <button onClick={() => setViewDate(new Date(year, month - 1, 1))}
            className="p-1 hover:bg-muted rounded transition-colors">
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm font-medium text-foreground px-1 min-w-[130px] text-center">{monthName}</span>
          <button onClick={() => setViewDate(new Date(year, month + 1, 1))}
            className="p-1 hover:bg-muted rounded transition-colors">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
          <div key={d} className="text-center text-xs font-medium text-muted-foreground py-1">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-0.5">
        {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dayEvents = eventsForDay(day);
          const active = selectedDay === day;
          const todayClass = isToday(day);
          return (
            <button
              key={day}
              onClick={() => setSelectedDay(active ? null : day)}
              className={`relative p-1.5 rounded-md text-center text-xs transition-colors ${
                active ? "bg-primary text-primary-foreground" :
                todayClass ? "bg-primary/10 text-primary font-bold" :
                "hover:bg-muted text-foreground"
              }`}
            >
              {day}
              {dayEvents.length > 0 && (
                <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 flex gap-0.5">
                  {dayEvents.slice(0, 3).map((ev, idx) => (
                    <span key={idx} className={`w-1 h-1 rounded-full ${active ? "bg-white" : typeColors[ev.type] ?? "bg-gray-400"}`} />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected day events */}
      {selectedDay && (
        <div className="mt-4 border-t pt-3">
          <p className="text-xs font-semibold text-muted-foreground mb-2">May {selectedDay}, 2026</p>
          {selectedEvents.length === 0 ? (
            <p className="text-xs text-muted-foreground italic">No events</p>
          ) : (
            <div className="space-y-1.5">
              {selectedEvents.map((ev) => (
                <div key={ev.id} className="flex items-start gap-2">
                  <span className={`mt-1 w-1.5 h-1.5 rounded-full shrink-0 ${typeColors[ev.type] ?? "bg-gray-400"}`} />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">{ev.title}</p>
                    <p className="text-xs text-muted-foreground">{typeLabels[ev.type]} {ev.time ? `· ${ev.time}` : ""}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1">
        {Object.entries(typeColors).map(([type, color]) => (
          <span key={type} className="flex items-center gap-1 text-xs text-muted-foreground">
            <span className={`w-2 h-2 rounded-full ${color}`} />
            {typeLabels[type]}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── NOTIFICATIONS WIDGET ────────────────────────────────────────────────────
function NotificationsWidget() {
  const qc = useQueryClient();
  const { data: notifications = [], isLoading } = useListNotifications();
  const markRead = useMarkNotificationRead();

  const handleMarkRead = (id: number) => {
    markRead.mutate(
      { id },
      { onSuccess: () => qc.invalidateQueries({ queryKey: getListNotificationsQueryKey() }) }
    );
  };

  const severityConfig = {
    critical: { bg: "bg-red-50 border-red-200", icon: <AlertTriangle size={14} className="text-red-500 shrink-0" />, badge: "bg-red-100 text-red-700" },
    warning: { bg: "bg-amber-50 border-amber-200", icon: <AlertCircle size={14} className="text-amber-500 shrink-0" />, badge: "bg-amber-100 text-amber-700" },
    info: { bg: "bg-blue-50 border-blue-200", icon: <Info size={14} className="text-blue-500 shrink-0" />, badge: "bg-blue-100 text-blue-700" },
  };

  const unread = notifications.filter((n) => !n.isRead);

  return (
    <div className="bg-card border rounded-xl p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4 shrink-0">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <div className="w-2 h-2 bg-red-500 rounded-full" />
          Notifications
          {unread.length > 0 && (
            <span className="bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 font-bold">{unread.length}</span>
          )}
        </h3>
      </div>
      <div className="flex-1 overflow-auto space-y-2 min-h-0">
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => <div key={i} className="h-14 bg-muted animate-pulse rounded-lg" />)}
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
            <CheckCircle size={32} className="mb-2 opacity-40" />
            <p className="text-sm">All clear</p>
          </div>
        ) : (
          notifications.map((n) => {
            const cfg = severityConfig[n.severity as keyof typeof severityConfig] ?? severityConfig.info;
            return (
              <div key={n.id} className={`flex items-start gap-3 p-3 rounded-lg border ${cfg.bg} ${n.isRead ? "opacity-60" : ""}`}>
                <div className="mt-0.5">{cfg.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-xs font-semibold text-foreground truncate">{n.title}</p>
                    <span className={`shrink-0 text-xs px-1.5 py-0.5 rounded font-medium ${cfg.badge}`}>
                      {n.severity}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-tight">{n.message}</p>
                  {n.source && <p className="text-xs text-muted-foreground/60 mt-0.5">via {n.source}</p>}
                </div>
                {!n.isRead && (
                  <button
                    onClick={() => handleMarkRead(n.id)}
                    className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                    title="Mark as read"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// ─── MAIL WIDGET ─────────────────────────────────────────────────────────────
function MailWidget() {
  const { data: mails = [], isLoading } = useListMails();
  const [activeTab, setActiveTab] = useState<string>("all");

  const tabs = ["all", "invoice", "wholesaler", "complaint", "important"];
  const filtered = activeTab === "all" ? mails : mails.filter((m) => m.category === activeTab);

  const catColors: Record<string, string> = {
    invoice: "bg-purple-100 text-purple-700",
    wholesaler: "bg-blue-100 text-blue-700",
    complaint: "bg-red-100 text-red-700",
    important: "bg-amber-100 text-amber-700",
    other: "bg-gray-100 text-gray-700",
  };

  return (
    <div className="bg-card border rounded-xl p-5 flex flex-col h-full">
      <h3 className="font-semibold text-foreground flex items-center gap-2 mb-3 shrink-0">
        <Mail size={16} className="text-primary" />
        Mail
        {mails.filter((m) => !m.isRead).length > 0 && (
          <span className="bg-primary text-primary-foreground text-xs rounded-full px-1.5 py-0.5">{mails.filter((m) => !m.isRead).length}</span>
        )}
      </h3>
      <div className="flex gap-1 mb-3 flex-wrap shrink-0">
        {tabs.map((t) => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={`px-2.5 py-1 rounded-md text-xs font-medium capitalize transition-colors ${activeTab === t ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
            {t}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-auto space-y-1.5 min-h-0">
        {isLoading ? (
          <div className="space-y-2">{[1, 2, 3].map((i) => <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="flex items-center justify-center h-24 text-muted-foreground text-sm">No emails</div>
        ) : (
          filtered.map((mail) => (
            <div key={mail.id} className={`p-3 rounded-lg border transition-colors hover:bg-muted/30 cursor-pointer ${!mail.isRead ? "bg-blue-50/50 border-blue-100" : ""}`}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-foreground truncate flex-1">{mail.from}</span>
                <span className={`shrink-0 ml-2 text-xs px-1.5 py-0.5 rounded font-medium ${catColors[mail.category] ?? catColors.other}`}>
                  {mail.category}
                </span>
              </div>
              <p className="text-xs text-foreground/80 truncate">{mail.subject}</p>
              {mail.aiSummary && (
                <p className="text-xs text-muted-foreground mt-1 italic border-l-2 border-primary/30 pl-2">AI: {mail.aiSummary}</p>
              )}
              <p className="text-xs text-muted-foreground/60 mt-1">{new Date(mail.receivedAt).toLocaleDateString()}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ─── ORDERS WIDGET ───────────────────────────────────────────────────────────
function OrdersWidget() {
  const qc = useQueryClient();
  const { data: orders = [], isLoading } = useListOrders();
  const updateStatus = useUpdateOrderStatus();

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

  const handleAdvance = (id: number, status: string) => {
    const next = nextStatus[status];
    if (next === status) return;
    updateStatus.mutate(
      { id, data: { status: next as "pending" | "preparing" | "delivered" | "cancelled" } },
      { onSuccess: () => qc.invalidateQueries({ queryKey: getListOrdersQueryKey() }) }
    );
  };

  return (
    <div className="bg-card border rounded-xl p-5 flex flex-col h-full">
      <h3 className="font-semibold text-foreground flex items-center gap-2 mb-3 shrink-0">
        <ShoppingCart size={16} className="text-primary" />
        Orders
        {orders.filter((o) => o.status === "pending").length > 0 && (
          <span className="bg-amber-500 text-white text-xs rounded-full px-1.5 py-0.5">{orders.filter((o) => o.status === "pending").length} pending</span>
        )}
      </h3>
      <div className="flex-1 overflow-auto min-h-0">
        {isLoading ? (
          <div className="space-y-2">{[1, 2, 3].map((i) => <div key={i} className="h-14 bg-muted animate-pulse rounded-lg" />)}</div>
        ) : orders.length === 0 ? (
          <div className="flex items-center justify-center h-24 text-muted-foreground text-sm">No orders</div>
        ) : (
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b">
                <th className="text-left pb-2 text-muted-foreground font-medium">Customer</th>
                <th className="text-left pb-2 text-muted-foreground font-medium hidden sm:table-cell">Items</th>
                <th className="text-right pb-2 text-muted-foreground font-medium">Total</th>
                <th className="text-right pb-2 text-muted-foreground font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {orders.map((order) => {
                const st = statusConfig[order.status as keyof typeof statusConfig] ?? statusConfig.pending;
                const canAdvance = order.status === "pending" || order.status === "preparing";
                return (
                  <tr key={order.id} className="hover:bg-muted/20 transition-colors">
                    <td className="py-2 pr-2">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${channelColors[order.channel] ?? channelColors.other}`} />
                        <span className="font-medium text-foreground truncate max-w-[80px]">{order.customerName}</span>
                      </div>
                    </td>
                    <td className="py-2 pr-2 text-muted-foreground hidden sm:table-cell">
                      <span className="truncate max-w-[100px] block">{order.items}</span>
                    </td>
                    <td className="py-2 pr-2 text-right font-medium text-foreground">
                      {Number(order.total).toFixed(0)}
                    </td>
                    <td className="py-2 text-right">
                      <button
                        onClick={() => canAdvance && handleAdvance(order.id, order.status)}
                        disabled={!canAdvance}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-medium ${st.cls} ${canAdvance ? "cursor-pointer hover:opacity-80" : "cursor-default"} transition-opacity`}
                        title={canAdvance ? "Click to advance" : ""}
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
        )}
      </div>
    </div>
  );
}

// ─── STOCK WIDGET ─────────────────────────────────────────────────────────────
function StockWidget() {
  const { data: allStock = [], isLoading } = useListStockItems();
  const { data: criticalItems = [] } = useListCriticalStock();
  const [view, setView] = useState<"critical" | "weekly">("critical");

  const weeklyItems = allStock.filter((s) => s.weeklyOrderQty && Number(s.weeklyOrderQty) > 0);

  return (
    <div className="bg-card border rounded-xl p-5 flex flex-col h-full">
      <div className="flex items-center justify-between mb-3 shrink-0">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <Package size={16} className="text-primary" />
          Stock Control
          {criticalItems.length > 0 && (
            <span className="bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">{criticalItems.length}</span>
          )}
        </h3>
        <div className="flex gap-1">
          <button onClick={() => setView("critical")}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${view === "critical" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
            Critical
          </button>
          <button onClick={() => setView("weekly")}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${view === "weekly" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
            Weekly Order
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto min-h-0 space-y-2">
        {isLoading ? (
          <div className="space-y-2">{[1, 2, 3].map((i) => <div key={i} className="h-12 bg-muted animate-pulse rounded-lg" />)}</div>
        ) : view === "critical" ? (
          criticalItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-24 text-muted-foreground">
              <CheckCircle size={28} className="mb-1.5 opacity-40" />
              <p className="text-sm">All stock levels OK</p>
            </div>
          ) : (
            criticalItems.map((item) => {
              const pct = (Number(item.currentStock) / Number(item.minStock)) * 100;
              return (
                <div key={item.id} className="p-3 rounded-lg bg-red-50 border border-red-200">
                  <div className="flex justify-between items-start mb-1.5">
                    <div>
                      <p className="text-xs font-semibold text-foreground">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.wholesaler}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-red-600">{Number(item.currentStock)} / {Number(item.minStock)} {item.unit}</p>
                      <div className="flex items-center gap-1 text-xs text-red-500 mt-0.5">
                        <TrendingDown size={10} />
                        <span>Critical</span>
                      </div>
                    </div>
                  </div>
                  <div className="w-full bg-red-200 rounded-full h-1.5">
                    <div className="bg-red-500 h-1.5 rounded-full transition-all" style={{ width: `${Math.min(pct, 100)}%` }} />
                  </div>
                </div>
              );
            })
          )
        ) : (
          weeklyItems.length === 0 ? (
            <div className="flex items-center justify-center h-24 text-muted-foreground text-sm">No weekly orders</div>
          ) : (
            weeklyItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                <div>
                  <p className="text-xs font-semibold text-foreground">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{item.wholesaler}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-primary">{Number(item.weeklyOrderQty)} {item.unit}</p>
                  <p className="text-xs text-muted-foreground">to order</p>
                </div>
              </div>
            ))
          )
        )}
      </div>
    </div>
  );
}

// ─── CONTACTS WIDGET ──────────────────────────────────────────────────────────
function ContactsWidget() {
  const { data: contacts = [], isLoading } = useListContacts();
  const [filter, setFilter] = useState<"all" | "employee" | "wholesaler">("all");

  const filtered = filter === "all" ? contacts : contacts.filter((c) => c.type === filter);

  return (
    <div className="bg-card border rounded-xl p-5 flex flex-col h-full">
      <div className="flex items-center justify-between mb-3 shrink-0">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <Users size={16} className="text-primary" />
          Contacts
        </h3>
        <div className="flex gap-1">
          {(["all", "employee", "wholesaler"] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-2 py-0.5 rounded text-xs font-medium capitalize transition-colors ${filter === f ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
              {f}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-auto min-h-0 space-y-2">
        {isLoading ? (
          <div className="space-y-2">{[1, 2, 3].map((i) => <div key={i} className="h-14 bg-muted animate-pulse rounded-lg" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="flex items-center justify-center h-24 text-muted-foreground text-sm">No contacts</div>
        ) : (
          filtered.map((c) => (
            <div key={c.id} className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/30 transition-colors">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0 ${c.type === "employee" ? "bg-primary" : "bg-purple-600"}`}>
                {c.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-semibold text-foreground truncate">{c.name}</p>
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium shrink-0 ${c.type === "employee" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"}`}>
                    {c.type === "employee" ? "Emp" : "WS"}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground truncate">{c.role}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <Phone size={10} className="text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">{c.phone}</p>
                </div>
                {c.address && (
                  <div className="flex items-center gap-1 mt-0.5">
                    <MapPin size={10} className="text-muted-foreground" />
                    <p className="text-xs text-muted-foreground truncate">{c.address}</p>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ─── NOTES WIDGET ─────────────────────────────────────────────────────────────
function NotesWidget() {
  const qc = useQueryClient();
  const { data: notes = [], isLoading } = useListNotes();
  const createNote = useCreateNote();
  const deleteNote = useDeleteNote();
  const [newContent, setNewContent] = useState("");

  const handleAdd = () => {
    if (!newContent.trim()) return;
    createNote.mutate(
      { data: { content: newContent.trim() } },
      {
        onSuccess: () => {
          setNewContent("");
          qc.invalidateQueries({ queryKey: getListNotesQueryKey() });
        },
      }
    );
  };

  const handleDelete = (id: number) => {
    deleteNote.mutate(
      { id },
      { onSuccess: () => qc.invalidateQueries({ queryKey: getListNotesQueryKey() }) }
    );
  };

  return (
    <div className="bg-card border rounded-xl p-5 flex flex-col h-full">
      <h3 className="font-semibold text-foreground flex items-center gap-2 mb-3 shrink-0">
        <StickyNote size={16} className="text-primary" />
        Personal Notes
      </h3>
      <div className="flex gap-2 mb-3 shrink-0">
        <input
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder="Add a note or task..."
          className="flex-1 text-xs px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary bg-background"
        />
        <button
          onClick={handleAdd}
          disabled={createNote.isPending || !newContent.trim()}
          className="bg-primary text-primary-foreground px-3 py-2 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          <Plus size={14} />
        </button>
      </div>
      <div className="flex-1 overflow-auto min-h-0 space-y-1.5">
        {isLoading ? (
          <div className="space-y-2">{[1, 2, 3].map((i) => <div key={i} className="h-10 bg-muted animate-pulse rounded-lg" />)}</div>
        ) : notes.length === 0 ? (
          <div className="flex items-center justify-center h-24 text-muted-foreground text-sm">No notes yet</div>
        ) : (
          notes.map((note) => (
            <div key={note.id} className="flex items-start gap-2 p-2.5 rounded-lg bg-amber-50/60 border border-amber-100 group">
              <div className="w-1 h-1 rounded-full bg-amber-400 mt-1.5 shrink-0" />
              <p className="text-xs text-foreground flex-1 leading-relaxed">{note.content}</p>
              <button
                onClick={() => handleDelete(note.id)}
                className="shrink-0 text-muted-foreground/40 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ─── SUMMARY BAR ─────────────────────────────────────────────────────────────
function SummaryBar() {
  const { data: summary } = useGetDashboardSummary();

  const stats = [
    { label: "Total Orders", value: summary?.totalOrders ?? "–", color: "text-primary" },
    { label: "Pending", value: summary?.pendingOrders ?? "–", color: "text-amber-600" },
    { label: "Critical Stock", value: summary?.criticalStockCount ?? "–", color: "text-red-600" },
    { label: "Unread Alerts", value: summary?.unreadNotifications ?? "–", color: "text-orange-600" },
    { label: "Unread Mail", value: summary?.unreadMails ?? "–", color: "text-blue-600" },
  ];

  return (
    <div className="grid grid-cols-5 gap-3 mb-6">
      {stats.map((s) => (
        <div key={s.label} className="bg-card border rounded-xl p-4 text-center">
          <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
        </div>
      ))}
    </div>
  );
}

// ─── DASHBOARD PAGE ───────────────────────────────────────────────────────────
export default function DashboardPage() {
  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
        </div>

        <SummaryBar />

        {/* Top row: Calendar + Notifications */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4" style={{ minHeight: "340px" }}>
          <CalendarWidget />
          <NotificationsWidget />
        </div>

        {/* Bottom grid: 5 widgets */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4" style={{ minHeight: "380px" }}>
          <MailWidget />
          <OrdersWidget />
          <StockWidget />
          <ContactsWidget />
          <div className="sm:col-span-2 xl:col-span-1">
            <NotesWidget />
          </div>
        </div>
      </div>
    </Layout>
  );
}
