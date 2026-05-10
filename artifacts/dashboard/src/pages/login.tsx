import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { useLogin } from "@workspace/api-client-react";
import { Briefcase, Lock, Building2, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const [businessName, setBusinessName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const [, setLocation] = useLocation();
  const loginMutation = useLogin();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    loginMutation.mutate(
      { data: { businessName, password } },
      {
        onSuccess: (data) => {
          login(data.businessName, data.token ?? "session");
          setLocation("/dashboard");
        },
        onError: () => {
          setError("Invalid business name or password. Try: demo / demo123");
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(214,52%,12%)] via-[hsl(214,52%,18%)] to-[hsl(214,52%,25%)] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo mark */}
        <div className="flex flex-col items-center mb-8">
          <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl mb-4 border border-white/20">
            <Briefcase className="text-white" size={40} />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Business Assistant</h1>
          <p className="text-white/60 text-sm mt-1">Command center for your operations</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-1">Welcome back</h2>
          <p className="text-gray-500 text-sm mb-6">Sign in to your dashboard</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Business Name
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  data-testid="input-business-name"
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Your business name"
                  required
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(214,52%,25%)] focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  data-testid="input-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(214,52%,25%)] focus:border-transparent transition-all"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-3 py-2.5 rounded-lg text-sm">
                <AlertCircle size={16} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              data-testid="button-login"
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full bg-[hsl(214,52%,25%)] hover:bg-[hsl(214,52%,20%)] text-white font-semibold py-2.5 rounded-lg text-sm transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loginMutation.isPending ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-6">
            Default credentials: <span className="font-mono font-medium">demo / demo123</span>
          </p>
        </div>

        <p className="text-center text-white/40 text-xs mt-6">
          Business Assistant Dashboard v1.0
        </p>
      </div>
    </div>
  );
}
