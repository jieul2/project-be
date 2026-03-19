import { Hono } from "hono";
import calendarController from "../controllers/calendar.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = new Hono();

// 캘린더 일정 조회
router.get("/", authMiddleware, calendarController.getCalendar);
// 캘린더 일정 추가
router.post("/", authMiddleware, calendarController.createEvent);
// 캘린더 일정 수정
router.put("/:eventId", authMiddleware, calendarController.updateEvent);
// 캘린더 일정 삭제
router.delete("/:eventId", authMiddleware, calendarController.deleteEvent);
// 캘린더 일정 상세 조회
router.get("/:eventId", authMiddleware, calendarController.getEventDetail);

export default router;
