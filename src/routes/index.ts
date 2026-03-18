import { Hono } from "hono";
import authApi from "./auth.api";
const router = new Hono();

router.route("/auth", authApi);

export default router;
