import { z } from "zod";
import { Context, Next } from "hono";

// 이메일 쿼리 파라미터 검증 스키마
export const userEmailSchema = z.string().email("올바른 이메일 형식이 아닙니다.");

// 프로필 수정 바디 검증 스키마
export const updateUserSchema = z.object({
  username: z.string().min(2, "이름은 2글자 이상이어야 합니다.").optional(),
  password: z.string().min(6, "비밀번호는 최소 6자 이상이어야 합니다.").optional(),
  phone: z.string().regex(/^\d{3}-\d{3,4}-\d{4}$/, "010-0000-0000 형식이어야 합니다.").optional(),
  role: z.enum(["user", "instructor", "admin"]).optional(),
  status: z.enum(["active", "inactive"]).optional(),
});

/**
 * Zod 에러를 깔끔하게 반환하기 위한 유틸리티 함수
 */
export const validateBody = (schema: z.ZodSchema) => async (c: Context, next: Next) => {
  try {
    const body = await c.req.json();
    schema.parse(body); // 검증 실패 시 에러 발생
    await next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ success: false, message: error.message }, 400);
    }
    return c.json({ success: false, message: "잘못된 요청 데이터입니다." }, 400);
  }
};