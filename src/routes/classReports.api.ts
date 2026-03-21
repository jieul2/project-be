import { Hono } from "hono";
import classReportsController from "../controllers/classReports.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = new Hono();

router.post("/", authMiddleware, classReportsController.createClassReport);

export default router;