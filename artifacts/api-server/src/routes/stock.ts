import { Router } from "express";
import { db, stockItemsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/", async (_req, res): Promise<void> => {
  const items = await db.select().from(stockItemsTable).orderBy(stockItemsTable.name);
  res.json(items);
});

router.get("/critical", async (_req, res): Promise<void> => {
  const items = await db
    .select()
    .from(stockItemsTable)
    .where(eq(stockItemsTable.isCritical, true));
  res.json(items);
});

export default router;
