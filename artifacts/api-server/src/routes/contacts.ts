import { Router } from "express";
import { listAllContacts, insertContact } from "@workspace/db";
import { CreateContactBody } from "@workspace/api-zod";

const router = Router();

router.get("/", async (_req, res): Promise<void> => {
  const contacts = await listAllContacts();
  res.json(contacts);
});

router.post("/", async (req, res): Promise<void> => {
  const parsed = CreateContactBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const contact = await insertContact(parsed.data);
  res.status(201).json(contact);
});

export default router;
