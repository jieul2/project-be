import { Hono } from "hono";
import User from "../models/User";
import bcrypt from "bcrypt";
import { userEmailSchema, updateUserSchema, validateBody } from "../middlewares/user.middleware";

const userApi = new Hono();

// 프로필 정보 조회 (GET /api/user/me?email=...)
// TODO: 현재는 쿼리 파라미터를 사용하지만, 추후 JWT 토큰 인증 도입 시 토큰에서 사용자 정보를 추출하도록 수정하기
userApi.get("/me", async (c) => {
  const email = c.req.query("email");
  
  // 이메일 형식 직접 검증
  const validatedEmail = userEmailSchema.parse(email);

  const user = await User.findOne({ email: validatedEmail }).select("-password");
  if (!user) return c.json({ message: "사용자를 찾을 수 없습니다." }, 404);

  return c.json(user);
});

// 프로필 정보 수정 (PUT /api/user/me?email=...)
userApi.put("/me", validateBody(updateUserSchema), async (c) => {
  const email = userEmailSchema.parse(c.req.query("email"));
  const body = await c.req.json();

  // 비밀번호가 본문에 포함되어 있다면 해싱하기
  if (body.password) {
    const saltRounds = 10;
    body.password = await bcrypt.hash(body.password, saltRounds);
  }

  const updatedUser = await User.findOneAndUpdate(
    { email },
    body, 
    { new: true, runValidators: true }
  ).select("-password");

  if (!updatedUser) return c.json({ message: "수정할 사용자를 찾을 수 없습니다." }, 404);
  return c.json(updatedUser);
});

// 회원 탈퇴 (DELETE /api/user/me?email=...)
userApi.delete("/me", async (c) => {
  const email = userEmailSchema.parse(c.req.query("email"));
  const { password } = await c.req.json();

  if (!password) {
    return c.json({ message: "비밀번호를 입력해주세요." }, 400);
  }

  // 사용자 찾기 (비밀번호 검증을 위해 password 필드 포함)
  const user = await User.findOne({ email });
  if (!user) return c.json({ message: "사용자를 찾을 수 없습니다." }, 404);

  // 비밀번호 비교하기 (입력된 평문 vs DB의 해싱된 암호)
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return c.json({ message: "비밀번호가 일치하지 않습니다." }, 401);
  }

  // 일치할 경우 삭제 진행하기
  await User.deleteOne({ email });

  return c.json({ message: "회원 탈퇴가 완료되었습니다." });
});

export default userApi;