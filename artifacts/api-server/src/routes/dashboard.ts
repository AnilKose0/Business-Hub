import { Router } from "express";
import { db, ordersTable, stockItemsTable, notificationsTable, mailsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/summary", async (_req, res): Promise<void> => {
  const [orders, criticalStock, notifications, mails] = await Promise.all([
    db.select().from(ordersTable),
    db.select().from(stockItemsTable).where(eq(stockItemsTable.isCritical, true)),
    db.select().from(notificationsTable).where(eq(notificationsTable.isRead, false)),
    db.select().from(mailsTable).where(eq(mailsTable.isRead, false)),
  ]);

  res.json({
    totalOrders: orders.length,
    pendingOrders: orders.filter((o) => o.status === "pending").length,
    criticalStockCount: criticalStock.length,
    unreadNotifications: notifications.length,
    unreadMails: mails.length,
  });
});

export default router;
