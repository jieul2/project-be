import { Hono } from "hono";
import logController from "../controllers/log.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = new Hono();

router.get("/", authMiddleware, logController.getLogs);
router.delete("/", authMiddleware, logController.deleteLogs);

export default router;
