import User from "../models/User";
import { decode, sign, verify } from "hono/jwt";
import * as bcrypt from "bcrypt-ts";
import { Context } from "hono";

interface AuthController {
  signup: (c: Context) => Promise<Response>;
  signin: (c: Context) => Promise<Response>;
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

authController.signin = async (c: Context) => {
  try {
    const { email, password } = await c.req.json();

    // 필수 필드 검증
    if (!email || !password) {
      throw new Error("이메일과 비밀번호가 필요합니다.");
    }

    // 사용자 조회
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error("존재하지 않는 사용자입니다.");
    }

    // 비밀번호 검증
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error("비밀번호가 일치하지 않습니다.");
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET이 설정되지 않았습니다.");
    }

    // JWT 생성
    const payload = {
      id: String(user._id),
      username: user.username,
      email: user.email,
      role: user.role,
      exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1시간 유효
    };
    const token = await sign(payload, secret, "HS256");

    return c.json({ message: "로그인 성공", token });
  } catch (err) {
    if (err instanceof Error) {
      return c.json({ message: "로그인 실패", error: err.message }, 400);
    }
    return c.json({ message: "로그인 실패", error: "알 수 없는 오류" }, 400);
  }
};

export default authController;
