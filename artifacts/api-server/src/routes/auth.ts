import { Router } from "express";
import { LoginBody } from "@workspace/api-zod";

const router = Router();

const BUSINESS_NAME = process.env.BUSINESS_NAME ?? "demo";
const BUSINESS_PASSWORD = process.env.BUSINESS_PASSWORD ?? "demo123";

router.post("/login", async (req, res): Promise<void> => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { businessName, password } = parsed.data;
  if (
    businessName.toLowerCase() === BUSINESS_NAME.toLowerCase() &&
    password === BUSINESS_PASSWORD
  ) {
    req.log.info({ businessName }, "Login successful");
    res.json({ success: true, businessName, token: null });
  } else {
    req.log.warn({ businessName }, "Login failed");
    res.status(401).json({ error: "Invalid business name or password" });
  }
});

router.post("/logout", async (_req, res): Promise<void> => {
  res.json({ success: true, message: "Logged out" });
});

export default router;
