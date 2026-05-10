import { Router } from "express";
import { db, webhookSettingsTable, notificationsTable, calendarEventsTable, ordersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { ReceiveN8nWebhookBody, UpdateWebhookSettingsBody } from "@workspace/api-zod";

const router = Router();

router.get("/settings/webhook", async (_req, res): Promise<void> => {
  const rows = await db.select().from(webhookSettingsTable).limit(1);
  if (rows.length === 0) {
    const [created] = await db
      .insert(webhookSettingsTable)
      .values({ webhookUrl: "/api/webhook/n8n", isActive: true })
      .returning();
    res.json(created);
    return;
  }
  res.json(rows[0]);
});

router.patch("/settings/webhook", async (req, res): Promise<void> => {
  const parsed = UpdateWebhookSettingsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  let rows = await db.select().from(webhookSettingsTable).limit(1);
  if (rows.length === 0) {
    const [created] = await db
      .insert(webhookSettingsTable)
      .values({ webhookUrl: "/api/webhook/n8n", isActive: true, ...parsed.data })
      .returning();
    res.json(created);
    return;
  }
  const [updated] = await db
    .update(webhookSettingsTable)
    .set(parsed.data)
    .where(eq(webhookSettingsTable.id, rows[0]!.id))
    .returning();
  res.json(updated);
});

router.post("/webhook/n8n", async (req, res): Promise<void> => {
  const parsed = ReceiveN8nWebhookBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { type, data } = parsed.data;
  req.log.info({ type }, "n8n webhook received");

  const rows = await db.select().from(webhookSettingsTable).limit(1);
  if (rows.length > 0) {
    await db
      .update(webhookSettingsTable)
      .set({ lastTriggeredAt: new Date() })
      .where(eq(webhookSettingsTable.id, rows[0]!.id));
  }

  if (type === "notification" && data) {
    const d = data as Record<string, unknown>;
    await db.insert(notificationsTable).values({
      title: String(d.title ?? "n8n Alert"),
      message: String(d.message ?? ""),
      severity: String(d.severity ?? "info"),
      source: "n8n",
    });
  } else if (type === "calendar_event" && data) {
    const d = data as Record<string, unknown>;
    await db.insert(calendarEventsTable).values({
      title: String(d.title ?? "Event"),
      date: String(d.date ?? new Date().toISOString().split("T")[0]),
      time: d.time ? String(d.time) : undefined,
      type: String(d.type ?? "other"),
      description: d.description ? String(d.description) : undefined,
    });
  } else if (type === "order" && data) {
    const d = data as Record<string, unknown>;
    await db.insert(ordersTable).values({
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
