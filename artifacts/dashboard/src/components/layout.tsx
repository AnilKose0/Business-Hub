import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { useLogout } from "@workspace/api-client-react";
import {
  LayoutDashboard,
  Settings,
  LogOut,
  Briefcase,
  Mail,
  ShoppingCart,
  Package,
  Users,
} from "lucide-react";
import { Link } from "wouter";

export function Layout({ children }: { children: React.ReactNode }) {
  const { logout: clearAuth, businessName } = useAuth();
  const [, setLocation] = useLocation();
  const logoutMutation = useLogout();

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => { clearAuth(); setLocation("/"); },
      onError: () => { clearAuth(); setLocation("/"); },
    });
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 text-foreground">
      {/* Sidebar */}
      <aside className="w-64 flex flex-col hidden md:flex shrink-0 shadow-xl" style={{ background: "linear-gradient(180deg,#1e3a5f 0%,#0f2440 100%)" }}>
        <div className="h-16 flex items-center px-5 border-b border-white/10 shrink-0 gap-3">
          <div className="bg-gradient-to-br from-orange-400 to-red-500 p-1.5 rounded-lg shadow-lg">
            <Briefcase size={20} className="text-white" />
          </div>
          <span className="truncate font-bold text-white text-base">{businessName || "İşletme"}</span>
        </div>

        <div className="flex-1 py-5 px-3 flex flex-col gap-1 overflow-auto">
          <p className="text-xs font-bold text-white/30 uppercase tracking-widest px-3 mb-2">Ana Menü</p>
          <NavLink href="/dashboard" icon={<LayoutDashboard size={17} />} label="Kontrol Paneli" />

          <p className="text-xs font-bold text-white/30 uppercase tracking-widest px-3 mt-5 mb-2">Operasyonlar</p>
          <NavLink href="/mail" icon={<Mail size={17} />} label="Posta" />
          <NavLink href="/orders" icon={<ShoppingCart size={17} />} label="Siparişler" />
          <NavLink href="/stock" icon={<Package size={17} />} label="Stok Kontrolü" />
          <NavLink href="/contacts" icon={<Users size={17} />} label="Kişiler" />

          <p className="text-xs font-bold text-white/30 uppercase tracking-widest px-3 mt-5 mb-2">Sistem</p>
          <NavLink href="/settings" icon={<Settings size={17} />} label="Ayarlar" />
        </div>

        <div className="p-4 border-t border-white/10 shrink-0">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <LogOut size={17} />
            <span>Çıkış Yap</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        {/* Mobile Header */}
        <header className="h-16 md:hidden border-b flex items-center px-4 justify-between shrink-0 shadow-sm" style={{ background: "#1e3a5f" }}>
          <div className="flex items-center gap-2 font-bold text-white">
            <Briefcase size={20} />
            <span>{businessName || "İşletme"}</span>
          </div>
          <button onClick={handleLogout} className="text-white/60">
            <LogOut size={20} />
          </button>
        </header>

        <main className="flex-1 overflow-auto bg-slate-50 p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

function NavLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  const [location] = useLocation();
  const isActive = location === href || (href !== "/dashboard" && location.startsWith(href));

  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
        isActive
          ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-900/30"
          : "text-white/60 hover:text-white hover:bg-white/10"
      }`}
    >
      {icon}
      {label}
    </Link>
  );
}
