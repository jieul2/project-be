import { Hono } from "hono";
import classroomController from "../controllers/classroom.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = new Hono();

router.get("/", authMiddleware, classroomController.getClassroom);
router.post("/", authMiddleware, classroomController.createClassroom);
router.put("/:classroomId", authMiddleware, classroomController.updateClassroom);
router.delete("/:classroomId", authMiddleware, classroomController.deleteClassroom);

export default router;
