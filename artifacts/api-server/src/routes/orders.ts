import { Router } from "express";
import {
  listAllOrders,
  listOrdersByCreatedDesc,
  insertOrder,
  updateOrderStatus,
} from "@workspace/db";
import { CreateOrderBody, UpdateOrderStatusParams, UpdateOrderStatusBody } from "@workspace/api-zod";

const router = Router();

router.get("/summary", async (_req, res): Promise<void> => {
  const rows = await listAllOrders();
  const summary = {
    pending: rows.filter((r) => r.status === "pending").length,
    preparing: rows.filter((r) => r.status === "preparing").length,
    delivered: rows.filter((r) => r.status === "delivered").length,
    cancelled: rows.filter((r) => r.status === "cancelled").length,
    total: rows.length,
  };
  res.json(summary);
});

router.get("/", async (_req, res): Promise<void> => {
  const orders = await listOrdersByCreatedDesc();
  res.json(orders);
});

router.post("/", async (req, res): Promise<void> => {
  const parsed = CreateOrderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const order = await insertOrder(parsed.data);
  res.status(201).json(order);
});

router.patch("/:id/status", async (req, res): Promise<void> => {
  const params = UpdateOrderStatusParams.safeParse({ id: Number(req.params.id) });
  const body = UpdateOrderStatusBody.safeParse(req.body);
  if (!params.success || !body.success) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }
  const updated = await updateOrderStatus(params.data.id, body.data.status);
  if (!updated) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(updated);
});

export default router;
