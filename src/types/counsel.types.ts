import { Context } from "hono";

export interface CounselController {
  getCounselHistory: (c: Context) => Promise<Response>;
  analyzeCounsel: (c: Context) => Promise<Response>;
  generateMessage: (c: Context) => Promise<Response>;
  getCounselPrep: (c: Context) => Promise<Response>;
  createCounsel: (c: Context) => Promise<Response>;
}