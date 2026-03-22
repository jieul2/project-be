import { Hono } from "hono";
import studentController from "../controllers/student.controller";
import counselController from "../controllers/counsel.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = new Hono();

router.get("/", authMiddleware, studentController.getStudents);
router.get("/:studentId", authMiddleware, studentController.getStudentById);
router.get("/:studentId/counsels", authMiddleware, counselController.getCounselHistory);
router.post("/link", authMiddleware, studentController.linkParentAndStudent);
router.post("/mapping-info", authMiddleware, studentController.getMappingByStudentId);
router.get("/counsels/:counselId/analyze", authMiddleware, counselController.analyzeCounsel);
router.get("/counsels/:counselId/message", authMiddleware, counselController.generateMessage);

export default router;