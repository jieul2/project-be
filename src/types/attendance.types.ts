import { Context } from "hono";

export interface AttendanceController {
  checkAttendance: (c: Context) => Promise<Response>;
}

export interface AttendanceRecordPayload {
  studentId: string;
  status: "present" | "absent" | "late";
  reason?: string;
}