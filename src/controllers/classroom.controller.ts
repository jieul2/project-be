import { Context } from "hono";
import Classroom from "../models/Classroom";
import { ClassesController } from "../types/classroom.types";

const classroomController: ClassesController = {} as ClassesController;

classroomController.getClasses = async (c: Context) => {
  try {
    const classrooms = await Classroom.find();
    return c.json({ classrooms }, 200);
  } catch (err) {
    if (err instanceof Error) {
      return c.json({ message: "강의실 조회 실패", error: err.message }, 400);
    }
    return c.json({ message: "강의실 조회 실패", error: "알 수 없는 오류" }, 400);
  }
};

classroomController.createClass = async (c: Context) => {
  try {
    const { classroomName } = await c.req.json();
    if (!classroomName) {
      throw new Error("강의실 이름이 필요합니다.");
    }
    const newClassroom = new Classroom({ classroomName });
    await newClassroom.save();
    return c.json({ message: "강의실이 성공적으로 생성되었습니다.", classroom: newClassroom }, 201);
  } catch (err) {
    if (err instanceof Error) {
      return c.json({ message: "강의실 생성 실패", error: err.message }, 400);
    }
    return c.json({ message: "강의실 생성 실패", error: "알 수 없는 오류" }, 400);
  }
};

classroomController.updateClass = async (c: Context) => {
  try {
    const { classId } = c.req.param();
    const { classroomName } = await c.req.json();
    if (!classroomName) {
      throw new Error("강의실 이름이 필요합니다.");
    }
    const updatedClassroom = await Classroom.findByIdAndUpdate(
      classId,
      { classroomName },
      { new: true },
    );
    if (!updatedClassroom) {
      throw new Error("강의실을 찾을 수 없습니다.");
    }
    return c.json(
      { message: "강의실이 성공적으로 업데이트되었습니다.", classroom: updatedClassroom },
      200,
    );
  } catch (err) {
    if (err instanceof Error) {
      return c.json({ message: "강의실 업데이트 실패", error: err.message }, 400);
    }
    return c.json({ message: "강의실 업데이트 실패", error: "알 수 없는 오류" }, 400);
  }
};

classroomController.deleteClass = async (c: Context) => {
  try {
    const { classId } = c.req.param();
    const deletedClassroom = await Classroom.findByIdAndDelete(classId);
    if (!deletedClassroom) {
      throw new Error("강의실을 찾을 수 없습니다.");
    }
    return c.json({ message: "강의실이 성공적으로 삭제되었습니다." }, 200);
  } catch (err) {
    if (err instanceof Error) {
      return c.json({ message: "강의실 삭제 실패", error: err.message }, 400);
    }
    return c.json({ message: "강의실 삭제 실패", error: "알 수 없는 오류" }, 400);
  }
};

export default classroomController;
