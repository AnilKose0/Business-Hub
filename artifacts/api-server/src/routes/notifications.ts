import { Router } from "express";
import { listAllNotifications, markNotificationRead } from "@workspace/db";
import { MarkNotificationReadParams } from "@workspace/api-zod";

const router = Router();

router.get("/", async (_req, res): Promise<void> => {
  const notifications = await listAllNotifications();
  res.json(notifications);
});

router.patch("/:id/read", async (req, res): Promise<void> => {
  const params = MarkNotificationReadParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const updated = await markNotificationRead(params.data.id);
  if (!updated) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(updated);
});

export default router;
