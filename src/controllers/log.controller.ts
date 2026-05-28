import { Context } from "hono";
import Log from "../models/Log";
import { LogController } from "../types/log.types";

const logController: LogController = {} as LogController;

logController.getLogs = async (c: Context) => {
  try {
    const requester = c.get("user");
    if (!requester || requester.role !== "admin") {
      return c.json({ message: "관리자 권한이 필요합니다." }, 403);
    }

    const { page = "1", limit = "30", method, role, userId, username, status } = c.req.query();

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(100, Math.max(1, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    const filter: Record<string, any> = {};
    if (method) filter.method = method.toUpperCase();
    if (role) filter.role = role;
    if (userId) filter.userId = userId;
    if (username) filter.username = { $regex: username, $options: "i" };
    if (status) {
      if (status === "2xx") filter.statusCode = { $gte: 200, $lt: 300 };
      else if (status === "4xx") filter.statusCode = { $gte: 400, $lt: 500 };
      else if (status === "5xx") filter.statusCode = { $gte: 500 };
      else if (!isNaN(Number(status))) filter.statusCode = Number(status);
    }

    const [logs, total] = await Promise.all([
      Log.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
      Log.countDocuments(filter),
    ]);

    return c.json({
      logs,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    if (err instanceof Error) {
      return c.json({ message: "로그 조회 실패", error: err.message }, 500);
    }
    return c.json({ message: "로그 조회 실패", error: "알 수 없는 오류" }, 500);
  }
};

logController.deleteLogs = async (c: Context) => {
  try {
    const requester = c.get("user");
    if (!requester || requester.role !== "admin") {
      return c.json({ message: "관리자 권한이 필요합니다." }, 403);
    }

    const { all, before, method } = c.req.query();

    const filter: Record<string, any> = {};

    if (all === "true") {
      // 필터 없이 전체 삭제
    } else {
      if (before) filter.createdAt = { $lt: new Date(before) };
      if (method) filter.method = method.toUpperCase();
    }

    const result = await Log.deleteMany(filter);

    return c.json({
      message: `${result.deletedCount}건의 로그가 삭제되었습니다.`,
      deletedCount: result.deletedCount,
    });
  } catch (err) {
    if (err instanceof Error) {
      return c.json({ message: "로그 삭제 실패", error: err.message }, 500);
    }
    return c.json({ message: "로그 삭제 실패", error: "알 수 없는 오류" }, 500);
  }
};

export default logController;
