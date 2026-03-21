import Attendance from "../models/Attendance";
import { Context } from "hono";
import { AttendanceController } from "../types/attendance.types";
import { AttendanceRecordPayload } from "../types/attendance.types";

const attendanceController: AttendanceController = {} as AttendanceController;

// 출석 체크 (당일 수업 출/결석)
attendanceController.checkAttendance = async (c: Context) => {
  try {
    const user = c.get("user");

    // 권한 검사: 강사(instructor)나 관리자(admin)가 아니면 접근 차단
    if (!user || (user.role !== "instructor" && user.role !== "admin")) {
      return c.json({ message: "권한이 없습니다. 강사나 관리자만 출석 처리를 할 수 있습니다." }, 403);
    }

    const { classId, date, records } = await c.req.json();

    if (!classId || !date || !records || !Array.isArray(records)) {
      throw new Error("수업 ID, 날짜, 그리고 출석 기록 배열(records)이 필요합니다.");
    }

    const attendanceDocs = records.map((record: AttendanceRecordPayload) => ({
      classId,
      date: new Date(date),
      studentId: record.studentId,
      status: record.status, 
      reason: record.reason || "",
    }));

    const savedAttendances = await Attendance.insertMany(attendanceDocs);

    return c.json({ message: "출석 체크가 완료되었습니다.", attendances: savedAttendances }, 201);
  } catch (err) {
    if (err instanceof Error) {
      return c.json({ message: "출석 체크 실패", error: err.message }, 500);
    }
    return c.json({ message: "출석 체크 실패", error: "알 수 없는 오류" }, 500);
  }
};

export default attendanceController;