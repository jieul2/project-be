import Counsel from "../models/Counsel";
import { Context } from "hono";
import { CounselController } from "../types/counsel.types";
import { openaiService } from "../services/openai.service";

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

counselController.analyzeCounsel = async (c: Context) => {
  try {
    const { counselId } = c.req.param();
    const counsel = await Counsel.findById(counselId);
    
    if (!counsel) throw new Error("상담 내역을 찾을 수 없습니다.");

    const analysis = await openaiService.getCounselAnalysis(counsel.text);
    return c.json({ message: "AI 상담 분석 완료", analysis });
  } catch (err) {
    return c.json({ message: "AI 상담 분석 실패", error: err instanceof Error ? err.message : "알 수 없는 오류" }, 500);
  }
};

counselController.generateMessage = async (c: Context) => {
  try {
    const { counselId } = c.req.param();
    const counsel = await Counsel.findById(counselId);
    
    if (!counsel) throw new Error("상담 내역을 찾을 수 없습니다.");

    const draftMessage = await openaiService.generateCounselMessage(counsel.text);
    return c.json({ message: "AI 문자 초안 생성 완료", draftMessage });
  } catch (err) {
    return c.json({ message: "AI 문자 생성 실패", error: err instanceof Error ? err.message : "알 수 없는 오류" }, 500);
  }
};

export default counselController;