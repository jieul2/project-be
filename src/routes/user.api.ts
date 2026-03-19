import { Hono } from "hono";
import User from "../models/User";
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
// TODO: 비밀번호 수정 시 해싱(Hashing) 로직 추가하기
userApi.put("/me", validateBody(updateUserSchema), async (c) => {
  const email = userEmailSchema.parse(c.req.query("email"));
  const body = await c.req.json();

  const updatedUser = await User.findOneAndUpdate(
    { email },
    body, // 검증된 바디 데이터 사용
    { new: true, runValidators: true }
  ).select("-password");

  if (!updatedUser) return c.json({ message: "수정할 사용자를 찾을 수 없습니다." }, 404);
  return c.json(updatedUser);
});

// 회원 탈퇴 (DELETE /api/user/me?email=...)
// TODO: 입력받은 password와 DB의 비밀번호 비교 로직 추가하기
userApi.delete("/me", async (c) => {
  const email = userEmailSchema.parse(c.req.query("email"));
  
  const deletedUser = await User.findOneAndDelete({ email });
  if (!deletedUser) return c.json({ message: "삭제할 사용자를 찾을 수 없습니다." }, 404);

  return c.json({ message: "회원 탈퇴가 완료되었습니다." });
});

export default userApi;