import { ClassesController, AttendanceRecordPayload, ClassQueryFilter } from "../types/classes.types";
import { Context } from "hono";

import mongoose from "mongoose";
import Class, { IClass } from "../models/Class";
import User from "../models/User";
import Subject from "../models/Subject";
import Classroom from "../models/Classroom";
import Attendance from "../models/Attendance";
import ClassReports from "../models/ClassReports";
import ParentStudent from "../models/ParentStudent";
import { openaiService } from "../services/openai.service";
import { DEFAULT_CLASS_COLOR } from "../constants/class.constants";

const classesController: ClassesController = {} as ClassesController;

classesController.getClasses = async (c: Context) => {
  try {
    const user = c.get("user");
    if (!user) {
      throw new Error("사용자 ID가 필요합니다.");
    }

    let queryFilter = {};

if (user.role === "instructor") {
      queryFilter = { instructorId: user.id };
    } else if (user.role === "student") {
      queryFilter = { "students.studentId": user.id };
    } else if (user.role === "parent") {
      // 학부모인 경우 자녀 ID를 찾아 자녀가 속한 수업 모두 조회
      const relations = await ParentStudent.find({ parentId: user.id });
      const childIds = relations.map(rel => rel.studentId);
      queryFilter = { "students.studentId": { $in: childIds } };
    } else if (user.role === "admin") {
      queryFilter = {};
    } else {
      return c.json({ classes: [] }, 200);
    }

    const classes = await Class.find(queryFilter)
      .populate({
        path: "instructorId",
        model: User,
        select: "-password",
      })
      .populate({
        path: "subjectId",
        model: Subject,
        select: "title",
      })
      .populate({
        path: "classroomId",
        model: Classroom,
        select: "classroomName",
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

    const { 
        instructorId, subjectId, classroomId, 
        startDate, endDate, targetDate, color, schedules 
      } = await c.req.json();
    
    if (!instructorId || !subjectId || !classroomId || !startDate || !schedules || !Array.isArray(schedules) || schedules.length === 0) {
      throw new Error("필수 필드(강사, 과목, 강의실, 시작일, 스케줄)가 누락되었습니다.");
    }

const newClass = await Class.create({
      instructorId,
      subjectId,
      classroomId,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
      targetDate: targetDate ? new Date(targetDate) : null, 
      color: color || DEFAULT_CLASS_COLOR,
      schedules,
    });

    if (!newClass) {
      throw new Error("수업을 생성할 수 없습니다.");
    }
    return c.json({ message: "수업 생성 성공", class: newClass }, 201);
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
    
    // 필요하다면 학생들 정보(students.studentId)도 populate 할 수 있도록 추가 설정 가능
    const classDetail = await Class.findById(classId)
      .populate("instructorId", "username -_id")
      .populate("subjectId", "title -_id")
      .populate("classroomId", "classroomName -_id")
      .populate("students.studentId", "username"); // 학생 이름 조회를 위해 추가

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
    
    const { 
      instructorId, subjectId, classroomId, startDate, endDate, 
      targetDate, color, schedules, students, status 
    } = await c.req.json();

    const updateData: mongoose.UpdateQuery<IClass> = {};
    if (instructorId) updateData.instructorId = instructorId;
    if (subjectId) updateData.subjectId = subjectId;
    if (classroomId) updateData.classroomId = classroomId;
    if (startDate) updateData.startDate = new Date(startDate);
    if (endDate !== undefined) updateData.endDate = endDate ? new Date(endDate) : null;
    if (targetDate !== undefined) updateData.targetDate = targetDate ? new Date(targetDate) : null;
    if (color !== undefined) updateData.color = color;
    if (schedules) updateData.schedules = schedules;
    if (students) updateData.students = students; // 학생 수강 배정 수정 시 사용
    if (status) updateData.status = status;

    const updatedClass = await Class.findByIdAndUpdate(
      classId,
      updateData,
      { returnDocument: "after", runValidators: true },
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

classesController.getTimetable = async (c: Context) => {
  try {
    const user = c.get("user");
    if (!user) throw new Error("사용자 ID가 필요합니다.");

    const queryFilter: ClassQueryFilter = { status: "active" };

    if (user.role === "instructor") {
      queryFilter.instructorId = user.id;
    } else if (user.role === "student") {
      queryFilter["students.studentId"] = user.id;
    } else if (user.role === "parent") {
      const relations = await ParentStudent.find({ parentId: user.id });
      const childIds = relations.map(rel => rel.studentId);
      queryFilter["students.studentId"] = { $in: childIds };
    } else if (user.role !== "admin") {
      return c.json({ timetable: [] }, 200);
    }

    const classes = await Class.find(queryFilter)
      .populate({ path: "instructorId", model: User, select: "username" })
      .populate({ path: "subjectId", model: Subject, select: "title color" })
      .populate({ path: "classroomId", model: Classroom, select: "classroomName" });

    return c.json({ classes }, 200);
  } catch (err) {
    if (err instanceof Error) return c.json({ message: "시간표 조회 실패", error: err.message }, 400);
    return c.json({ message: "시간표 조회 실패", error: "알 수 없는 오류" }, 400);
  }
};

// 드래그 앤 드롭 전용: 특정 스케줄(시간표 블록) 부분 수정 API
classesController.updateTimetable = async (c: Context) => {
  try {
    const user = c.get("user");
    // 권한 체크: 강사나 관리자만 시간표 수정 가능
    if (!user || (user.role !== "instructor" && user.role !== "admin")) {
      return c.json({ message: "권한이 없습니다. 강사나 관리자만 수정할 수 있습니다." }, 403);
    }

    const { classId, scheduleId } = c.req.param();
    const { dayOfWeek, startTime, endTime } = await c.req.json();

    // 필수 파라미터 검증
    if (dayOfWeek === undefined || !startTime || !endTime) {
      throw new Error("변경할 요일(dayOfWeek), 시작 시간(startTime), 종료 시간(endTime) 데이터가 필요합니다.");
    }

    // Mongoose 위치 연산자($)를 활용하여 일치하는 배열 내 특정 항목만 업데이트
    const updatedClass = await Class.findOneAndUpdate(
      { 
        _id: classId, 
        "schedules._id": scheduleId // 배열 내부의 특정 스케줄 ID 타겟팅
      },
      { 
        $set: { 
          "schedules.$.dayOfWeek": dayOfWeek,
          "schedules.$.startTime": startTime,
          "schedules.$.endTime": endTime
        } 
      },
      { new: true, runValidators: true } // 업데이트 후의 데이터 반환 및 스키마 검증 활성화
    );

    if (!updatedClass) {
      throw new Error("수업 또는 해당 스케줄을 찾을 수 없습니다.");
    }

    return c.json({ message: "스케줄 시간이 성공적으로 변경되었습니다.", class: updatedClass }, 200);
  } catch (err) {
    if (err instanceof Error) {
      return c.json({ message: "스케줄 변경 실패", error: err.message }, 400);
    }
    return c.json({ message: "스케줄 변경 실패", error: "알 수 없는 오류" }, 400);
  }
};

classesController.checkAttendance = async (c: Context) => {
  try {
    const user = c.get("user");

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
    
    // 학생 모델 populate 적용
    const classInfo = await Class.findById(classId).populate("students.studentId", "username");
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

    if (!user || (user.role !== "instructor" && user.role !== "admin")) {
      return c.json({ message: "권한이 없습니다. 강사나 관리자만 접근할 수 있습니다." }, 403);
    }

    const { classId, date, progress, homework } = await c.req.json();

    if (!classId || !date || !progress) {
      throw new Error("수업 ID, 날짜, 진도(progress) 항목은 필수입니다.");
    }

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
      .populate("students.studentId", "username") // 스키마 변경점 적용
      .populate("instructorId")
      .populate("subjectId")
      .populate("classroomId");
      
    if (!classInfo) {
      throw new Error("수업을 찾을 수 없습니다.");
    }
    
    // 🚨 수정된 부분: 반환 객체에 startDate, endDate, schedules 매핑
    const report = {
      classId: classInfo._id,
      subject: classInfo.subjectId,
      instructor: classInfo.instructorId,
      classroom: classInfo.classroomId,
      students: classInfo.students,
      startDate: classInfo.startDate,
      endDate: classInfo.endDate,
      schedules: classInfo.schedules,
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
    
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const recentReports = await ClassReports.find({
      classId,
      date: { $gte: oneWeekAgo }
    }).sort({ date: 1 });

    if (!recentReports || recentReports.length === 0) {
      return c.json({ message: "최근 1주일간의 수업 일지가 없습니다." }, 404);
    }

    const reportTexts = recentReports.map(r => `[${r.date.toISOString().split('T')[0]}] 진도: ${r.progress}, 숙제: ${r.homework}`).join("\n");
    
    const aiResponseText = await openaiService.getWeeklyClassSummary(reportTexts);

    let summaryData;
    try {
      const cleanedResponse = aiResponseText?.replace(/```json/g, "").replace(/```/g, "").trim() || "[]";
      summaryData = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error("JSON 파싱 에러:", parseError);
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