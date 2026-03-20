import User from "../models/User";
import Achievement from "../models/Achievement";
import Class from "../models/Class";
import Counsel from "../models/Counsel";
import { Context } from "hono";
import { StudentController } from "../types/student.types";

const studentController: StudentController = {} as StudentController;

// 학생 목록 조회
studentController.getStudents = async (c: Context) => {
  try {
    const searchName = c.req.query("name");
    
    // 기본 조건: 학생 롤을 가진 사용자
    const query: any = { role: "student" };
    
    if (searchName) {
      query.username = { $regex: searchName, $options: "i" };
    }

    const students = await User.find(query).select("-password");
    return c.json({ students });
  } catch (err) {
    if (err instanceof Error) {
      return c.json({ message: "학생 목록 조회 실패", error: err.message }, 500);
    }
    return c.json({ message: "학생 목록 조회 실패", error: "알 수 없는 오류" }, 500);
  }
};

// 학생 상세 조회
studentController.getStudentById = async (c: Context) => {
  try {
    const { studentId } = c.req.param();
    
    const student = await User.findOne({ _id: studentId, role: "student" }).select("-password");

    if (!student) {
      return c.json({ message: "해당 학생을 찾을 수 없습니다." }, 404);
    }

    const [achievements, classes, counsels] = await Promise.all([
      // 성적 조회 (과목 정보 포함)
      Achievement.find({ userId: studentId }).populate("subjectId", "title"),
      // 진도 파악용: 현재 수강 중인 수업 목록 (강사와 과목 정보 포함)
      Class.find({ students: studentId })
        .populate("subjectId", "title")
        .populate("instructorId", "username email"),
      // 상담 이력 조회
      Counsel.find({ studentId }).sort({ start: -1 })
    ]);

    return c.json({ 
      student,
      achievements,
      classes,
      counsels
    });
  } catch (err) {
    if (err instanceof Error) {
      return c.json({ message: "학생 상세 조회 실패", error: err.message }, 500);
    }
    return c.json({ message: "학생 상세 조회 실패", error: "알 수 없는 오류" }, 500);
  }
};

// 학부모 목록 조회
studentController.getParents = async (c: Context) => {
  try {
    const parents = await User.find({ role: "parent" })
      .select("-password")
      .populate("children", "username email phone status");

    return c.json({ parents });
  } catch (err) {
    if (err instanceof Error) {
      return c.json({ message: "학부모 목록 조회 실패", error: err.message }, 500);
    }
    return c.json({ message: "학부모 목록 조회 실패", error: "알 수 없는 오류" }, 500);
  }
};

export default studentController;