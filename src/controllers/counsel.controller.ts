import Counsel from "../models/Counsel";
import Achievement from "../models/Achievement";
import Attendance from "../models/Attendance";
import { Context } from "hono";
import { CounselController } from "../types/counsel.types";
import { openaiService } from "../services/openai.service";

const counselController: CounselController = {} as CounselController;

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

counselController.getCounselPrep = async (c: Context) => {
  try {
    const { studentId } = c.req.param();

    // 토큰 사용량 제한을 위해 최신 데이터만 수집
    // 성적 5건 / 출석 20건 / 상담 3건 → 입력 토큰 ~300-500 수준으로 유지
    const [achievements, attendances, counsels] = await Promise.all([
      Achievement.find({ studentId }).sort({ createdAt: -1 }).limit(5).populate("subjectId", "title"),
      Attendance.find({ studentId }).sort({ date: -1 }).limit(20),
      Counsel.find({ studentId }).sort({ start: -1 }).limit(3),
    ]);

    // 데이터 충분성 검사: 총 3건 미만이면 AI 호출 없이 정보 부족 반환
    const totalDataPoints = achievements.length + attendances.length + counsels.length;
    if (totalDataPoints < 3) {
      return c.json({
        sufficient: false,
        message:
          "상담 준비에 필요한 학생 데이터가 부족합니다. 성적, 출석 기록 또는 이전 상담 내용이 더 있어야 합니다.",
      });
    }

    // 출석 집계 (개별 나열 대신 통계로 압축하여 토큰 절감)
    const attendanceCounts = attendances.reduce(
      (acc, a) => {
        const key = a.status as "present" | "absent" | "late";
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      },
      { present: 0, absent: 0, late: 0 },
    );

    // 최근 결석·지각 개별 기록 (최대 5건)
    const recentIssues = attendances
      .filter((a) => a.status !== "present")
      .slice(0, 5)
      .map((a) => {
        const dateStr = a.date ? new Date(a.date).toISOString().split("T")[0] : "날짜 미상";
        const statusKo = a.status === "absent" ? "결석" : "지각";
        return `- ${dateStr}: ${statusKo}${a.reason ? ` (${a.reason})` : ""}`;
      });

    // 학생 데이터 문자열 구성
    const lines: string[] = [];

    if (achievements.length > 0) {
      lines.push(`[성적 기록 (최근 ${achievements.length}건)]`);
      for (const a of achievements) {
        const subj = (a.subjectId as unknown as { title?: string } | null)?.title ?? "과목 미상";
        lines.push(`- ${subj}: ${a.score}점`);
      }
      lines.push("");
    }

    lines.push(`[출석 현황 (최근 ${attendances.length}회)]`);
    lines.push(`출석 ${attendanceCounts.present}회 / 결석 ${attendanceCounts.absent}회 / 지각 ${attendanceCounts.late}회`);
    if (recentIssues.length > 0) {
      lines.push("최근 결석/지각:");
      lines.push(...recentIssues);
    }
    lines.push("");

    if (counsels.length > 0) {
      lines.push(`[이전 상담 기록 (최근 ${counsels.length}건)]`);
      for (const counsel of counsels) {
        const dateStr = counsel.start ? new Date(counsel.start).toISOString().split("T")[0] : "날짜 미상";
        const typeKo = counsel.consultation_type === "parent" ? "학부모 상담" : "학생 상담";
        // 상담 내용은 150자로 제한하여 토큰 낭비 방지
        const text = counsel.text.length > 150 ? `${counsel.text.slice(0, 150)}...` : counsel.text;
        lines.push(`- [${typeKo}, ${dateStr}] ${text}`);
      }
    }

    const studentDataStr = lines.join("\n");
    const aiResult = await openaiService.getCounselPrep(studentDataStr);

    return c.json({ sufficient: true, aiResult });
  } catch (err) {
    return c.json(
      { message: "AI 상담 준비 실패", error: err instanceof Error ? err.message : "알 수 없는 오류" },
      500,
    );
  }
};

counselController.createCounsel = async (c: Context) => {
  try {
    const user = c.get("user");
    const { studentId } = c.req.param();
    const { text, consultation_type, start, end } = await c.req.json();

    if (!text || !consultation_type || !start || !end) {
      return c.json({ message: "상담 내용, 유형, 시작/종료 시간을 모두 입력해 주세요." }, 400);
    }

    if (!["student", "parent"].includes(consultation_type)) {
      return c.json({ message: "상담 유형은 student 또는 parent 여야 합니다." }, 400);
    }

    const counsel = await Counsel.create({
      studentId,
      instructorId: user.id,
      text,
      consultation_type,
      start: new Date(start),
      end: new Date(end),
    });

    return c.json({ message: "상담 기록이 저장되었습니다.", counsel }, 201);
  } catch (err) {
    return c.json(
      { message: "상담 기록 저장 실패", error: err instanceof Error ? err.message : "알 수 없는 오류" },
      500,
    );
  }
};

export default counselController;
