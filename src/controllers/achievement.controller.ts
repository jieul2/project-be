import { Context } from "hono";
import { AchievementController } from "../types/achievement.types";
import Achievement from "../models/Achievement";
import User from "../models/User";
import Subject from "../models/Subject";

const achievementController: AchievementController = {} as AchievementController;

achievementController.createAchievement = async (c: Context) => {
  try {
    const user = c.get("user");
    if (!user) {
      throw new Error("사용자 정보가 필요합니다.");
    }

    const { studentId, subjectId, score } = await c.req.json();
    if (!studentId || !subjectId || !score) {
      throw new Error("모든 필드가 필요합니다.");
    }
    const newAchievement = new Achievement({ studentId, subjectId, score });
    await newAchievement.save();
    return c.json(
      { message: "성적이 성공적으로 생성되었습니다.", achievement: newAchievement },
      201,
    );
  } catch (err) {
    if (err instanceof Error) {
      return c.json({ message: "성적 생성 실패", error: err.message }, 400);
    }
    return c.json({ message: "성적 생성 실패", error: "알 수 없는 오류" }, 400);
  }
};

achievementController.getAchievements = async (c: Context) => {
  try {
    const { studentId } = c.req.param();
    if (!studentId) {
      throw new Error("학생 ID가 필요합니다.");
    }
    const achievements = await Achievement.find({ studentId })
      .populate({
        path: "studentId",
        model: User,
        select: "username -_id",
      })
      .populate({
        path: "subjectId",
        model: Subject,
        select: "title -_id",
      });
    if (!achievements || achievements.length === 0) {
      throw new Error("성적을 찾을 수 없습니다.");
    }
    return c.json({ achievements }, 200);
  } catch (err) {
    if (err instanceof Error) {
      return c.json({ message: "성적 조회 실패", error: err.message }, 400);
    }
    return c.json({ message: "성적 조회 실패", error: "알 수 없는 오류" }, 400);
  }
};

achievementController.updateAchievement = async (c: Context) => {
  try {
    const { achievementId } = c.req.param();
    const { studentId, subjectId, score } = await c.req.json();
    if (!studentId || !subjectId || !score) {
      throw new Error("모든 필드가 필요합니다.");
    }
    const updatedAchievement = await Achievement.findByIdAndUpdate(
      achievementId,
      { studentId, subjectId, score },
      { returnDocument: "after" },
    );
    if (!updatedAchievement) {
      throw new Error("성적을 찾을 수 없습니다.");
    }
    return c.json(
      { message: "성적이 성공적으로 업데이트되었습니다.", achievement: updatedAchievement },
      200,
    );
  } catch (err) {
    if (err instanceof Error) {
      return c.json({ message: "성적 업데이트 실패", error: err.message }, 400);
    }
    return c.json({ message: "성적 업데이트 실패", error: "알 수 없는 오류" }, 400);
  }
};

achievementController.deleteAchievement = async (c: Context) => {
  try {
    const { achievementId } = c.req.param();
    const result = await Achievement.findByIdAndDelete(achievementId);
    if (!result) {
      throw new Error("성적을 찾을 수 없습니다.");
    }
    return c.json({ message: "성적 삭제 성공" }, 200);
  } catch (err) {
    if (err instanceof Error) {
      return c.json({ message: "성적 삭제 실패", error: err.message }, 400);
    }
    return c.json({ message: "성적 삭제 실패", error: "알 수 없는 오류" }, 400);
  }
};

export default achievementController;
