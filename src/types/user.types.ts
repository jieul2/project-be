import { Context } from "hono";

export interface UserController {
  getUser: (c: Context) => Promise<Response>;
  updateUser: (c: Context) => Promise<Response>;
  deleteUser: (c: Context) => Promise<Response>;
}
