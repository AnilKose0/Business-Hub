import { Router } from "express";
import {
  listAllNotes,
  insertNote,
  updateNote,
  deleteNote,
} from "@workspace/db";
import {
  CreateNoteBody,
  UpdateNoteParams,
  UpdateNoteBody,
  DeleteNoteParams,
} from "@workspace/api-zod";

const router = Router();

router.get("/", async (_req, res): Promise<void> => {
  const notes = await listAllNotes();
  res.json(notes);
});

router.post("/", async (req, res): Promise<void> => {
  const parsed = CreateNoteBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const note = await insertNote(parsed.data);
  res.status(201).json(note);
});

router.patch("/:id", async (req, res): Promise<void> => {
  const params = UpdateNoteParams.safeParse({ id: Number(req.params.id) });
  const body = UpdateNoteBody.safeParse(req.body);
  if (!params.success || !body.success) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }
  const updated = await updateNote(params.data.id, body.data);
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
  await deleteNote(params.data.id);
  res.json({ success: true, message: "Deleted" });
});

export default router;
