import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { useLogin, ApiError } from "@workspace/api-client-react";
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
      { data: { businessName: businessName.trim(), password: password.trim() } },
      {
        onSuccess: (data) => {
          login(data.businessName, data.token ?? "session");
          setLocation("/dashboard");
        },
        onError: (err) => {
          if (err instanceof ApiError) {
            if (err.status === 401) {
              setError("Geçersiz işletme adı veya şifre. Deneyin: demo / demo123");
              return;
            }
            if (err.status >= 502 || err.status === 404) {
              setError(
                "API sunucusuna ulaşılamıyor. API'yi çalıştırın (varsayılan port 8082) ve dashboard ile aynı makinede olduğunuzdan emin olun.",
              );
              return;
            }
            setError(`Sunucu yanıtı: ${err.message}`);
            return;
          }
          setError(
            "Bağlantı kurulamadı. API sunucusu açık mı? (ör. PORT=8082) Vite, /api isteklerini API_PROXY_TARGET ile iletir.",
          );
        },
      }
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "linear-gradient(135deg,#1e3a5f 0%,#0f2440 60%,#1a1060 100%)" }}>
      {/* Decorative circles */}
      <div className="absolute top-0 left-0 w-96 h-96 rounded-full opacity-10" style={{ background: "radial-gradient(circle,#f97316,transparent)", transform: "translate(-30%,-30%)" }} />
      <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full opacity-10" style={{ background: "radial-gradient(circle,#3b82f6,transparent)", transform: "translate(30%,30%)" }} />

      <div className="w-full max-w-md relative">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="p-4 rounded-2xl mb-4 shadow-2xl" style={{ background: "linear-gradient(135deg,#f97316,#ef4444)" }}>
            <Briefcase className="text-white" size={40} />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">İşletme Asistanı</h1>
          <p className="text-white/50 text-sm mt-1.5">Operasyonlarınızın kontrol merkezi</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-1">Tekrar Hoşgeldiniz</h2>
          <p className="text-gray-400 text-sm mb-6">Kontrol panelinize giriş yapın</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">İşletme Adı</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  data-testid="input-business-name"
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="İşletme adınız"
                  required
                  className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-100 rounded-xl text-sm focus:outline-none focus:border-orange-400 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Şifre</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  data-testid="input-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-100 rounded-xl text-sm focus:outline-none focus:border-orange-400 transition-all"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-3 py-2.5 rounded-xl text-sm">
                <AlertCircle size={16} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              data-testid="button-login"
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full text-white font-bold py-3 rounded-xl text-sm transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed mt-2 shadow-lg"
              style={{ background: "linear-gradient(135deg,#f97316,#ef4444)" }}
            >
              {loginMutation.isPending ? "Giriş yapılıyor..." : "Giriş Yap"}
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-6">
            Varsayılan bilgiler: <span className="font-mono font-semibold text-gray-600">demo / demo123</span>
          </p>
        </div>

        <p className="text-center text-white/30 text-xs mt-6">İşletme Asistanı v1.0</p>
      </div>
    </div>
  );
}
