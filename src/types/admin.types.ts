import { Context } from "hono";

export interface AdminController {
  getUsers: (c: Context) => Promise<Response>;
  updateUser: (c: Context) => Promise<Response>;
  deleteUser: (c: Context) => Promise<Response>;
}
