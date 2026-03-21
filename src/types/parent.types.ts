import { Context } from "hono";

export interface ParentController {
  getParents: (c: Context) => Promise<Response>;
}