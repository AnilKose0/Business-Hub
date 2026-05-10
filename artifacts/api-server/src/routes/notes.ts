import { Router } from "express";
import { db, notesTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { CreateNoteBody, UpdateNoteParams, UpdateNoteBody, DeleteNoteParams } from "@workspace/api-zod";

const router = Router();

router.get("/", async (_req, res): Promise<void> => {
  const notes = await db.select().from(notesTable).orderBy(desc(notesTable.createdAt));
  res.json(notes);
});

router.post("/", async (req, res): Promise<void> => {
  const parsed = CreateNoteBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [note] = await db.insert(notesTable).values(parsed.data).returning();
  res.status(201).json(note);
});

router.patch("/:id", async (req, res): Promise<void> => {
  const params = UpdateNoteParams.safeParse({ id: Number(req.params.id) });
  const body = UpdateNoteBody.safeParse(req.body);
  if (!params.success || !body.success) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }
  const [updated] = await db
    .update(notesTable)
    .set(body.data)
    .where(eq(notesTable.id, params.data.id))
    .returning();
  if (!updated) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(updated);
});

router.delete("/:id", async (req, res): Promise<void> => {
  const params = DeleteNoteParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  await db.delete(notesTable).where(eq(notesTable.id, params.data.id));
  res.json({ success: true, message: "Deleted" });
});

export default router;
