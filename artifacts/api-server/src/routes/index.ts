import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import calendarRouter from "./calendar";
import notificationsRouter from "./notifications";
import mailRouter from "./mail";
import ordersRouter from "./orders";
import stockRouter from "./stock";
import contactsRouter from "./contacts";
import notesRouter from "./notes";
import webhookRouter from "./webhook";
import dashboardRouter from "./dashboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/calendar", calendarRouter);
router.use("/notifications", notificationsRouter);
router.use("/mail", mailRouter);
router.use("/orders", ordersRouter);
router.use("/stock", stockRouter);
router.use("/contacts", contactsRouter);
router.use("/notes", notesRouter);
router.use(webhookRouter);
router.use("/dashboard", dashboardRouter);

export default router;
