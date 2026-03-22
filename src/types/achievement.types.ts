import { Context } from "hono";

export interface AchievementController {
  createAchievement: (c: Context) => Promise<Response>;
  getAchievements: (c: Context) => Promise<Response>;
  updateAchievement: (c: Context) => Promise<Response>;
  deleteAchievement: (c: Context) => Promise<Response>;
}
