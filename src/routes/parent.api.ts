import { Hono } from "hono";
import parentController from "../controllers/parent.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = new Hono();

router.get("/", authMiddleware, parentController.getParents);

export default router;