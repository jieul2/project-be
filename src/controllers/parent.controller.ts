import User from "../models/User";
import ParentStudent from "../models/ParentStudent";
import { Context } from "hono";
import { ParentController } from "../types/parent.types";

const parentController: ParentController = {} as ParentController;

// 학부모 목록 조회 (학생 매핑 데이터 포함)
parentController.getParents = async (c: Context) => {
  try {
    const parentStudentMappings = await ParentStudent.find().populate("studentId", "username email phone status");

    if (!parentStudentMappings || parentStudentMappings.length === 0) {
      return c.json({ parents: [] });
    }

    const parentIds = [...new Set(parentStudentMappings.map((m) => m.parentId.toString()))];

    const parents = await User.find({
      _id: { $in: parentIds },
      role: "user"
    }).select("-password").lean();

    const parentsWithStudents = parents.map((parent) => {
      const students = parentStudentMappings
        .filter((mapping) => mapping.parentId.toString() === parent._id.toString())
        .map((mapping) => mapping.studentId)
        .filter(Boolean); 

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

export default parentController;