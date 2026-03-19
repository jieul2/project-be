import { Hono } from "hono";
import User from "../models/User";

const userApi = new Hono();

// 프로필 정보 조회 (GET /api/user/me?email=...)
userApi.get("/me", async (c) => {
  try {
  // 쿼리 파라미터에서 email 값 추출하기
    const email = c.req.query("email");

    if (!email) {
      return c.json({ message: "이메일 파라미터가 필요합니다." }, 400);
    }

    // DB에서 해당 이메일을 가진 사용자 찾기 (비밀번호 제외)
    // TODO: 현재는 쿼리 파라미터를 사용하지만, 추후 JWT 토큰 인증 도입 시 토큰에서 사용자 정보를 추출하도록 수정하기
    const user = await User.findOne({ email }).select("-password");

    if (!user) {
      return c.json({ message: "해당 이메일의 사용자를 찾을 수 없습니다." }, 404);
    }

    return c.json(user);
  } catch (error) {
    return c.json({ message: "프로필 조회 중 오류가 발생했습니다." }, 500);
  }
});

// 프로필 정보 수정 (PUT /api/user/me?email=...)
userApi.put("/me", async (c) => {
  try {
    const email = c.req.query("email");

    if (!email) {
      return c.json({ message: "이메일 파라미터가 필요합니다." }, 400);
    }

    const body = await c.req.json();
    const { username, password, role, phone, status } = body;

// 사용자 정보 업데이트 수행하기
    // TODO: findOneAndUpdate({})의 빈 조건을 현재 로그인한 사용자의 ID 또는 이메일 조건으로 교체하기
    // TODO: 비밀번호 수정 시 해싱(Hashing) 로직 추가하기
    const updatedUser = await User.findOneAndUpdate(
      { email }, // 조회 조건: 쿼리로 받은 이메일 사용하기
      { username, password, role, phone, status },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return c.json({ message: "수정할 사용자를 찾을 수 없습니다." }, 404);
    }
    return c.json(updatedUser);
  }

  catch (error) {
    console.error("프로필 수정 에러:", error);
    return c.json({ message: "프로필 수정 중 오류가 발생했습니다." }, 500);
  }
});

// 회원 탈퇴 (DELETE /api/user/me?email=...)
userApi.delete("/me", async (c) => {
  try {
    const email = c.req.query("email");

    if (!email) {
      return c.json({ message: "이메일 파라미터가 필요합니다." }, 400);
    }

    // 본문에서 삭제 확인용 비밀번호 가져오기
    const { password } = await c.req.json();

    // DB에서 사용자 데이터 삭제하기
    // TODO: 입력받은 password와 DB의 비밀번호 비교 로직 추가하기
    const deletedUser = await User.findOneAndDelete({ email });
    
  if (!deletedUser) {
      return c.json({ message: "삭제할 사용자를 찾을 수 없습니다." }, 404);
    }

    return c.json({ message: "회원 탈퇴가 완료되었습니다." });
  } catch (error) {
    console.error("회원 탈퇴 에러:", error);
    return c.json({ message: "회원 탈퇴 처리 중 오류가 발생했습니다." }, 500);
  }
});

export default userApi;