import { Hono } from "hono";
import authController from "../controllers/auth.controller";
const router = new Hono();

router.post("/signup", authController.signup);

export default router;
