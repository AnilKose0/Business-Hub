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
    { label: "Total Orders", value: summary?.totalOrders ?? "–", color: "text-primary", icon: <ShoppingCart size={18} />, href: "/orders" },
    { label: "Pending", value: summary?.pendingOrders ?? "–", color: "text-amber-600", icon: <AlertCircle size={18} />, href: "/orders" },
    { label: "Critical Stock", value: summary?.criticalStockCount ?? "–", color: "text-red-600", icon: <Package size={18} />, href: "/stock" },
    { label: "Unread Alerts", value: summary?.unreadNotifications ?? "–", color: "text-orange-600", icon: <TriangleAlert size={18} />, href: "/dashboard" },
    { label: "Unread Mail", value: summary?.unreadMails ?? "–", color: "text-blue-600", icon: <Mail size={18} />, href: "/mail" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
      {stats.map((s) => (
        <Link key={s.label} href={s.href}>
          <div className="bg-card border rounded-xl p-4 text-center hover:border-primary/40 hover:shadow-sm transition-all cursor-pointer group">
            <div className={`flex justify-center mb-1 ${s.color} opacity-60 group-hover:opacity-100 transition-opacity`}>
              {s.icon}
            </div>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}

// ─── ADD EVENT MODAL ─────────────────────────────────────────────────────────
const EVENT_TYPES = [
  { value: "meeting", label: "Meeting" },
  { value: "delivery", label: "Delivery" },
  { value: "wholesaler", label: "Wholesaler Visit" },
  { value: "note", label: "Note / Call" },
  { value: "other", label: "Other" },
] as const;

function AddEventModal({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();
  const createEvent = useCreateCalendarEvent();
  const today = new Date().toISOString().split("T")[0];

  const [form, setForm] = useState({
    title: "",
    date: today,
    time: "",
    type: "meeting" as string,
    description: "",
  });
  const [error, setError] = useState("");

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const buildGoogleCalendarUrl = () => {
    const start = form.time
      ? `${form.date.replace(/-/g, "")}T${form.time.replace(":", "")}00`
      : form.date.replace(/-/g, "");
    const end = form.time
      ? `${form.date.replace(/-/g, "")}T${String(Number(form.time.split(":")[0]) + 1).padStart(2, "0")}${form.time.split(":")[1]}00`
      : form.date.replace(/-/g, "");
    const params = new URLSearchParams({
      action: "TEMPLATE",
      text: form.title,
      dates: `${start}/${end}`,
      ...(form.description ? { details: form.description } : {}),
    });
    return `https://calendar.google.com/calendar/r/eventedit?${params.toString()}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.date) {
      setError("Title and date are required.");
      return;
    }
    createEvent.mutate(
      {
        data: {
          title: form.title.trim(),
          date: form.date,
          time: form.time || null,
          type: form.type as "meeting" | "delivery" | "wholesaler" | "note" | "other",
          description: form.description || null,
        },
      },
      {
        onSuccess: () => {
          qc.invalidateQueries({ queryKey: getListCalendarEventsQueryKey() });
          window.open(buildGoogleCalendarUrl(), "_blank", "noopener");
          onClose();
        },
        onError: () => setError("Failed to save event. Please try again."),
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-card border rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-primary text-primary-foreground">
          <div className="flex items-center gap-2 font-semibold">
            <CalendarPlus size={18} />
            Add Event
          </div>
          <button onClick={onClose} className="hover:opacity-70 transition-opacity">
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
          )}

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">Event Title *</label>
            <input
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="e.g. Wholesaler Visit - Metro"
              className="w-full px-3 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/40"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">Date *</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => set("date", e.target.value)}
                className="w-full px-3 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">Time (optional)</label>
              <input
                type="time"
                value={form.time}
                onChange={(e) => set("time", e.target.value)}
                className="w-full px-3 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">Type</label>
            <select
              value={form.type}
              onChange={(e) => set("type", e.target.value)}
              className="w-full px-3 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              {EVENT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">Description (optional)</label>
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Add details about this event..."
              rows={2}
              className="w-full px-3 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
            />
          </div>

          <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
            <p className="text-xs text-blue-700 flex items-start gap-1.5">
              <span className="mt-0.5">ℹ️</span>
              This event will be saved to your dashboard <strong>and</strong> Google Calendar will open so you can confirm it there too.
            </p>
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm font-medium border rounded-lg hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createEvent.isPending}
              className="flex-1 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2"
            >
              <CalendarPlus size={14} />
              {createEvent.isPending ? "Saving…" : "Add to Calendar"}
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
      <div className="bg-card border rounded-xl overflow-hidden h-full flex flex-col" style={{ minHeight: 420 }}>
        <div className="flex items-center justify-between px-5 py-3 border-b shrink-0">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <div className="w-2 h-2 bg-primary rounded-full" />
            Calendar
          </h3>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
            >
              <CalendarPlus size={13} />
              Add Event
            </button>
            <a
              href="https://calendar.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary hover:underline"
            >
              Open ↗
            </a>
          </div>
        </div>
        <iframe
          src="https://calendar.google.com/calendar/embed?height=500&wkst=2&bgcolor=%23ffffff&ctz=Europe%2FIstanbul&showTitle=0&showNav=1&showDate=1&showPrint=0&showTabs=0&showCalendars=0&showTz=0&mode=MONTH"
          className="flex-1 w-full border-0"
          style={{ minHeight: 380 }}
          title="Google Calendar"
        />
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
    markRead.mutate(
      { id },
      { onSuccess: () => {
        qc.invalidateQueries({ queryKey: getListNotificationsQueryKey() });
        qc.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
      }}
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
          <Bell size={16} className="text-red-500" />
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
              <div key={n.id} className={`flex items-start gap-3 p-3 rounded-lg border ${cfg.bg} ${n.isRead ? "opacity-50" : ""}`}>
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

// ─── DASHBOARD PAGE ───────────────────────────────────────────────────────────
export default function DashboardPage() {
  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
        </div>

        {/* Stats summary bar */}
        <SummaryBar />

        {/* Main grid: Calendar + Notifications + Notes */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4" style={{ minHeight: 460 }}>
          <div className="lg:col-span-2">
            <GoogleCalendarWidget />
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex-1" style={{ minHeight: 200 }}>
              <NotificationsWidget />
            </div>
            <div className="flex-1" style={{ minHeight: 200 }}>
              <NotesWidget />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
