import { useState } from "react";
import { Layout } from "@/components/layout";
import { useListContacts } from "@workspace/api-client-react";
import { Users, Phone, MapPin, Mail, Building2, User, Search } from "lucide-react";

const avatarGradients = [
  "from-blue-400 to-blue-600",
  "from-violet-400 to-purple-600",
  "from-emerald-400 to-green-600",
  "from-orange-400 to-red-500",
  "from-pink-400 to-rose-600",
  "from-teal-400 to-cyan-600",
];

export default function ContactsPage() {
  const { data: contacts = [], isLoading } = useListContacts();
  const [filter, setFilter] = useState<"all" | "employee" | "wholesaler">("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<number | null>(null);

  const filtered = contacts
    .filter((c) => filter === "all" || c.type === filter)
    .filter((c) => !search || c.name.toLowerCase().includes(search.toLowerCase()) || (c.role ?? "").toLowerCase().includes(search.toLowerCase()));

  const selectedContact = contacts.find((c) => c.id === selected);
  const filterLabels = { all: "Tümü", employee: "Çalışanlar", wholesaler: "Toptancılar" };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-5">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <div className="bg-gradient-to-br from-violet-500 to-purple-700 p-2 rounded-xl shadow-md"><Users size={20} className="text-white" /></div>
            Kişiler
          </h1>
          <p className="text-gray-400 text-sm mt-0.5">
            {contacts.filter((c) => c.type === "employee").length} çalışan · {contacts.filter((c) => c.type === "wholesaler").length} toptancı
          </p>
        </div>

        <div className="flex gap-4">
          <div className="flex-1 flex flex-col gap-3 min-w-0">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Kişi ara..." className="w-full pl-9 pr-3 py-2.5 text-sm border-2 border-gray-100 rounded-xl focus:outline-none focus:border-violet-400 transition-all" />
              </div>
              <div className="flex gap-1.5">
                {(["all", "employee", "wholesaler"] as const).map((f) => (
                  <button key={f} onClick={() => setFilter(f)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${filter === f ? "text-white shadow-md" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
                    style={filter === f ? { background: "linear-gradient(135deg,#8b5cf6,#7c3aed)" } : {}}>
                    {filterLabels[f]} ({f === "all" ? contacts.length : contacts.filter((c) => c.type === f).length})
                  </button>
                ))}
              </div>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{[1, 2, 3, 4].map((i) => <div key={i} className="h-28 bg-gray-100 animate-pulse rounded-2xl" />)}</div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-gray-300 bg-white border rounded-2xl">
                <Users size={36} className="mb-2" />
                <p className="text-sm">Kişi bulunamadı</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filtered.map((c, idx) => {
                  const grad = c.type === "employee" ? "from-blue-400 to-blue-600" : avatarGradients[(idx + 2) % avatarGradients.length];
                  return (
                    <button key={c.id} onClick={() => setSelected(c.id === selected ? null : c.id)}
                      className={`text-left p-4 rounded-2xl border-2 transition-all hover:scale-[1.02] ${selected === c.id ? "border-violet-400 bg-violet-50 shadow-lg shadow-violet-100" : "bg-white border-gray-100 hover:border-gray-200 hover:shadow-md"}`}>
                      <div className="flex items-start gap-3">
                        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${grad} flex items-center justify-center text-lg font-bold text-white shrink-0 shadow-md`}>
                          {c.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <p className="font-bold text-gray-800 text-sm truncate">{c.name}</p>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-bold shrink-0 ${c.type === "employee" ? "bg-blue-100 text-blue-700" : "bg-violet-100 text-violet-700"}`}>
                              {c.type === "employee" ? "Çalışan" : "Toptancı"}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400 mb-1.5">{c.role}</p>
                          {c.phone && <div className="flex items-center gap-1"><Phone size={11} className="text-gray-300 shrink-0" /><p className="text-xs text-gray-500">{c.phone}</p></div>}
                          {c.email && <div className="flex items-center gap-1 mt-0.5"><Mail size={11} className="text-gray-300 shrink-0" /><p className="text-xs text-gray-500 truncate">{c.email}</p></div>}
                          {c.address && <div className="flex items-center gap-1 mt-0.5"><MapPin size={11} className="text-gray-300 shrink-0" /><p className="text-xs text-gray-500 truncate">{c.address}</p></div>}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {selectedContact && (
            <div className="w-72 shrink-0 hidden lg:block">
              <div className="bg-white border-2 border-violet-100 rounded-2xl p-5 sticky top-0 shadow-xl shadow-violet-50">
                <div className="flex flex-col items-center text-center mb-5">
                  <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${selectedContact.type === "employee" ? "from-blue-400 to-blue-600" : "from-violet-400 to-purple-600"} flex items-center justify-center text-3xl font-bold text-white mb-3 shadow-xl`}>
                    {selectedContact.name.charAt(0)}
                  </div>
                  <h2 className="font-bold text-gray-900 text-base">{selectedContact.name}</h2>
                  <p className="text-sm text-gray-400">{selectedContact.role}</p>
                  <span className={`mt-2 text-xs px-3 py-1 rounded-full font-bold ${selectedContact.type === "employee" ? "bg-blue-100 text-blue-700" : "bg-violet-100 text-violet-700"}`}>
                    {selectedContact.type === "employee" ? <span className="flex items-center gap-1"><User size={10} /> Çalışan</span> : <span className="flex items-center gap-1"><Building2 size={10} /> Toptancı</span>}
                  </span>
                </div>
                <div className="space-y-2">
                  {selectedContact.phone && (
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                      <Phone size={15} className="text-blue-500 shrink-0" />
                      <div><p className="text-xs text-gray-400">Telefon</p><p className="text-sm font-bold text-gray-800">{selectedContact.phone}</p></div>
                    </div>
                  )}
                  {selectedContact.email && (
                    <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-xl">
                      <Mail size={15} className="text-emerald-500 shrink-0" />
                      <div className="min-w-0"><p className="text-xs text-gray-400">E-posta</p><p className="text-sm font-bold text-gray-800 truncate">{selectedContact.email}</p></div>
                    </div>
                  )}
                  {selectedContact.address && (
                    <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-xl">
                      <MapPin size={15} className="text-orange-500 shrink-0" />
                      <div><p className="text-xs text-gray-400">Adres</p><p className="text-sm font-bold text-gray-800">{selectedContact.address}</p></div>
                    </div>
                  )}
                  {selectedContact.notes && (
                    <div className="p-3 bg-amber-50 border-2 border-amber-100 rounded-xl">
                      <p className="text-xs font-bold text-amber-700 mb-1">Notlar</p>
                      <p className="text-xs text-gray-700 leading-relaxed">{selectedContact.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
