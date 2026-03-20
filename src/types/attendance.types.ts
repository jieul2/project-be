import { Context } from "hono";

export interface AttendanceController {
  checkAttendance: (c: Context) => Promise<Response>;
}