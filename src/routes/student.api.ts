import { Hono } from "hono";
import studentController from "../controllers/student.controller";
import counselController from "../controllers/counsel.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = new Hono();

router.get("/", authMiddleware, studentController.getStudents);
router.get("/parents", authMiddleware, studentController.getParents);
router.get("/:studentId", authMiddleware, studentController.getStudentById);
router.get("/:studentId/counsels", authMiddleware, counselController.getCounselHistory);

export default router;