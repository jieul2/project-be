import { Hono } from "hono";
import studentController from "../controllers/student.controller";
import counselController from "../controllers/counsel.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = new Hono();

// GET /api/students - 학생 목록 조회
router.get("/", authMiddleware, studentController.getStudents);

// GET /api/students/parents - 학부모 목록 조회
// 주의: /:studentId 보다 위에 있어야 라우팅 충돌이 발생하지 않습니다.
router.get("/parents", authMiddleware, studentController.getParents);

// GET /api/students/:studentId - 학생 상세 조회
router.get("/:studentId", authMiddleware, studentController.getStudentById);

// GET /api/students/:studentId/counsels - 특정 학생의 상담 이력 조회
router.get("/:studentId/counsels", authMiddleware, counselController.getCounselHistory);

export default router;