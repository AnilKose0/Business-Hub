import { Router } from "express";
import { db, mailsTable } from "@workspace/db";
import { desc } from "drizzle-orm";

const router = Router();

router.get("/", async (_req, res): Promise<void> => {
  const mails = await db
    .select()
    .from(mailsTable)
    .orderBy(desc(mailsTable.receivedAt));
  res.json(mails);
});

export default router;
