import { Context } from "hono";
import { SubjectController } from "../types/subject.types";
import Subject from "../models/Subject";

const subjectController: SubjectController = {} as SubjectController;

subjectController.getSubjects = async (c: Context) => {
  try {
    const subjects = await Subject.find();
    if (!subjects) {
      throw new Error("과목을 찾을 수 없습니다.");
    }
    return c.json({ subjects }, 200);
  } catch (err) {
    if (err instanceof Error) {
      return c.json({ message: "과목 조회 실패", error: err.message }, 400);
    }
    return c.json({ message: "과목 조회 실패", error: "알 수 없는 오류" }, 400);
  }
};

subjectController.createSubject = async (c: Context) => {
  try {
    const { title } = await c.req.json();
    if (!title) {
      throw new Error("필수 필드가 누락되었습니다.");
    }
    const newSubject = await Subject.create({ title });
    return c.json({ message: "과목 생성 성공", subject: newSubject }, 200);
  } catch (err) {
    if (err instanceof Error) {
      return c.json({ message: "과목 생성 실패", error: err.message }, 400);
    }
    return c.json({ message: "과목 생성 실패", error: "알 수 없는 오류" }, 400);
  }
};

subjectController.deleteSubject = async (c: Context) => {
  try {
    const { subjectId } = c.req.param();
    const result = await Subject.findByIdAndDelete(subjectId);
    if (!result) {
      throw new Error("과목을 찾을 수 없습니다.");
    }
    return c.json({ message: "과목 삭제 성공" }, 200);
  } catch (err) {
    if (err instanceof Error) {
      return c.json({ message: "과목 삭제 실패", error: err.message }, 400);
    }
    return c.json({ message: "과목 삭제 실패", error: "알 수 없는 오류" }, 400);
  }
};

subjectController.updateSubject = async (c: Context) => {
  try {
    const { subjectId } = c.req.param();
    const { title } = await c.req.json();
    if (!title) {
      throw new Error("필수 필드가 누락되었습니다.");
    }
    const updatedSubject = await Subject.findByIdAndUpdate(
      subjectId,
      { title },
      { returnDocument: "after" },
    );
    if (!updatedSubject) {
      throw new Error("과목을 찾을 수 없습니다.");
    }
    return c.json({ message: "과목 업데이트 성공", subject: updatedSubject }, 200);
  } catch (err) {
    if (err instanceof Error) {
      return c.json({ message: "과목 업데이트 실패", error: err.message }, 400);
    }
    return c.json({ message: "과목 업데이트 실패", error: "알 수 없는 오류" }, 400);
  }
};

export default subjectController;
