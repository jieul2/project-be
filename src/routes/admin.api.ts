import { Hono } from "hono";
import adminController from "../controllers/admin.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = new Hono();

router.get("/users", authMiddleware, adminController.getUsers);
router.put("/users/:userId", authMiddleware, adminController.updateUser);
router.delete("/users/:userId", authMiddleware, adminController.deleteUser);

export default router;
