import { Router } from "express";
import {
  listCalendarEvents,
  insertCalendarEvent,
  deleteCalendarEvent,
} from "@workspace/db";
import { CreateCalendarEventBody, DeleteCalendarEventParams } from "@workspace/api-zod";

const router = Router();

router.get("/events", async (_req, res): Promise<void> => {
  const events = await listCalendarEvents();
  res.json(events);
});

router.post("/events", async (req, res): Promise<void> => {
  const parsed = CreateCalendarEventBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const event = await insertCalendarEvent(parsed.data);
  res.status(201).json(event);
});

router.delete("/events/:id", async (req, res): Promise<void> => {
  const params = DeleteCalendarEventParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  await deleteCalendarEvent(params.data.id);
  res.json({ success: true, message: "Deleted" });
});

export default router;
