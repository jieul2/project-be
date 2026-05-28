import { Context } from "hono";

export interface LogController {
  getLogs: (c: Context) => Promise<Response>;
  deleteLogs: (c: Context) => Promise<Response>;
}
