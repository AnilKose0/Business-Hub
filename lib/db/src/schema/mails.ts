import { pgTable, serial, text, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const mailsTable = pgTable("mails", {
  id: serial("id").primaryKey(),
  from: text("sender").notNull(),
  subject: text("subject").notNull(),
  category: text("category").notNull().default("other"),
  receivedAt: timestamp("received_at", { withTimezone: true }).notNull().defaultNow(),
  isRead: boolean("is_read").notNull().default(false),
  aiSummary: text("ai_summary"),
  preview: text("preview"),
});

export const insertMailSchema = createInsertSchema(mailsTable).omit({ id: true });
export type InsertMail = z.infer<typeof insertMailSchema>;
export type Mail = typeof mailsTable.$inferSelect;
