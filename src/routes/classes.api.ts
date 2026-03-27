import { Hono } from "hono";
import { authMiddleware } from "../middlewares/auth.middleware";
import classesController from "../controllers/classes.controller";

const router = new Hono();
// 수업 조회
router.get("/", authMiddleware, classesController.getClasses);
// 수업 생성
router.post("/", authMiddleware, classesController.createClass);
// 수업 상세 조회
router.get("/:classId", authMiddleware, classesController.getDetailClass);
// 수업 업데이트
router.put("/:classId", authMiddleware, classesController.updateClass);
// 수업 삭제
router.delete("/:classId", authMiddleware, classesController.deleteClass);
// 출석 조회
router.get("/:classId/attendance", authMiddleware, classesController.getAttendance);
// 출석 체크
router.post("/:classId/attendance", authMiddleware, classesController.checkAttendance);
// 수업 보고서 조회
router.get("/:classId/report", authMiddleware, classesController.getClassReport);
// 수업 보고서 생성
router.post("/:classId/report", authMiddleware, classesController.createClassReport);
// AI 주간 요약 조회
router.get("/:classId/report/ai-summary", authMiddleware, classesController.getWeeklyAiSummary);

export default router;
