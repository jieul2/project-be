import { Hono } from "hono";
import userApi from "./user.api";
import authApi from "./auth.api";
import studentApi from "./student.api";

const router = new Hono();

router.route("/user", userApi);
router.route("/auth", authApi);
router.route("/students", studentApi);

export default router;
