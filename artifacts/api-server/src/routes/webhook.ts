import { Router } from "express";
import {
  getWebhookSettingsRow,
  createWebhookSettingsRow,
  updateWebhookSettingsRow,
  insertNotification,
  insertCalendarEvent,
  insertOrder,
} from "@workspace/db";
import { ReceiveN8nWebhookBody, UpdateWebhookSettingsBody } from "@workspace/api-zod";

const router = Router();

router.get("/settings/webhook", async (_req, res): Promise<void> => {
  let row = await getWebhookSettingsRow();
  if (!row) {
    row = await createWebhookSettingsRow({
      webhookUrl: "/api/webhook/n8n",
      isActive: true,
    });
  }
  res.json(row);
});

router.patch("/settings/webhook", async (req, res): Promise<void> => {
  const parsed = UpdateWebhookSettingsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  let row = await getWebhookSettingsRow();
  if (!row) {
    row = await createWebhookSettingsRow({
      webhookUrl: "/api/webhook/n8n",
      isActive: parsed.data.isActive ?? true,
      secretToken: parsed.data.secretToken ?? null,
    });
    res.json(row);
    return;
  }
  const updated = await updateWebhookSettingsRow(row.id, parsed.data);
  res.json(updated ?? row);
});

router.post("/webhook/n8n", async (req, res): Promise<void> => {
  const parsed = ReceiveN8nWebhookBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { type, data } = parsed.data;
  req.log.info({ type }, "n8n webhook received");

  const settings = await getWebhookSettingsRow();
  if (settings) {
    await updateWebhookSettingsRow(settings.id, { lastTriggeredAt: new Date() });
  }

  if (type === "notification" && data) {
    const d = data as Record<string, unknown>;
    await insertNotification({
      title: String(d.title ?? "n8n Alert"),
      message: String(d.message ?? ""),
      severity: String(d.severity ?? "info"),
      source: "n8n",
    });
  } else if (type === "calendar_event" && data) {
    const d = data as Record<string, unknown>;
    await insertCalendarEvent({
      title: String(d.title ?? "Event"),
      date: String(d.date ?? new Date().toISOString().split("T")[0]),
      time: d.time ? String(d.time) : null,
      type: String(d.type ?? "other"),
      description: d.description ? String(d.description) : null,
    });
  } else if (type === "order" && data) {
    const d = data as Record<string, unknown>;
    await insertOrder({
      customerName: String(d.customerName ?? "Unknown"),
      channel: String(d.channel ?? "other"),
      status: "pending",
      items: String(d.items ?? ""),
      total: String(d.total ?? "0"),
    });
  }

  res.json({ success: true, message: `Processed ${type}` });
});

export default router;
