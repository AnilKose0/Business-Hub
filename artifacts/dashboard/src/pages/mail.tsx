import { useState } from "react";
import { Layout } from "@/components/layout";
import {
  useListMails,
  useMarkMailRead,
  getListMailsQueryKey,
  getGetDashboardSummaryQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Mail, Search, AlertTriangle, FileText, Building2, Star, Inbox } from "lucide-react";

const catConfig: Record<string, { color: string; label: string; icon: React.ReactNode }> = {
  invoice:    { color: "bg-purple-100 text-purple-700",  label: "Fatura",    icon: <FileText size={13} /> },
  wholesaler: { color: "bg-blue-100 text-blue-700",      label: "Toptancı",  icon: <Building2 size={13} /> },
  complaint:  { color: "bg-red-100 text-red-700",        label: "Şikayet",   icon: <AlertTriangle size={13} /> },
  important:  { color: "bg-amber-100 text-amber-700",    label: "Önemli",    icon: <Star size={13} /> },
  other:      { color: "bg-gray-100 text-gray-600",      label: "Diğer",     icon: <Inbox size={13} /> },
};

const tabKeys = ["all", "invoice", "wholesaler", "complaint", "important", "other"] as const;
const tabLabels: Record<string, string> = { all: "Tümü", invoice: "Faturalar", wholesaler: "Toptancı", complaint: "Şikayetler", important: "Önemli", other: "Diğer" };

export default function MailPage() {
  const qc = useQueryClient();
  const { data: mails = [], isLoading } = useListMails();
  const markRead = useMarkMailRead();
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<number | null>(null);

  const filtered = mails
    .filter((m) => activeTab === "all" || m.category === activeTab)
    .filter((m) => !search || m.subject.toLowerCase().includes(search.toLowerCase()) || m.from.toLowerCase().includes(search.toLowerCase()));

  const selectedMail = mails.find((m) => m.id === selected);

  const handleSelect = (id: number) => {
    if (id === selected) { setSelected(null); return; }
    setSelected(id);
    const mail = mails.find((m) => m.id === id);
    if (mail && !mail.isRead) {
      markRead.mutate({ id }, { onSuccess: () => { qc.invalidateQueries({ queryKey: getListMailsQueryKey() }); qc.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() }); } });
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto h-full flex flex-col">
        <div className="mb-5">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <div className="bg-gradient-to-br from-teal-400 to-cyan-600 p-2 rounded-xl shadow-md"><Mail size={20} className="text-white" /></div>
            Posta
          </h1>
          <p className="text-gray-400 text-sm mt-0.5">{mails.filter((m) => !m.isRead).length} okunmamış mesaj</p>
        </div>

        <div className="flex gap-4 flex-1 min-h-0">
          {/* Left panel */}
          <div className="w-full md:w-80 lg:w-96 flex flex-col gap-3 shrink-0">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Posta ara..." className="w-full pl-9 pr-3 py-2.5 text-sm border-2 border-gray-100 rounded-xl focus:outline-none focus:border-teal-400 transition-all" />
            </div>

            <div className="flex flex-wrap gap-1.5">
              {tabKeys.map((t) => {
                const unreadCount = t === "all" ? mails.filter((m) => !m.isRead).length : mails.filter((m) => m.category === t && !m.isRead).length;
                const isActive = activeTab === t;
                return (
                  <button key={t} onClick={() => setActiveTab(t)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${isActive ? "text-white shadow-md" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
                    style={isActive ? { background: "linear-gradient(135deg,#14b8a6,#0891b2)" } : {}}>
                    {tabLabels[t]}
                    {unreadCount > 0 && (
                      <span className={`text-xs rounded-full px-1.5 font-bold ${isActive ? "bg-white/25 text-white" : "bg-red-500 text-white"}`}>{unreadCount}</span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="flex-1 overflow-auto space-y-2 min-h-0">
              {isLoading ? (
                <div className="space-y-2">{[1, 2, 3, 4].map((i) => <div key={i} className="h-20 bg-gray-100 animate-pulse rounded-2xl" />)}</div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-gray-300">
                  <Mail size={32} className="mb-2" />
                  <p className="text-sm">E-posta bulunamadı</p>
                </div>
              ) : (
                filtered.map((mail) => {
                  const cat = catConfig[mail.category] ?? catConfig.other;
                  return (
                    <button key={mail.id} onClick={() => handleSelect(mail.id)}
                      className={`w-full text-left p-3.5 rounded-2xl border-2 transition-all hover:scale-[1.01] ${selected === mail.id ? "border-teal-400 bg-teal-50 shadow-lg shadow-teal-50" : !mail.isRead ? "bg-blue-50 border-blue-100" : "bg-white border-gray-100 hover:border-gray-200"}`}>
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-1.5 min-w-0">
                          {!mail.isRead && <span className="w-2 h-2 rounded-full bg-teal-500 shrink-0" />}
                          <span className="text-xs font-bold text-gray-800 truncate">{mail.from}</span>
                        </div>
                        <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full flex items-center gap-1 font-bold ${cat.color}`}>
                          {cat.icon} {cat.label}
                        </span>
                      </div>
                      <p className="text-xs text-gray-700 truncate font-semibold">{mail.subject}</p>
                      {mail.aiSummary && <p className="text-xs text-gray-400 mt-1 truncate italic">YZ: {mail.aiSummary}</p>}
                      <p className="text-xs text-gray-300 mt-1">
                        {new Date(mail.receivedAt).toLocaleDateString("tr-TR", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Right panel */}
          <div className="flex-1 hidden md:flex">
            {selectedMail ? (
              <div className="bg-white border-2 border-gray-100 rounded-2xl p-6 flex flex-col w-full shadow-sm">
                <div className="border-b-2 border-gray-50 pb-4 mb-4">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h2 className="text-lg font-bold text-gray-900">{selectedMail.subject}</h2>
                    <span className={`shrink-0 text-xs px-2.5 py-1 rounded-full flex items-center gap-1 font-bold ${(catConfig[selectedMail.category] ?? catConfig.other).color}`}>
                      {(catConfig[selectedMail.category] ?? catConfig.other).icon}
                      {(catConfig[selectedMail.category] ?? catConfig.other).label}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500"><span className="font-bold text-gray-700">Kimden:</span> {selectedMail.from}</p>
                  <p className="text-sm text-gray-500">
                    <span className="font-bold text-gray-700">Alındı:</span>{" "}
                    {new Date(selectedMail.receivedAt).toLocaleString("tr-TR", { dateStyle: "full", timeStyle: "short" })}
                  </p>
                </div>

                {selectedMail.aiSummary && (
                  <div className="mb-4 p-4 bg-gradient-to-r from-teal-50 to-cyan-50 border-2 border-teal-100 rounded-2xl">
                    <p className="text-xs font-bold text-teal-700 mb-1">🤖 Yapay Zeka Özeti</p>
                    <p className="text-sm text-gray-700">{selectedMail.aiSummary}</p>
                  </div>
                )}

                <div className="flex-1">
                  <p className="text-sm text-gray-600 leading-relaxed">{selectedMail.preview}</p>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-300 bg-white border-2 border-gray-100 rounded-2xl shadow-sm">
                <Mail size={52} className="mb-3 opacity-20" />
                <p className="text-sm font-bold">Okumak için e-posta seçin</p>
                <p className="text-xs mt-1 opacity-60">Soldaki listeden bir mesaja tıklayın</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
