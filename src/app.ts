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
app.route("api", indexRouter);

export default app;
