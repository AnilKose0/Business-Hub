import { Router } from "express";
import { listAllStockItems, listCriticalStockItems } from "@workspace/db";

const router = Router();

router.get("/", async (_req, res): Promise<void> => {
  const items = await listAllStockItems();
  res.json(items);
});

router.get("/critical", async (_req, res): Promise<void> => {
  const items = await listCriticalStockItems();
  res.json(items);
});

export default router;
