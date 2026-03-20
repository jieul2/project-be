import { Context } from "hono";

export interface CounselController {
  getCounselHistory: (c: Context) => Promise<Response>;
}