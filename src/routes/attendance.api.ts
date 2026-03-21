import { Hono } from "hono";
import attendanceController from "../controllers/attendance.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = new Hono();

router.post("/", authMiddleware, attendanceController.checkAttendance);

export default router;