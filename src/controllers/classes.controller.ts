import { ClassesController, AttendanceRecordPayload } from "../types/classes.types";
import { Context } from "hono";
import Class from "../models/Class";
import User from "../models/User";
import Subject from "../models/Subject";
import Classroom from "../models/Classroom";
import Attendance from "../models/Attendance";
import ClassReports from "../models/ClassReports";
import { openaiService } from "../services/openai.service";

const classesController: ClassesController = {} as ClassesController;

classesController.getClasses = async (c: Context) => {
  try {
    const user = c.get("user");
    if (!user) {
      throw new Error("사용자 ID가 필요합니다.");
    }
    const classes = await Class.find()
      .populate({
        path: "instructorId",
        model: User,
        select: "-_id",
      })
      .populate({
        path: "subjectId",
        model: Subject,
        select: "title -_id",
      })
      .populate({
        path: "classroomId",
        model: Classroom,
        select: "classroomName -_id",
      });
    if (!classes) {
      throw new Error("수업을 찾을 수 없습니다.");
    }
    return c.json({ classes }, 200);
  } catch (err) {
    if (err instanceof Error) {
      return c.json({ message: "수업 조회 실패", error: err.message }, 400);
    }
    return c.json({ message: "수업 조회 실패", error: "알 수 없는 오류" }, 400);
  }
};

classesController.createClass = async (c: Context) => {
  try {
    const user = c.get("user");
    if (!user) {
      throw new Error("사용자 정보가 필요합니다.");
    }
    if (user.role !== "instructor" && user.role !== "admin") {
      throw new Error("인증되지 않은 사용자입니다.");
    }
    // 프론트에서 강사, 과목, 강의실 ID를 모르기때문에 이름으로 받아서 DB에서 ID로 변환하는 로직이 필요함

    const { instructorId, subjectId, classroomId, startTime, endTime } = await c.req.json();
    if (!instructorId || !subjectId || !classroomId || !startTime || !endTime) {
      throw new Error("필수 필드가 누락되었습니다.");
    }

    const newClass = await Class.create({
      startTime,
      endTime,
      instructorId,
      subjectId,
      classroomId,
    });
    if (!newClass) {
      throw new Error("수업을 생성할 수 없습니다.");
    }
    return c.json({ message: "수업 생성 성공", class: newClass }, 200);
  } catch (err) {
    if (err instanceof Error) {
      return c.json({ message: "수업 생성 실패", error: err.message }, 400);
    }
    return c.json({ message: "수업 생성 실패", error: "알 수 없는 오류" }, 400);
  }
};

classesController.getDetailClass = async (c: Context) => {
  try {
    const user = c.get("user");
    if (!user) {
      throw new Error("사용자 ID가 필요합니다.");
    }
    const { classId } = c.req.param();
    const classDetail = await Class.findById(classId)
      .populate("instructorId", "username -_id")
      .populate("subjectId", "title -_id")
      .populate("classroomId", "classroomName -_id");
    if (!classDetail) {
      throw new Error("수업을 찾을 수 없습니다.");
    }
    return c.json({ classDetail }, 200);
  } catch (err) {
    if (err instanceof Error) {
      return c.json({ message: "수업 상세 조회 실패", error: err.message }, 400);
    }
    return c.json({ message: "수업 상세 조회 실패", error: "알 수 없는 오류" }, 400);
  }
};
classesController.updateClass = async (c: Context) => {
  try {
    const user = c.get("user");
    if (!user) {
      throw new Error("사용자 정보가 필요합니다.");
    }
    if (user.role !== "instructor" && user.role !== "admin") {
      throw new Error("인증되지 않은 사용자입니다.");
    }

    const { classId } = c.req.param();
    const { startTime, endTime, instructorId, subjectId, classroomId } = await c.req.json();

    const updatedClass = await Class.findByIdAndUpdate(
      classId,
      { startTime, endTime, instructorId, subjectId, classroomId },
      { returnDocument: "after" },
    );
    if (!updatedClass) {
      throw new Error("수업을 찾을 수 없습니다.");
    }

    return c.json({ message: "수업 업데이트 성공", class: updatedClass }, 200);
  } catch (err) {
    if (err instanceof Error) {
      return c.json({ message: "수업 업데이트 실패", error: err.message }, 400);
    }
    return c.json({ message: "수업 업데이트 실패", error: "알 수 없는 오류" }, 400);
  }
};

