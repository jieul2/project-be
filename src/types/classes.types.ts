import { Context } from "hono";
import { Types } from "mongoose";

export interface ClassesController {
  getClasses: (c: Context) => Promise<Response>;
  getDetailClass: (c: Context) => Promise<Response>;
  createClass: (c: Context) => Promise<Response>;
  updateClass: (c: Context) => Promise<Response>;
  deleteClass: (c: Context) => Promise<Response>;
  getTimetable: (c: Context) => Promise<Response>;
  updateTimetable: (c: Context) => Promise<Response>;
  getAttendance: (c: Context) => Promise<Response>;
  getClassReport: (c: Context) => Promise<Response>;
  checkAttendance: (c: Context) => Promise<Response>;
  createClassReport: (c: Context) => Promise<Response>;
  getWeeklyAiSummary: (c: Context) => Promise<Response>;
}

export interface AttendanceRecordPayload {
  studentId: string;
  status: "present" | "absent" | "late";
  reason?: string;
}

export interface ClassQueryFilter {
  status?: "active" | "inactive";
  instructorId?: string | Types.ObjectId;
  "students.studentId"?: string | Types.ObjectId | { $in: (string | Types.ObjectId)[] };
}