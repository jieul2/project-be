import { Hono } from "hono";
import subjectController from "../controllers/subject.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = new Hono();

router.get("/", authMiddleware, subjectController.getSubjects);
router.post("/", authMiddleware, subjectController.createSubject);
router.delete("/:subjectId", authMiddleware, subjectController.deleteSubject);
router.put("/:subjectId", authMiddleware, subjectController.updateSubject);

export default router;
