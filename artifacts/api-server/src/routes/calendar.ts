import { Router } from "express";
import { db, calendarEventsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { CreateCalendarEventBody, DeleteCalendarEventParams } from "@workspace/api-zod";

const router = Router();

router.get("/events", async (req, res): Promise<void> => {
  const events = await db.select().from(calendarEventsTable).orderBy(calendarEventsTable.date);
  res.json(events);
});

router.post("/events", async (req, res): Promise<void> => {
  const parsed = CreateCalendarEventBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [event] = await db.insert(calendarEventsTable).values(parsed.data).returning();
  res.status(201).json(event);
});

router.delete("/events/:id", async (req, res): Promise<void> => {
  const params = DeleteCalendarEventParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  await db.delete(calendarEventsTable).where(eq(calendarEventsTable.id, params.data.id));
  res.json({ success: true, message: "Deleted" });
});

export default router;
