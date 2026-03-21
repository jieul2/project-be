import { Context } from "hono";
import { Types } from "mongoose";

export interface StudentController {
  getStudents: (c: Context) => Promise<Response>;
  getStudentById: (c: Context) => Promise<Response>;
  linkParentAndStudent: (c: Context) => Promise<Response>;
  getMappingByStudentId: (c: Context) => Promise<Response>;
}

export interface StudentSearchQuery {
  role: string;
  _id?: { $nin: Types.ObjectId[] | string[] }; 
  username?: { $regex: string; $options: string };
}