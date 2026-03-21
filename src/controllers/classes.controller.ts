import { ClassesController } from "../types/classes.types";
import { Context } from "hono";
import Class from "../models/Class";
import User from "../models/User";
import Subject from "../models/Subject";
import Classroom from "../models/Classroom";

const classesController = {} as ClassesController;

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

export default classesController;
