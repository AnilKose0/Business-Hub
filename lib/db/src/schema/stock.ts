import { pgTable, serial, text, numeric, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const stockItemsTable = pgTable("stock_items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  currentStock: numeric("current_stock", { precision: 10, scale: 2 }).notNull(),
  minStock: numeric("min_stock", { precision: 10, scale: 2 }).notNull(),
  unit: text("unit").notNull(),
  wholesaler: text("wholesaler").notNull(),
  weeklyOrderQty: numeric("weekly_order_qty", { precision: 10, scale: 2 }),
  isCritical: boolean("is_critical").notNull().default(false),
});

export const insertStockItemSchema = createInsertSchema(stockItemsTable).omit({ id: true });
export type InsertStockItem = z.infer<typeof insertStockItemSchema>;
export type StockItem = typeof stockItemsTable.$inferSelect;
