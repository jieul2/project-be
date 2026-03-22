import { Hono } from "hono";
import { authMiddleware } from "../middlewares/auth.middleware";
import achievementController from "../controllers/achievement.controller";

const router = new Hono();

router.post("/", authMiddleware, achievementController.createAchievement);
router.get("/:studentId", authMiddleware, achievementController.getAchievements);
router.put("/:achievementId", authMiddleware, achievementController.updateAchievement);
router.delete("/:achievementId", authMiddleware, achievementController.deleteAchievement);

export default router;
