import { useState } from "react";
import { Layout } from "@/components/layout";
import { useListMails } from "@workspace/api-client-react";
import { Mail, Search, AlertTriangle, FileText, Building2, Star, Inbox } from "lucide-react";

const catColors: Record<string, string> = {
  invoice: "bg-purple-100 text-purple-700",
  wholesaler: "bg-blue-100 text-blue-700",
  complaint: "bg-red-100 text-red-700",
  important: "bg-amber-100 text-amber-700",
  other: "bg-gray-100 text-gray-700",
};

const catIcons: Record<string, React.ReactNode> = {
  invoice: <FileText size={14} />,
  wholesaler: <Building2 size={14} />,
  complaint: <AlertTriangle size={14} />,
  important: <Star size={14} />,
  other: <Inbox size={14} />,
};

export default function MailPage() {
  const { data: mails = [], isLoading } = useListMails();
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<number | null>(null);

  const tabs = ["all", "invoice", "wholesaler", "complaint", "important", "other"];

  const filtered = mails
    .filter((m) => activeTab === "all" || m.category === activeTab)
    .filter(
      (m) =>
        !search ||
        m.subject.toLowerCase().includes(search.toLowerCase()) ||
        m.from.toLowerCase().includes(search.toLowerCase())
    );

  const selectedMail = mails.find((m) => m.id === selected);

  const tabLabels: Record<string, string> = {
    all: "All",
    invoice: "Invoices",
    wholesaler: "Wholesaler",
    complaint: "Complaints",
    important: "Important",
    other: "Other",
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto h-full flex flex-col">
        <div className="mb-5">
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Mail size={22} className="text-primary" />
            Mail
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {mails.filter((m) => !m.isRead).length} unread messages
          </p>
        </div>

        <div className="flex gap-4 flex-1 min-h-0">
          {/* Left panel */}
          <div className="w-full md:w-80 lg:w-96 flex flex-col gap-3 shrink-0">
            {/* Search */}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search mail..."
                className="w-full pl-9 pr-3 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap gap-1">
              {tabs.map((t) => {
                const count = t === "all" ? mails.filter((m) => !m.isRead).length : mails.filter((m) => m.category === t && !m.isRead).length;
                return (
                  <button
                    key={t}
                    onClick={() => setActiveTab(t)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1 ${
                      activeTab === t ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {tabLabels[t]}
                    {count > 0 && (
                      <span className={`text-xs rounded-full px-1 font-bold ${activeTab === t ? "bg-white/20" : "bg-red-500 text-white"}`}>
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Mail list */}
            <div className="flex-1 overflow-auto space-y-1.5 min-h-0">
              {isLoading ? (
                <div className="space-y-2">{[1, 2, 3, 4].map((i) => <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />)}</div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                  <Mail size={32} className="mb-2 opacity-30" />
                  <p className="text-sm">No emails found</p>
                </div>
              ) : (
                filtered.map((mail) => (
                  <button
                    key={mail.id}
                    onClick={() => setSelected(mail.id === selected ? null : mail.id)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      selected === mail.id
                        ? "border-primary bg-primary/5"
                        : !mail.isRead
                        ? "bg-blue-50/50 border-blue-100 hover:bg-blue-50"
                        : "hover:bg-muted/30"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        {!mail.isRead && <span className="w-2 h-2 rounded-full bg-primary shrink-0" />}
                        <span className="text-xs font-semibold text-foreground truncate">{mail.from}</span>
                      </div>
                      <span className={`shrink-0 text-xs px-1.5 py-0.5 rounded flex items-center gap-1 font-medium ${catColors[mail.category] ?? catColors.other}`}>
                        {catIcons[mail.category]}
                        {mail.category}
                      </span>
                    </div>
                    <p className="text-xs text-foreground/80 truncate font-medium">{mail.subject}</p>
                    {mail.aiSummary && (
                      <p className="text-xs text-muted-foreground mt-1 truncate italic">AI: {mail.aiSummary}</p>
                    )}
                    <p className="text-xs text-muted-foreground/50 mt-1">
                      {new Date(mail.receivedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Right panel - mail detail */}
          <div className="flex-1 hidden md:flex">
            {selectedMail ? (
              <div className="bg-card border rounded-xl p-6 flex flex-col w-full">
                <div className="border-b pb-4 mb-4">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h2 className="text-lg font-semibold text-foreground">{selectedMail.subject}</h2>
                    <span className={`shrink-0 text-xs px-2 py-1 rounded-full flex items-center gap-1 font-medium ${catColors[selectedMail.category] ?? catColors.other}`}>
                      {catIcons[selectedMail.category]}
                      {selectedMail.category}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground"><span className="font-medium">From:</span> {selectedMail.from}</p>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium">Received:</span>{" "}
                    {new Date(selectedMail.receivedAt).toLocaleString("en-US", { dateStyle: "full", timeStyle: "short" })}
                  </p>
                </div>

                {selectedMail.aiSummary && (
                  <div className="mb-4 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                    <p className="text-xs font-semibold text-primary mb-1">AI Summary</p>
                    <p className="text-sm text-foreground">{selectedMail.aiSummary}</p>
                  </div>
                )}

                <div className="flex-1">
                  <p className="text-sm text-foreground leading-relaxed">{selectedMail.preview}</p>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground bg-card border rounded-xl">
                <Mail size={48} className="mb-3 opacity-20" />
                <p className="text-sm font-medium">Select an email to read</p>
                <p className="text-xs mt-1 opacity-60">Click any message on the left</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
