import { Layout } from "@/components/layout";
import {
  useGetWebhookSettings,
  useUpdateWebhookSettings,
  getGetWebhookSettingsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Settings, Webhook, Copy, CheckCircle, Power, Clock, Shield } from "lucide-react";

export default function SettingsPage() {
  const qc = useQueryClient();
  const { data: webhookSettings, isLoading } = useGetWebhookSettings();
  const updateWebhook = useUpdateWebhookSettings();
  const [copied, setCopied] = useState(false);
  const [tokenVisible, setTokenVisible] = useState(false);

  const webhookFullUrl = `${window.location.origin}/api/webhook/n8n`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleActive = () => {
    if (!webhookSettings) return;
    updateWebhook.mutate(
      { data: { isActive: !webhookSettings.isActive } },
      {
        onSuccess: () => {
          qc.invalidateQueries({ queryKey: getGetWebhookSettingsQueryKey() });
        },
      }
    );
  };

  return (
    <Layout>
      <div className="max-w-3xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-primary/10 p-2.5 rounded-lg">
            <Settings className="text-primary" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Settings</h1>
            <p className="text-muted-foreground text-sm">Configure your integrations and connections</p>
          </div>
        </div>

        {/* n8n Webhook Section */}
        <div className="bg-card border rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b bg-muted/30 flex items-center gap-3">
            <Webhook size={20} className="text-primary" />
            <div>
              <h2 className="font-semibold text-foreground">n8n Webhook Integration</h2>
              <p className="text-xs text-muted-foreground">Receive events from n8n automations</p>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Webhook URL */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Webhook Endpoint URL</label>
              <p className="text-xs text-muted-foreground mb-3">
                Use this URL in your n8n workflow as the HTTP Request node destination to push calendar events, alerts, and orders.
              </p>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-muted/50 border rounded-lg px-4 py-2.5 font-mono text-sm text-foreground/80 truncate">
                  {webhookFullUrl}
                </div>
                <button
                  onClick={() => copyToClipboard(webhookFullUrl)}
                  className="flex items-center gap-1.5 px-3 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity shrink-0"
                >
                  {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
            </div>

            {/* Payload format */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Expected Payload Format (HTTP POST)</label>
              <pre className="bg-muted/50 border rounded-lg p-4 text-xs font-mono text-foreground/80 overflow-auto">
{`{
  "type": "notification" | "calendar_event" | "order",
  "data": {
    // For notification:
    "title": "Stock Alert",
    "message": "Olive Oil critically low",
    "severity": "critical" | "warning" | "info",

    // For calendar_event:
    "title": "Wholesaler Visit",
    "date": "2026-05-20",
    "type": "wholesaler",

    // For order:
    "customerName": "Ahmet Y.",
    "channel": "whatsapp",
    "items": "2x Pasta, 1x Sauce",
    "total": 185.00
  }
}`}
              </pre>
            </div>

            {/* Status toggle */}
            <div className="flex items-center justify-between p-4 border rounded-xl bg-muted/30">
              <div className="flex items-center gap-3">
                <Power size={18} className={webhookSettings?.isActive ? "text-green-500" : "text-muted-foreground"} />
                <div>
                  <p className="text-sm font-medium text-foreground">Webhook Active</p>
                  <p className="text-xs text-muted-foreground">
                    {isLoading ? "Loading..." : webhookSettings?.isActive ? "Receiving events from n8n" : "Webhook is paused"}
                  </p>
                </div>
              </div>
              <button
                onClick={toggleActive}
                disabled={isLoading || updateWebhook.isPending}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  webhookSettings?.isActive ? "bg-green-500" : "bg-gray-300"
                } disabled:opacity-50`}
              >
                <span
                  className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
                    webhookSettings?.isActive ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {/* Last triggered */}
            {webhookSettings?.lastTriggeredAt && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock size={14} />
                <span>
                  Last triggered: {new Date(webhookSettings.lastTriggeredAt).toLocaleString()}
                </span>
              </div>
            )}

            {/* Secret token */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                <Shield size={14} />
                Secret Token (optional)
              </label>
              <p className="text-xs text-muted-foreground mb-2">
                Set a secret token to validate incoming n8n webhook requests.
              </p>
              <div className="flex items-center gap-2">
                <input
                  type={tokenVisible ? "text" : "password"}
                  value={webhookSettings?.secretToken ?? ""}
                  readOnly
                  placeholder="Not set"
                  className="flex-1 bg-muted/50 border rounded-lg px-4 py-2.5 text-sm font-mono"
                />
                <button
                  onClick={() => setTokenVisible((v) => !v)}
                  className="px-3 py-2.5 border rounded-lg text-sm hover:bg-muted/50 transition-colors"
                >
                  {tokenVisible ? "Hide" : "Show"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* API Reference */}
        <div className="bg-card border rounded-xl overflow-hidden mt-4">
          <div className="px-6 py-4 border-b bg-muted/30">
            <h2 className="font-semibold text-foreground">REST API Reference</h2>
            <p className="text-xs text-muted-foreground">Available endpoints for integration</p>
          </div>
          <div className="p-6">
            <div className="space-y-2 font-mono text-xs">
              {[
                { method: "POST", path: "/api/auth/login", desc: "Authenticate" },
                { method: "GET", path: "/api/calendar/events", desc: "List events" },
                { method: "GET", path: "/api/notifications", desc: "List alerts" },
                { method: "GET", path: "/api/orders", desc: "List orders" },
                { method: "PATCH", path: "/api/orders/:id/status", desc: "Update order status" },
                { method: "GET", path: "/api/stock", desc: "Stock inventory" },
                { method: "GET", path: "/api/stock/critical", desc: "Critical items" },
                { method: "GET", path: "/api/contacts", desc: "Directory" },
                { method: "GET", path: "/api/notes", desc: "Personal notes" },
                { method: "POST", path: "/api/webhook/n8n", desc: "n8n webhook receiver" },
              ].map((ep) => (
                <div key={ep.path} className="flex items-center gap-3 py-1.5 border-b border-muted/50 last:border-0">
                  <span className={`shrink-0 px-2 py-0.5 rounded text-xs font-bold ${
                    ep.method === "GET" ? "bg-blue-100 text-blue-700" :
                    ep.method === "POST" ? "bg-green-100 text-green-700" :
                    "bg-amber-100 text-amber-700"
                  }`}>{ep.method}</span>
                  <span className="text-foreground/80 flex-1">{ep.path}</span>
                  <span className="text-muted-foreground hidden sm:block">{ep.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
