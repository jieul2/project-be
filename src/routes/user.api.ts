import { Hono } from "hono";
import userController from "../controllers/user.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const userApi = new Hono();

userApi.get("/me", authMiddleware, userController.getUser);
userApi.put("/me", authMiddleware, userController.updateUser);
userApi.delete("/me", authMiddleware, userController.deleteUser);
userApi.get("/instructors", authMiddleware, userController.getInstructors);

export default userApi;