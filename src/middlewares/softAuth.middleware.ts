import { Context, Next } from "hono";
import { verify } from "hono/jwt";

type UserPayload = {
  id: string;
  email: string;
  username: string;
  role: string;
};

// 토큰이 있으면 디코딩하여 user를 설정하지만, 없거나 유효하지 않아도 요청을 차단하지 않습니다.
// logMiddleware에서 user 정보를 읽기 위해 전역으로 적용합니다.
export const softAuthMiddleware = async (c: Context, next: Next) => {
  try {
    const authHeader = c.req.header("Authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      const secret = process.env.JWT_SECRET;
      if (secret) {
        const decoded = await verify(token, secret, "HS256");
        c.set("user", decoded as UserPayload);
      }
    }
  } catch {
    // 토큰이 없거나 유효하지 않으면 그냥 통과
  }
  await next();
};
