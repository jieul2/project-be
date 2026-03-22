import { Hono } from "hono";
import userApi from "./user.api";
import authApi from "./auth.api";
import studentApi from "./student.api";
import parentApi from "./parent.api";
import paymentsApi from "./Payments.api";
import calendarApi from "./calendar.api";
import classesApi from "./classes.api";
import subjectApi from "./subject.api";
import classroomApi from "./classroom.api";

const router = new Hono();

router.route("/subject", subjectApi);
router.route("/user", userApi);
router.route("/auth", authApi);
router.route("/students", studentApi);
router.route("/parents", parentApi);
router.route("/payments", paymentsApi);
router.route("/calendar", calendarApi);
router.route("/classes", classesApi);
router.route("/classrooms", classroomApi);
export default router;
