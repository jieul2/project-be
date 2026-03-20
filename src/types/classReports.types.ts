import { Context } from "hono";

export interface ClassReportsController {
  createClassReport: (c: Context) => Promise<Response>;
}