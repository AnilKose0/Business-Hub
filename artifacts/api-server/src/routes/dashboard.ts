import { Router } from "express";
import { getDashboardSummaryData } from "@workspace/db";

const router = Router();

router.get("/summary", async (_req, res): Promise<void> => {
  const { orders, criticalStock, unreadNotifications, unreadMails } =
    await getDashboardSummaryData();

  res.json({
    totalOrders: orders.length,
    pendingOrders: orders.filter((o) => o.status === "pending").length,
    criticalStockCount: criticalStock.length,
    unreadNotifications: unreadNotifications.length,
    unreadMails: unreadMails.length,
  });
});

export default router;
