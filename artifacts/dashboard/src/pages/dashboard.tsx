import { useState } from "react";
import { Layout } from "@/components/layout";
import {
  useListNotifications,
  useMarkNotificationRead,
  useListNotes,
  useCreateNote,
  useDeleteNote,
  useGetDashboardSummary,
  useCreateCalendarEvent,
  getListNotificationsQueryKey,
  getListNotesQueryKey,
  getGetDashboardSummaryQueryKey,
  getListCalendarEventsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Bell,
  StickyNote,
  AlertTriangle,
  Info,
  X,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  ShoppingCart,
  Package,
  Mail,
  TriangleAlert,
  CalendarPlus,
} from "lucide-react";
import { Link } from "wouter";

// ─── SUMMARY BAR ─────────────────────────────────────────────────────────────
function SummaryBar() {
  const { data: summary } = useGetDashboardSummary();

  const stats = [
    {
      label: "Toplam Sipariş", value: summary?.totalOrders ?? "–",
      href: "/orders",
      from: "from-blue-500", to: "to-blue-700",
      icon: <ShoppingCart size={20} className="text-white" />,
    },
    {
      label: "Beklemede", value: summary?.pendingOrders ?? "–",
      href: "/orders",
      from: "from-amber-400", to: "to-orange-500",
      icon: <AlertCircle size={20} className="text-white" />,
    },
    {
      label: "Kritik Stok", value: summary?.criticalStockCount ?? "–",
      href: "/stock",
      from: "from-red-500", to: "to-rose-700",
      icon: <Package size={20} className="text-white" />,
    },
    {
      label: "Okunmamış Uyarı", value: summary?.unreadNotifications ?? "–",
      href: "/dashboard",
      from: "from-purple-500", to: "to-violet-700",
      icon: <TriangleAlert size={20} className="text-white" />,
    },
    {
      label: "Okunmamış Posta", value: summary?.unreadMails ?? "–",
      href: "/mail",
      from: "from-teal-400", to: "to-cyan-600",
      icon: <Mail size={20} className="text-white" />,
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
      {stats.map((s) => (
        <Link key={s.label} href={s.href}>
          <div className={`bg-gradient-to-br ${s.from} ${s.to} rounded-2xl p-4 shadow-lg hover:scale-105 transition-transform cursor-pointer`}>
            <div className="flex items-center justify-between mb-2">
              <div className="bg-white/20 rounded-lg p-1.5">{s.icon}</div>
            </div>
            <p className="text-3xl font-bold text-white">{s.value}</p>
            <p className="text-xs text-white/75 mt-0.5 font-medium">{s.label}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}

// ─── ADD EVENT MODAL ─────────────────────────────────────────────────────────
const EVENT_TYPES = [
  { value: "meeting", label: "Toplantı" },
  { value: "delivery", label: "Teslimat" },
  { value: "wholesaler", label: "Toptancı Ziyareti" },
  { value: "note", label: "Not / Arama" },
  { value: "other", label: "Diğer" },
] as const;

function AddEventModal({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();
  const createEvent = useCreateCalendarEvent();
  const today = new Date().toISOString().split("T")[0];

  const [form, setForm] = useState({ title: "", date: today, time: "", type: "meeting" as string, description: "" });
  const [error, setError] = useState("");
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const buildGoogleCalendarUrl = () => {
    const start = form.time
      ? `${form.date.replace(/-/g, "")}T${form.time.replace(":", "")}00`
      : form.date.replace(/-/g, "");
    const end = form.time
      ? `${form.date.replace(/-/g, "")}T${String(Number(form.time.split(":")[0]) + 1).padStart(2, "0")}${form.time.split(":")[1]}00`
      : form.date.replace(/-/g, "");
    const params = new URLSearchParams({ action: "TEMPLATE", text: form.title, dates: `${start}/${end}`, ...(form.description ? { details: form.description } : {}) });
    return `https://calendar.google.com/calendar/r/eventedit?${params.toString()}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.date) { setError("Başlık ve tarih zorunludur."); return; }
    createEvent.mutate(
      { data: { title: form.title.trim(), date: form.date, time: form.time || null, type: form.type as "meeting" | "delivery" | "wholesaler" | "note" | "other", description: form.description || null } },
      {
        onSuccess: () => { qc.invalidateQueries({ queryKey: getListCalendarEventsQueryKey() }); window.open(buildGoogleCalendarUrl(), "_blank", "noopener"); onClose(); },
        onError: () => setError("Etkinlik kaydedilemedi. Lütfen tekrar deneyin."),
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 text-white" style={{ background: "linear-gradient(135deg,#f97316,#ef4444)" }}>
          <div className="flex items-center gap-2 font-bold"><CalendarPlus size={18} /> Etkinlik Ekle</div>
          <button onClick={onClose} className="hover:opacity-70 transition-opacity"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{error}</p>}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">Etkinlik Başlığı *</label>
            <input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="örn. Toptancı Ziyareti - Metro" className="w-full px-3 py-2.5 text-sm border-2 border-gray-100 rounded-xl bg-white focus:outline-none focus:border-orange-400 transition-all" autoFocus />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Tarih *</label>
              <input type="date" value={form.date} onChange={(e) => set("date", e.target.value)} className="w-full px-3 py-2.5 text-sm border-2 border-gray-100 rounded-xl focus:outline-none focus:border-orange-400 transition-all" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Saat (isteğe bağlı)</label>
              <input type="time" value={form.time} onChange={(e) => set("time", e.target.value)} className="w-full px-3 py-2.5 text-sm border-2 border-gray-100 rounded-xl focus:outline-none focus:border-orange-400 transition-all" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">Tür</label>
            <select value={form.type} onChange={(e) => set("type", e.target.value)} className="w-full px-3 py-2.5 text-sm border-2 border-gray-100 rounded-xl focus:outline-none focus:border-orange-400 transition-all">
              {EVENT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">Açıklama (isteğe bağlı)</label>
            <textarea value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Etkinlik hakkında detay ekleyin..." rows={2} className="w-full px-3 py-2.5 text-sm border-2 border-gray-100 rounded-xl focus:outline-none focus:border-orange-400 transition-all resize-none" />
          </div>
          <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl">
            <p className="text-xs text-blue-700">ℹ️ Bu etkinlik kontrol panelinize kaydedilecek <strong>ve</strong> onaylamanız için Google Takvim açılacak.</p>
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 text-sm font-semibold border-2 border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">İptal</button>
            <button type="submit" disabled={createEvent.isPending} className="flex-1 px-4 py-2.5 text-sm font-bold text-white rounded-xl disabled:opacity-50 transition-opacity flex items-center justify-center gap-2 shadow-lg" style={{ background: "linear-gradient(135deg,#f97316,#ef4444)" }}>
              <CalendarPlus size={14} />
              {createEvent.isPending ? "Kaydediliyor…" : "Takvime Ekle"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── GOOGLE CALENDAR ──────────────────────────────────────────────────────────
function GoogleCalendarWidget() {
  const [showModal, setShowModal] = useState(false);
  return (
    <>
      {showModal && <AddEventModal onClose={() => setShowModal(false)} />}
      <div className="bg-white border rounded-2xl overflow-hidden h-full flex flex-col shadow-sm" style={{ minHeight: 420 }}>
        <div className="flex items-center justify-between px-5 py-3 border-b shrink-0 bg-gradient-to-r from-blue-50 to-indigo-50">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-blue-500 rounded-full" />
            Google Takvim
          </h3>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowModal(true)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white rounded-lg shadow-md transition-all hover:scale-105" style={{ background: "linear-gradient(135deg,#f97316,#ef4444)" }}>
              <CalendarPlus size={13} /> Etkinlik Ekle
            </button>
            <a href="https://calendar.google.com" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline font-medium">Aç ↗</a>
          </div>
        </div>
        <iframe src="https://calendar.google.com/calendar/embed?height=500&wkst=2&bgcolor=%23ffffff&ctz=Europe%2FIstanbul&showTitle=0&showNav=1&showDate=1&showPrint=0&showTabs=0&showCalendars=0&showTz=0&mode=MONTH" className="flex-1 w-full border-0" style={{ minHeight: 380 }} title="Google Takvim" />
      </div>
    </>
  );
}

// ─── NOTIFICATIONS WIDGET ────────────────────────────────────────────────────
function NotificationsWidget() {
  const qc = useQueryClient();
  const { data: notifications = [], isLoading } = useListNotifications();
  const markRead = useMarkNotificationRead();

  const handleMarkRead = (id: number) => {
    markRead.mutate({ id }, { onSuccess: () => { qc.invalidateQueries({ queryKey: getListNotificationsQueryKey() }); qc.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() }); } });
  };

  const severityConfig = {
    critical: { bg: "bg-red-50 border-red-200", icon: <AlertTriangle size={14} className="text-red-500 shrink-0" />, badge: "bg-red-100 text-red-700", label: "Kritik" },
    warning: { bg: "bg-amber-50 border-amber-200", icon: <AlertCircle size={14} className="text-amber-500 shrink-0" />, badge: "bg-amber-100 text-amber-700", label: "Uyarı" },
    info: { bg: "bg-blue-50 border-blue-200", icon: <Info size={14} className="text-blue-500 shrink-0" />, badge: "bg-blue-100 text-blue-700", label: "Bilgi" },
  };

  const unread = notifications.filter((n) => !n.isRead);

  return (
    <div className="bg-white border rounded-2xl p-5 h-full flex flex-col shadow-sm">
      <div className="flex items-center justify-between mb-4 shrink-0">
        <h3 className="font-bold text-gray-800 flex items-center gap-2">
          <div className="bg-red-100 p-1.5 rounded-lg"><Bell size={14} className="text-red-600" /></div>
          Bildirimler
          {unread.length > 0 && <span className="bg-gradient-to-r from-red-500 to-rose-600 text-white text-xs rounded-full px-2 py-0.5 font-bold shadow-sm">{unread.length}</span>}
        </h3>
      </div>
      <div className="flex-1 overflow-auto space-y-2 min-h-0">
        {isLoading ? (
          <div className="space-y-2">{[1, 2, 3].map((i) => <div key={i} className="h-14 bg-gray-100 animate-pulse rounded-xl" />)}</div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-gray-400">
            <CheckCircle size={32} className="mb-2 opacity-40" />
            <p className="text-sm">Tüm bildirimler okundu</p>
          </div>
        ) : (
          notifications.map((n) => {
            const cfg = severityConfig[n.severity as keyof typeof severityConfig] ?? severityConfig.info;
            return (
              <div key={n.id} className={`flex items-start gap-3 p-3 rounded-xl border ${cfg.bg} ${n.isRead ? "opacity-50" : ""}`}>
                <div className="mt-0.5">{cfg.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-xs font-bold text-gray-800 truncate">{n.title}</p>
                    <span className={`shrink-0 text-xs px-1.5 py-0.5 rounded-full font-bold ${cfg.badge}`}>{cfg.label}</span>
                  </div>
                  <p className="text-xs text-gray-500 leading-tight">{n.message}</p>
                  {n.source && <p className="text-xs text-gray-400 mt-0.5">via {n.source}</p>}
                </div>
                {!n.isRead && (
                  <button onClick={() => handleMarkRead(n.id)} className="shrink-0 text-gray-300 hover:text-gray-600 transition-colors" title="Okundu işaretle"><X size={14} /></button>
                )}
              </div>
            );
          })
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
    createNote.mutate({ data: { content: newContent.trim() } }, { onSuccess: () => { setNewContent(""); qc.invalidateQueries({ queryKey: getListNotesQueryKey() }); } });
  };

  const handleDelete = (id: number) => deleteNote.mutate({ id }, { onSuccess: () => qc.invalidateQueries({ queryKey: getListNotesQueryKey() }) });

  return (
    <div className="bg-white border rounded-2xl p-5 flex flex-col h-full shadow-sm">
      <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-3 shrink-0">
        <div className="bg-amber-100 p-1.5 rounded-lg"><StickyNote size={14} className="text-amber-600" /></div>
        Kişisel Notlar
      </h3>
      <div className="flex gap-2 mb-3 shrink-0">
        <input
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder="Not veya görev ekleyin..."
          className="flex-1 text-xs px-3 py-2 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-amber-400 bg-white transition-all"
        />
        <button onClick={handleAdd} disabled={createNote.isPending || !newContent.trim()} className="text-white px-3 py-2 rounded-xl disabled:opacity-50 transition-opacity shadow-md hover:scale-105 transition-transform" style={{ background: "linear-gradient(135deg,#f59e0b,#f97316)" }}>
          <Plus size={14} />
        </button>
      </div>
      <div className="flex-1 overflow-auto min-h-0 space-y-1.5">
        {isLoading ? (
          <div className="space-y-2">{[1, 2, 3].map((i) => <div key={i} className="h-10 bg-gray-100 animate-pulse rounded-xl" />)}</div>
        ) : notes.length === 0 ? (
          <div className="flex items-center justify-center h-24 text-gray-400 text-sm">Henüz not yok</div>
        ) : (
          notes.map((note) => (
            <div key={note.id} className="flex items-start gap-2 p-2.5 rounded-xl bg-amber-50 border border-amber-100 group">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
              <p className="text-xs text-gray-700 flex-1 leading-relaxed">{note.content}</p>
              <button onClick={() => handleDelete(note.id)} className="shrink-0 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={13} /></button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ─── DASHBOARD PAGE ───────────────────────────────────────────────────────────
export default function DashboardPage() {
  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-5">
          <h1 className="text-2xl font-bold text-gray-900">Kontrol Paneli</h1>
          <p className="text-gray-400 text-sm mt-0.5">
            {new Date().toLocaleDateString("tr-TR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>

        <SummaryBar />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4" style={{ minHeight: 460 }}>
          <div className="lg:col-span-2"><GoogleCalendarWidget /></div>
          <div className="flex flex-col gap-4">
            <div className="flex-1" style={{ minHeight: 200 }}><NotificationsWidget /></div>
            <div className="flex-1" style={{ minHeight: 200 }}><NotesWidget /></div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
