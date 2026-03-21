import { Hono } from "hono";
import userApi from "./user.api";
import authApi from "./auth.api";
import paymentsApi from "./Payments.api";
import calendarApi from "./calendar.api";
import subjectApi from "./subject.api";

const router = new Hono();

router.route("/subject", subjectApi);
router.route("/user", userApi);
router.route("/auth", authApi);
router.route("/payments", paymentsApi);
router.route("/calendar", calendarApi);
export default router;
