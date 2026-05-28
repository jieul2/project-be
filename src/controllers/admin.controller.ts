import { Context } from "hono";
import User from "../models/User";
import { AdminController } from "../types/admin.types";
import * as bcrypt from "bcrypt-ts";

const adminController: AdminController = {} as AdminController;

const requireAdmin = (c: Context) => {
  const user = c.get("user");
  if (!user || user.role !== "admin") {
    return c.json({ message: "관리자 권한이 필요합니다." }, 403);
  }
  return null;
};

adminController.getUsers = async (c: Context) => {
  const denied = requireAdmin(c);
  if (denied) return denied;

  try {
    const { page = "1", limit = "10", role, name } = c.req.query();

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(100, Math.max(1, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    const filter: Record<string, any> = {};
    if (role) filter.role = role;
    if (name) filter.username = { $regex: name, $options: "i" };

    const [users, total] = await Promise.all([
      User.find(filter)
        .select("-password")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      User.countDocuments(filter),
    ]);

    return c.json({
      users,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    if (err instanceof Error) {
      return c.json({ message: "유저 목록 조회 실패", error: err.message }, 500);
    }
    return c.json({ message: "유저 목록 조회 실패", error: "알 수 없는 오류" }, 500);
  }
};

adminController.updateUser = async (c: Context) => {
  const denied = requireAdmin(c);
  if (denied) return denied;

  try {
    const { userId } = c.req.param();
    const body = await c.req.json();

    if (body.password) {
      body.password = await bcrypt.hash(String(body.password), 10);
    }

    const ALLOWED = [
      "username",
      "email",
      "phone",
      "role",
      "status",
      "birthDate",
      "gender",
      "password",
    ];
    const updateData: Record<string, any> = {};
    for (const key of ALLOWED) {
      if (body[key] !== undefined && body[key] !== "") {
        updateData[key] = body[key];
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true },
    ).select("-password");

    if (!updatedUser) {
      return c.json({ message: "유저를 찾을 수 없습니다." }, 404);
    }

    return c.json({ message: "유저 정보 업데이트 성공", user: updatedUser });
  } catch (err) {
    if (err instanceof Error) {
      return c.json({ message: "유저 업데이트 실패", error: err.message }, 500);
    }
    return c.json({ message: "유저 업데이트 실패", error: "알 수 없는 오류" }, 500);
  }
};

adminController.deleteUser = async (c: Context) => {
  const denied = requireAdmin(c);
  if (denied) return denied;

  try {
    const requester = c.get("user");
    const { userId } = c.req.param();

    if (requester.id === userId) {
      return c.json({ message: "본인 계정은 삭제할 수 없습니다." }, 400);
    }

    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) {
      return c.json({ message: "유저를 찾을 수 없습니다." }, 404);
    }

    return c.json({ message: "유저 삭제 완료" });
  } catch (err) {
    if (err instanceof Error) {
      return c.json({ message: "유저 삭제 실패", error: err.message }, 500);
    }
    return c.json({ message: "유저 삭제 실패", error: "알 수 없는 오류" }, 500);
  }
};

export default adminController;
