import { Router } from "express";
import { listAllMails, markMailRead } from "@workspace/db";

const router = Router();

router.get("/", async (_req, res): Promise<void> => {
  const mails = await listAllMails();
  res.json(mails);
});

router.patch("/:id/read", async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  const updated = await markMailRead(id);
  if (!updated) {
    res.status(404).json({ error: "Mail not found" });
    return;
  }
  res.json(updated);
});

export default router;
