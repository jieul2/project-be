import { Context } from "hono";

export interface CounselController {
  getCounselHistory: (c: Context) => Promise<Response>;
  analyzeCounsel: (c: Context) => Promise<Response>;
  generateMessage: (c: Context) => Promise<Response>;
}