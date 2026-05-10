import { Router } from "express";
import { db, mailsTable } from "@workspace/db";
import { desc, eq } from "drizzle-orm";

const router = Router();

router.get("/", async (_req, res): Promise<void> => {
  const mails = await db
    .select()
    .from(mailsTable)
    .orderBy(desc(mailsTable.receivedAt));
  res.json(mails);
});

router.patch("/:id/read", async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  const [updated] = await db
    .update(mailsTable)
    .set({ isRead: true })
    .where(eq(mailsTable.id, id))
    .returning();
  if (!updated) {
    res.status(404).json({ error: "Mail not found" });
    return;
  }
  res.json(updated);
});

export default router;
