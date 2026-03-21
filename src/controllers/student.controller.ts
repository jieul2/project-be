import User from "../models/User";
import Achievement from "../models/Achievement";
import Class from "../models/Class";
import Counsel from "../models/Counsel";
import ParentStudent from "../models/ParentStudent";
import { Context } from "hono";
import { StudentController, StudentSearchQuery } from "../types/student.types";

const studentController: StudentController = {} as StudentController;

// 학생 목록 조회
studentController.getStudents = async (c: Context) => {
  try {
    const searchName = c.req.query("name");
    
    // 기본 조건: 학생 롤을 가진 사용자
    const query: StudentSearchQuery = { role: "student" };
    
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
    const parents = await User.find({ role: "parent" }).select("-password").lean();

    const parentIds = parents.map((p) => p._id);

    const parentStudentMappings = await ParentStudent.find({
      parentId: { $in: parentIds },
    }).populate("studentId", "username email phone status");

    const parentsWithStudents = parents.map((parent) => {
      const students = parentStudentMappings
        .filter((mapping) => String(mapping.parentId) === String(parent._id))
        .map((mapping) => mapping.studentId);

      return { ...parent, students };
    });

    return c.json({ parents: parentsWithStudents });
  } catch (err) {
    if (err instanceof Error) {
      return c.json({ message: "학부모 목록 조회 실패", error: err.message }, 500);
    }
    return c.json({ message: "학부모 목록 조회 실패", error: "알 수 없는 오류" }, 500);
  }
};

// 학부모-학생 연결 (Mapping 생성)
studentController.linkParentAndStudent = async (c: Context) => {
  try {
    // 권한 체크: 관리자나 강사만 연결 가능하게 설정 (선택 사항)
    const user = c.get("user");
    if (!user || (user.role !== "admin" && user.role !== "instructor")) {
      return c.json({ message: "권한이 없습니다." }, 403);
    }

    const { parentId, studentId } = await c.req.json();

    if (!parentId || !studentId) {
      throw new Error("학부모 ID와 학생 ID가 모두 필요합니다.");
    }

    // 이미 연결되어 있는지 확인
    const existingMapping = await ParentStudent.findOne({ parentId, studentId });
    if (existingMapping) {
      return c.json({ message: "이미 연결된 학부모와 학생입니다." }, 400);
    }

    // 새로운 연결 생성
    const mapping = await ParentStudent.create({ parentId, studentId });

    return c.json({ message: "학부모와 학생이 성공적으로 연결되었습니다.", mapping }, 201);
  } catch (err) {
    if (err instanceof Error) {
      return c.json({ message: "연결 실패", error: err.message }, 500);
    }
    return c.json({ message: "연결 실패", error: "알 수 없는 오류" }, 500);
  }
};

export default studentController;