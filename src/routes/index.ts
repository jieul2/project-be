import { Hono } from "hono";
import userApi from "./user.api";

const router = new Hono();

router.route("/user", userApi);

export default router;
