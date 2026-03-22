import { Context } from "hono";

export interface ClassesController {
  // 클래스 조회
  getClasses: (c: Context) => Promise<Response>;
  // 클래스 등록
  createClass: (c: Context) => Promise<Response>;
  // 클래스 수정
  updateClass: (c: Context) => Promise<Response>;
  // 클래스 삭제
  deleteClass: (c: Context) => Promise<Response>;
}
