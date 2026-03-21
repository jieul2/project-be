import Counsel from "../models/Counsel";
import { Context } from "hono";
import { CounselController } from "../types/counsel.types";

const counselController: CounselController = {} as CounselController;

// 상담 이력 조회
counselController.getCounselHistory = async (c: Context) => {
  try {
    const { studentId } = c.req.param();

    const counsels = await Counsel.find({ studentId })
      .populate("instructorId", "username email phone")
      .sort({ start: -1 });

    return c.json({ counsels });
  } catch (err) {
    if (err instanceof Error) {
      return c.json({ message: "상담 이력 조회 실패", error: err.message }, 500);
    }
    return c.json({ message: "상담 이력 조회 실패", error: "알 수 없는 오류" }, 500);
  }
};

export default counselController;