import ClassReports from "../models/ClassReports";
import { Context } from "hono";
import { ClassReportsController } from "../types/classReports.types";

const classReportsController: ClassReportsController = {} as ClassReportsController;

// 수업일지 작성 (진도 및 숙제 기록)
classReportsController.createClassReport = async (c: Context) => {
  try {
    const user = c.get("user");

    // 권한 검사: 강사(instructor)나 관리자(admin)가 아니면 접근 차단
    if (!user || (user.role !== "instructor" && user.role !== "admin")) {
      return c.json({ message: "권한이 없습니다. 강사나 관리자만 접근할 수 있습니다." }, 403);
    }

    const { classId, date, progress, homework } = await c.req.json();

    if (!classId || !date || !progress) {
      throw new Error("수업 ID, 날짜, 진도(progress) 항목은 필수입니다.");
    }

    // 수업일지 생성
    const report = await ClassReports.create({
      classId,
      date: new Date(date),
      progress,
      homework: homework || "",
    });

    return c.json({ message: "수업일지가 성공적으로 작성되었습니다.", report }, 201);
  } catch (err) {
    if (err instanceof Error) {
      return c.json({ message: "수업일지 작성 실패", error: err.message }, 500);
    }
    return c.json({ message: "수업일지 작성 실패", error: "알 수 없는 오류" }, 500);
  }
};

export default classReportsController;