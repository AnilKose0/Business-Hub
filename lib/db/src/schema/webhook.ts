import { pgTable, serial, text, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const webhookSettingsTable = pgTable("webhook_settings", {
  id: serial("id").primaryKey(),
  webhookUrl: text("webhook_url").notNull(),
  secretToken: text("secret_token"),
  isActive: boolean("is_active").notNull().default(true),
  lastTriggeredAt: timestamp("last_triggered_at", { withTimezone: true }),
});

export const insertWebhookSettingsSchema = createInsertSchema(webhookSettingsTable).omit({ id: true });
export type InsertWebhookSettings = z.infer<typeof insertWebhookSettingsSchema>;
export type WebhookSettings = typeof webhookSettingsTable.$inferSelect;
