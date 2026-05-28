import { Context, Next } from "hono";
import Log from "../models/Log";

const SKIP_PATHS = ["/api/logs"];

// React Strict Mode(개발 환경)의 이중 effect 호출로 인한 중복 로그 방지
const recentKeys = new Map<string, number>();
const DEDUP_MS = 800;

const BODY_METHODS = ["POST", "PUT", "PATCH"];
const SANITIZE_KEYS = ["password", "currentPassword", "newPassword", "token"];

export const logMiddleware = async (c: Context, next: Next) => {
  // Capture body before the route handler consumes the stream
  let body: Record<string, unknown> | null = null;
  if (BODY_METHODS.includes(c.req.method)) {
    try {
      const json = await c.req.json();
      const sanitized = { ...json };
      for (const key of SANITIZE_KEYS) delete sanitized[key];
      if (Object.keys(sanitized).length > 0) body = sanitized;
    } catch {
      // Not JSON or empty body — leave body as null
    }
  }

  await next();

  if (c.req.method === "OPTIONS") return;
  if (SKIP_PATHS.some((p) => c.req.path.startsWith(p))) return;

  const user = c.get("user");
  const key = `${c.req.method}:${c.req.path}:${user?.id ?? ""}`;
  const now = Date.now();

  const lastTime = recentKeys.get(key);
  if (lastTime && now - lastTime < DEDUP_MS) return;

  recentKeys.set(key, now);
  // 오래된 키 정리 (메모리 누수 방지)
  if (recentKeys.size > 2000) {
    for (const [k, t] of recentKeys) {
      if (now - t > DEDUP_MS) recentKeys.delete(k);
    }
  }

  const ip =
    c.req.header("x-forwarded-for")?.split(",")[0].trim() || c.req.header("x-real-ip") || "unknown";

  Log.create({
    userId: user?.id ?? null,
    username: user?.username ?? "anonymous",
    role: user?.role ?? "unknown",
    method: c.req.method,
    path: c.req.path,
    statusCode: c.res.status,
    ip,
    body,
  }).catch((err) => console.error("[Log Middleware] DB 저장 실패:", err));
};
