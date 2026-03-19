import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import indexRouter from "./routes/index";

const app = new Hono();

app.use("*", logger());
app.use(
  "*",
  cors({
    origin: process.env.CLIENT_URL || "*",
    credentials: true,
  }),
);

/**
 * 전역 에러 핸들러
 * 라우터 내부에서 catch되지 않은 모든 에러를 여기서 처리합니다.
 */
app.onError((err, c) => {
  console.error(`[서버 에러] ${c.req.method} ${c.req.url}:`, err);

  // 에러 응답 규격 통일
  return c.json(
    {
      success: false,
      message: err.message || "서버 내부 오류가 발생했습니다.",
    },
    500,
  );
});

app.route("api", indexRouter);

export default app;
