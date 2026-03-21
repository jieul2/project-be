import { Context } from "hono";

export interface SubjectController {
  // 과목 조회
  getSubjects: (c: Context) => Promise<Response>;
  // 과목 업데이트
  updateSubject: (c: Context) => Promise<Response>;
  // 과목 생성
  createSubject: (c: Context) => Promise<Response>;
  // 과목 삭제
  deleteSubject: (c: Context) => Promise<Response>;
}
