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
    const { name: searchName, page = 1, limit = 10 } = c.req.query();

    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const query: StudentSearchQuery = { role: "user" };

    if (searchName) {
      query.username = { $regex: searchName, $options: "i" };
    }

    // 1. 데이터 조회와 전체 개수 계산을 동시에 수행
    const [students, total] = await Promise.all([
      User.find(query).skip(skip).limit(limitNumber).select("-password").sort({ createdAt: -1 }),
      User.countDocuments(query),
    ]);

    // 2. 전체 페이지 수 계산
    const totalPages = Math.ceil(total / limitNumber);

    return c.json({
      students,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total,
        totalPages,
      },
    });
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

    const student = await User.findOne({ _id: studentId, role: "user" }).select("-password");

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
      Counsel.find({ studentId }).sort({ start: -1 }),
    ]);

    return c.json({
      student,
      achievements,
      classes,
      counsels,
    });
  } catch (err) {
    if (err instanceof Error) {
      return c.json({ message: "학생 상세 조회 실패", error: err.message }, 500);
    }
    return c.json({ message: "학생 상세 조회 실패", error: "알 수 없는 오류" }, 500);
  }
};

// 학부모-학생 연결 (Mapping 생성)
studentController.linkParentAndStudent = async (c: Context) => {
  try {
    const user = c.get("user");
    if (!user || (user.role !== "admin" && user.role !== "instructor")) {
      return c.json({ message: "권한이 없습니다." }, 403);
    }

    const { parentId, studentId } = await c.req.json();

    if (!parentId || !studentId) {
      throw new Error("학부모 ID와 학생 ID가 모두 필요합니다.");
    }

    const existingMapping = await ParentStudent.findOne({ parentId, studentId });
    if (existingMapping) {
      return c.json({ message: "이미 연결된 학부모와 학생입니다." }, 400);
    }

    const mapping = await ParentStudent.create({ parentId, studentId });

    return c.json({ message: "학부모와 학생이 성공적으로 연결되었습니다.", mapping }, 201);
  } catch (err) {
    if (err instanceof Error) {
      return c.json({ message: "연결 실패", error: err.message }, 500);
    }
    return c.json({ message: "연결 실패", error: "알 수 없는 오류" }, 500);
  }
};

studentController.getMappingByStudentId = async (c: Context) => {
  try {
    const { studentId } = await c.req.json();

    if (!studentId) {
      throw new Error("조회할 학생의 ID(studentId)가 필요합니다.");
    }

    const mappingInfo = await ParentStudent.find({ studentId: studentId })
      .populate("studentId", "username email phone role")
      .populate("parentId", "username email phone role");

    return c.json({ mappingInfo });
  } catch (err) {
    if (err instanceof Error) {
      return c.json({ message: "매핑 정보 조회 실패", error: err.message }, 500);
    }
    return c.json({ message: "매핑 정보 조회 실패", error: "알 수 없는 오류" }, 500);
  }
};

export default studentController;
