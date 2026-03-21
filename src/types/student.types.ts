import { Context } from "hono";

export interface StudentController {
  getStudents: (c: Context) => Promise<Response>;
  getStudentById: (c: Context) => Promise<Response>;
  getParents: (c: Context) => Promise<Response>;
  linkParentAndStudent: (c: Context) => Promise<Response>;
}

export interface StudentSearchQuery {
  role: string;
  username?: { $regex: string; $options: string };
}