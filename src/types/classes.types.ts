import { Context } from "hono";

export interface ClassesController {
  getClasses: (c: Context) => Promise<Response>;
  getDetailClass: (c: Context) => Promise<Response>;
  createClass: (c: Context) => Promise<Response>;
  updateClass: (c: Context) => Promise<Response>;
  deleteClass: (c: Context) => Promise<Response>;
  getAttendance: (c: Context) => Promise<Response>;
  getClassReport: (c: Context) => Promise<Response>;
}
