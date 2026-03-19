import { Context } from "hono";

export interface AuthController {
  createSignup: (c: Context) => Promise<Response>;
  createSignin: (c: Context) => Promise<Response>;
}

export interface JwtPayload {
  id: string; // 사용자 ID
  username: string; // 사용자 이름
  email: string; // 사용자 이메일
  role: string; // 사용자 역할 (student, instructor, admin)
  phone: string; // 사용자 전화번호
  exp: number; // 토큰 만료 시간 (Unix timestamp)
  [key: string]: any; // 추가적인 사용자 정보 허용
}
