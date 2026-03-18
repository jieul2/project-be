import User from "../models/User";
import { decode, sign, verify } from "hono/jwt";
import * as bcrypt from "bcrypt-ts";
import { Context } from "hono";

interface AuthController {
  signup: (c: Context) => Promise<Response>;
}
const authController: AuthController = {} as AuthController;

authController.signup = async (c: Context) => {
  try {
    const { email, password, username, role, phone } = await c.req.json();

    // 필수 필드 검증
    if (!email || !password || !username || !role || !phone) {
      throw new Error("모든 필드가 필요합니다.");
    }

    // 이메일 중복 검증
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error("이미 존재하는 사용자입니다.");
    }
    // 비밀번호 해싱
    const hashed = await bcrypt.hash(password, 10);
    // 사용자 생성
    const user = await User.create({
      email,
      password: hashed,
      username,
      role,
      phone,
    });

    return c.json({ message: "회원가입 성공", user }, 201);
  } catch (err) {
    if (err instanceof Error) {
      return c.json({ message: "회원가입 실패", error: err.message }, 400);
    }
    return c.json({ message: "회원가입 실패", error: "알 수 없는 오류" }, 400);
  }
};

export default authController;
