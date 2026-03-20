import { Hono } from "hono";
import userApi from "./user.api";
import authApi from "./auth.api";
import studentApi from "./student.api";
import attendanceApi from "./attendance.api";
import classReportsApi from "./classReports.api";
import paymentsApi from "./Payments.api";
import calendarApi from "./calendar.api";

const router = new Hono();

router.route("/user", userApi);
router.route("/auth", authApi);
router.route("/students", studentApi);
router.route("/attendance", attendanceApi);
router.route("/class-reports", classReportsApi);

router.route("/payments", paymentsApi);
router.route("/calendar", calendarApi);
export default router;
