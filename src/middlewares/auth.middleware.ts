// 로그인한 사용자의 요청에 대해 JWT 토큰을 검증하여 사용자 정보를 추출하고
// 인증된 사용자만 접근할 수 있도록 하는 미들웨어입니다.

// c.get("user")로 컨텍스트에서 사용자 정보를 가져올 수 있습니다.

import { Context, Next } from "hono";
import { verify } from "hono/jwt";

type UserPayload = {
  id: string;
  email: string;
  username: string;
  role: string;
};

declare module "hono" {
  interface ContextVariableMap {
    user: UserPayload;
  }
}

export const authMiddleware = async (c: Context, next: Next) => {
  try {
    // Authorization 헤더에서 토큰 추출
    const authHeader = c.req.header("Authorization");

    // 1. 토큰 존재 여부 확인
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return c.json({ message: "인증 토큰이 필요합니다." }, 401);
    }
    // "Bearer " 접두어 제거하여 실제 토큰만 추출
    const token = authHeader.split(" ")[1];

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET is missing!");
    }

    // 2. 토큰 검증
    const decoded = await verify(token, secret, "HS256");

    // 3. 검증된 토큰에서 사용자 정보 추출하여 컨텍스트에 저장
    c.set("user", decoded as UserPayload);

    // 4. 다음 미들웨어 또는 핸들러로 이동
    await next();
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "알 수 없는 오류";
    return c.json({ message: "인증 실패", error: errorMessage }, 401);
  }
};
