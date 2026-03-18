import { Hono } from "hono";
import authController from "../controllers/auth.controller";
const router = new Hono();

router.post("/signup", authController.signup);
router.post("/signin", authController.signin);

export default router;