classesController.deleteClass = async (c: Context) => {
  try {
    const user = c.get("user");
    if (!user) {
      throw new Error("사용자 정보가 필요합니다.");
    }
    if (user.role !== "instructor" && user.role !== "admin") {
      throw new Error("인증되지 않은 사용자입니다.");
    }

    const { classId } = c.req.param();
    const result = await Class.findByIdAndDelete(classId);
    if (!result) {
      throw new Error("수업을 찾을 수 없습니다.");
    }
    return c.json({ message: "수업 삭제 성공" }, 200);
  } catch (err) {
    if (err instanceof Error) {
      return c.json({ message: "수업 삭제 실패", error: err.message }, 400);
    }
    return c.json({ message: "수업 삭제 실패", error: "알 수 없는 오류" }, 400);
  }
};

classesController.checkAttendance = async (c: Context) => {
  try {
    const user = c.get("user");

    // 권한 검사: 강사(instructor)나 관리자(admin)가 아니면 접근 차단
    if (!user || (user.role !== "instructor" && user.role !== "admin")) {
      return c.json(
        { message: "권한이 없습니다. 강사나 관리자만 출석 처리를 할 수 있습니다." },
        403,
      );
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

classesController.getAttendance = async (c: Context) => {
  try {
    const user = c.get("user");
    if (!user) {
      throw new Error("사용자 ID가 필요합니다.");
    }
    const { classId } = c.req.param();
    const classInfo = await Class.findById(classId).populate("students");
    if (!classInfo) {
      throw new Error("수업을 찾을 수 없습니다.");
    }
    return c.json({ attendance: classInfo?.students || [] }, 200);
  } catch (err) {
    if (err instanceof Error) {
      return c.json({ message: "출석 조회 실패", error: err.message }, 400);
    }
    return c.json({ message: "출석 조회 실패", error: "알 수 없는 오류" }, 400);
  }
};

classesController.createClassReport = async (c: Context) => {
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
classesController.getClassReport = async (c: Context) => {
  try {
    const user = c.get("user");
    if (!user) {
      throw new Error("사용자 ID가 필요합니다.");
    }
    const { classId } = c.req.param();
    const classInfo = await Class.findById(classId)
      .populate("students")
      .populate("instructorId")
      .populate("subjectId")
      .populate("classroomId");
    if (!classInfo) {
      throw new Error("수업을 찾을 수 없습니다.");
    }
    const report = {
      classId: classInfo._id,
      subject: classInfo.subjectId,
      instructor: classInfo.instructorId,
      classroom: classInfo.classroomId,
      students: classInfo.students,
      startTime: classInfo.startTime,
      endTime: classInfo.endTime,
    };
    return c.json({ report }, 200);
  } catch (err) {
    if (err instanceof Error) {
      return c.json({ message: "수업 보고서 조회 실패", error: err.message }, 400);
    }
    return c.json({ message: "수업 보고서 조회 실패", error: "알 수 없는 오류" }, 400);
  }
};

classesController.getWeeklyAiSummary = async (c: Context) => {
  try {
    const { classId } = c.req.param();
    
    // 최근 7일간의 수업 일지 조회
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    // date: 1 옵션으로 인해 이미 시간 순서대로 정렬되어 조회됩니다.
    const recentReports = await ClassReports.find({
      classId,
      date: { $gte: oneWeekAgo }
    }).sort({ date: 1 });

    if (!recentReports || recentReports.length === 0) {
      return c.json({ message: "최근 1주일간의 수업 일지가 없습니다." }, 404);
    }

    const reportTexts = recentReports.map(r => `[${r.date.toISOString().split('T')[0]}] 진도: ${r.progress}, 숙제: ${r.homework}`).join("\n");
    
    // AI 응답 (문자열 형태의 JSON 배열)
    const aiResponseText = await openaiService.getWeeklyClassSummary(reportTexts);

    let summaryData;
    try {
      // AI가 마크다운 코드 블록(```json)을 포함해서 응답할 경우를 대비해 텍스트 정제
      const cleanedResponse = aiResponseText?.replace(/```json/g, "").replace(/```/g, "").trim() || "[]";
      summaryData = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error("JSON 파싱 에러:", parseError);
      // 파싱 실패 시 원본 텍스트를 그대로 반환하는 Fallback (배열 형태로 유지)
      summaryData = [
        { 
          date: "N/A", 
          progress: "요약 파싱 실패", 
          homework: aiResponseText 
        }
      ];
    }

    return c.json({ message: "AI 주간 수업 요약 완료", summary: summaryData }, 200);
  } catch (err) {
    return c.json({ message: "AI 수업 요약 실패", error: err instanceof Error ? err.message : "알 수 없는 오류" }, 500);
  }
};

export default classesController;
