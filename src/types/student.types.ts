import { Context } from "hono";

export interface StudentController {
  getStudents: (c: Context) => Promise<Response>;
  getStudentById: (c: Context) => Promise<Response>;
  getParents: (c: Context) => Promise<Response>;
  linkParentAndStudent: (c: Context) => Promise<Response>;
}