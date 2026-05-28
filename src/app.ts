import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import indexRouter from "./routes/index";
import { logMiddleware } from "./middlewares/log.middleware";
import { softAuthMiddleware } from "./middlewares/softAuth.middleware";

const app = new Hono();

app.use("*", logger());
app.use(
  "*",
  cors({
    origin: process.env.CLIENT_URL || "*",
    credentials: true,
  }),
);

// 토큰이 있으면 user를 설정 (강제하지 않음) — logMiddleware가 user 정보를 읽기 위해 필요
app.use("*", softAuthMiddleware);
// DB 로그 미들웨어
app.use("*", logMiddleware);

app.onError((err, c) => {
  console.error(`[서버 에러] ${c.req.method} ${c.req.url}:`, err);
  return c.json({ success: false, message: err.message || "서버 내부 오류가 발생했습니다." }, 500);
});

app.route("/api", indexRouter);

export default app;
