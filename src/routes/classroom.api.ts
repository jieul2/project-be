import { Hono } from "hono";
import classesController from "../controllers/classes.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = new Hono();

router.get("/", authMiddleware, classesController.getClasses);
router.post("/", authMiddleware, classesController.createClass);
router.put("/:classId", authMiddleware, classesController.updateClass);
router.delete("/:classId", authMiddleware, classesController.deleteClass);

export default router;
