import { useState } from "react";
import { Layout } from "@/components/layout";
import { useListContacts } from "@workspace/api-client-react";
import { Users, Phone, MapPin, Mail, Building2, User, Search } from "lucide-react";

export default function ContactsPage() {
  const { data: contacts = [], isLoading } = useListContacts();
  const [filter, setFilter] = useState<"all" | "employee" | "wholesaler">("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<number | null>(null);

  const filtered = contacts
    .filter((c) => filter === "all" || c.type === filter)
    .filter(
      (c) =>
        !search ||
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        (c.role ?? "").toLowerCase().includes(search.toLowerCase())
    );

  const selectedContact = contacts.find((c) => c.id === selected);

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-5">
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Users size={22} className="text-primary" />
            Contacts
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {contacts.filter((c) => c.type === "employee").length} employees · {contacts.filter((c) => c.type === "wholesaler").length} wholesalers
          </p>
        </div>

        <div className="flex gap-4">
          {/* Left: contact list */}
          <div className="flex-1 flex flex-col gap-3 min-w-0">
            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search contacts..."
                  className="w-full pl-9 pr-3 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="flex gap-1.5">
                {(["all", "employee", "wholesaler"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-3 py-2 rounded-lg text-xs font-medium capitalize transition-colors ${
                      filter === f ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {f} ({f === "all" ? contacts.length : contacts.filter((c) => c.type === f).length})
                  </button>
                ))}
              </div>
            </div>

            {/* Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[1, 2, 3, 4].map((i) => <div key={i} className="h-28 bg-muted animate-pulse rounded-xl" />)}
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-muted-foreground bg-card border rounded-xl">
                <Users size={36} className="mb-2 opacity-20" />
                <p className="text-sm">No contacts found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filtered.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelected(c.id === selected ? null : c.id)}
                    className={`text-left p-4 rounded-xl border transition-colors ${
                      selected === c.id
                        ? "border-primary bg-primary/5"
                        : "bg-card hover:bg-muted/30"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-11 h-11 rounded-full flex items-center justify-center text-base font-bold text-white shrink-0 ${
                          c.type === "employee" ? "bg-primary" : "bg-purple-600"
                        }`}
                      >
                        {c.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="font-semibold text-foreground text-sm truncate">{c.name}</p>
                          <span
                            className={`text-xs px-1.5 py-0.5 rounded-full font-medium shrink-0 ${
                              c.type === "employee" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"
                            }`}
                          >
                            {c.type === "employee" ? "Employee" : "Wholesaler"}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mb-1.5">{c.role}</p>
                        {c.phone && (
                          <div className="flex items-center gap-1">
                            <Phone size={11} className="text-muted-foreground shrink-0" />
                            <p className="text-xs text-muted-foreground">{c.phone}</p>
                          </div>
                        )}
                        {c.email && (
                          <div className="flex items-center gap-1 mt-0.5">
                            <Mail size={11} className="text-muted-foreground shrink-0" />
                            <p className="text-xs text-muted-foreground truncate">{c.email}</p>
                          </div>
                        )}
                        {c.address && (
                          <div className="flex items-center gap-1 mt-0.5">
                            <MapPin size={11} className="text-muted-foreground shrink-0" />
                            <p className="text-xs text-muted-foreground truncate">{c.address}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: detail panel */}
          {selectedContact && (
            <div className="w-72 shrink-0 hidden lg:block">
              <div className="bg-card border rounded-xl p-5 sticky top-0">
                <div className="flex flex-col items-center text-center mb-5">
                  <div
                    className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white mb-3 ${
                      selectedContact.type === "employee" ? "bg-primary" : "bg-purple-600"
                    }`}
                  >
                    {selectedContact.name.charAt(0)}
                  </div>
                  <h2 className="font-bold text-foreground text-base">{selectedContact.name}</h2>
                  <p className="text-sm text-muted-foreground">{selectedContact.role}</p>
                  <span
                    className={`mt-2 text-xs px-2 py-1 rounded-full font-medium ${
                      selectedContact.type === "employee" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"
                    }`}
                  >
                    {selectedContact.type === "employee" ? (
                      <span className="flex items-center gap-1"><User size={10} /> Employee</span>
                    ) : (
                      <span className="flex items-center gap-1"><Building2 size={10} /> Wholesaler</span>
                    )}
                  </span>
                </div>

                <div className="space-y-3">
                  {selectedContact.phone && (
                    <div className="flex items-center gap-3 p-3 bg-muted/40 rounded-lg">
                      <Phone size={16} className="text-primary shrink-0" />
                      <div>
                        <p className="text-xs text-muted-foreground">Phone</p>
                        <p className="text-sm font-medium text-foreground">{selectedContact.phone}</p>
                      </div>
                    </div>
                  )}
                  {selectedContact.email && (
                    <div className="flex items-center gap-3 p-3 bg-muted/40 rounded-lg">
                      <Mail size={16} className="text-primary shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">Email</p>
                        <p className="text-sm font-medium text-foreground truncate">{selectedContact.email}</p>
                      </div>
                    </div>
                  )}
                  {selectedContact.address && (
                    <div className="flex items-center gap-3 p-3 bg-muted/40 rounded-lg">
                      <MapPin size={16} className="text-primary shrink-0" />
                      <div>
                        <p className="text-xs text-muted-foreground">Address</p>
                        <p className="text-sm font-medium text-foreground">{selectedContact.address}</p>
                      </div>
                    </div>
                  )}
                  {selectedContact.notes && (
                    <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg">
                      <p className="text-xs font-semibold text-amber-800 mb-1">Notes</p>
                      <p className="text-xs text-foreground leading-relaxed">{selectedContact.notes}</p>
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
