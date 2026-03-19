import { Hono } from "hono";
import userApi from "./user.api";
import authApi from "./auth.api";

const router = new Hono();

router.route("/user", userApi);
router.route("/auth", authApi);

export default router;
