import { Context } from "hono";

export interface ClassroomController {
  // 강의실 조회
  getClassroom: (c: Context) => Promise<Response>;
  // 강의실 등록
  createClassroom: (c: Context) => Promise<Response>;
  // 강의실 수정
  updateClassroom: (c: Context) => Promise<Response>;
  // 강의실 삭제
  deleteClassroom: (c: Context) => Promise<Response>;
}
