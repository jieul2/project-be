import { Hono } from "hono";
import authController from "../controllers/auth.controller";
const router = new Hono();

router.post("/signup", authController.createSignup);
router.post("/signin", authController.createSignin);

export default router;
