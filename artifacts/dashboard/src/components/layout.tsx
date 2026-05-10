import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { useLogout } from "@workspace/api-client-react";
import { 
  LayoutDashboard, 
  Settings, 
  LogOut, 
  Briefcase 
} from "lucide-react";
import { Link } from "wouter";

export function Layout({ children }: { children: React.ReactNode }) {
  const { logout: clearAuth, businessName } = useAuth();
  const [, setLocation] = useLocation();
  const logoutMutation = useLogout();

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        clearAuth();
        setLocation("/");
      },
      onError: () => {
        // Force logout even if API fails
        clearAuth();
        setLocation("/");
      }
    });
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      {/* Sidebar */}
      <aside className="w-64 bg-sidebar text-sidebar-foreground border-r flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-sidebar-border bg-sidebar font-semibold text-lg gap-3">
          <div className="bg-primary text-primary-foreground p-1.5 rounded-md">
            <Briefcase size={20} />
          </div>
          <span className="truncate">{businessName || "Business"}</span>
        </div>
        
        <div className="flex-1 py-6 px-3 flex flex-col gap-2">
          <NavLink href="/dashboard" icon={<LayoutDashboard size={20} />} label="Dashboard" />
          <NavLink href="/settings" icon={<Settings size={20} />} label="Settings" />
        </div>
        
        <div className="p-4 border-t border-sidebar-border">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2 text-sm font-medium text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent rounded-md transition-colors"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Mobile Header */}
        <header className="h-16 md:hidden border-b bg-sidebar text-sidebar-foreground flex items-center px-4 justify-between">
          <div className="flex items-center gap-2 font-semibold">
            <Briefcase size={20} />
            <span>{businessName || "Business"}</span>
          </div>
          <button onClick={handleLogout} className="text-sidebar-foreground/70">
            <LogOut size={20} />
          </button>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-background p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

function NavLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  const [location] = useLocation();
  const isActive = location === href;
  
  return (
    <Link 
      href={href} 
      className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
        isActive 
          ? "bg-sidebar-accent text-sidebar-accent-foreground" 
          : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
      }`}
    >
      {icon}
      {label}
    </Link>
  );
}