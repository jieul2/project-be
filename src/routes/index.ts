import { Hono } from "hono";

const router = new Hono();

router.get("/", (c) => {
  return c.text("Hello, World!");
});

export default router;
