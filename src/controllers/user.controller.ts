import User from "../models/User";
import { Context } from "hono";
import { UserController } from "../types/user.types";
import * as bcrypt from "bcrypt-ts";

const userController: UserController = {} as UserController;

userController.getUser = async (c: Context) => {
    try {
        const user = c.get("user");
        if (!user) throw new Error("사용자를 찾을 수 없습니다.");

        return c.json(user);
    }
    catch (err) {
        if (err instanceof Error) {
            return c.json({ message: "사용자 조회 실패", error: err.message }, 400);
        }
        return c.json({ message: "사용자 조회 실패", error: "알 수 없는 오류" }, 400);
    }
}

userController.updateUser = async (c: Context) => {
    try {
        const user = c.get("user");
        const body = await c.req.json();
    
        if (!user) throw new Error("사용자를 찾을 수 없습니다.");
        if (body.password) {
        const saltRounds = 10;
        body.password = await bcrypt.hash(body.password, saltRounds);
      }
    
      const updatedUser = await User.findOneAndReplace(
        { _id: user.id },
        body, 
        { returnDocument: 'after', runValidators: true }
      ).select("-password");
        return c.json(updatedUser);
    }
    
    catch (err) {
        if (err instanceof Error) {
            return c.json({ message: "사용자 조회 실패", error: err.message }, 400);
        }
        return c.json({ message: "사용자 조회 실패", error: "알 수 없는 오류" }, 400);
    }
}

userController.deleteUser = async (c: Context) => {

    try {
        const user = c.get("user");
      const { password } = await c.req.json();
    
        if (!user) throw new Error("사용자를 찾을 수 없습니다.");
      if (!password) {
        throw new Error("비밀번호를 입력해주세요.");
      }
const getPasswordUser = await User.findById(user.id);
      if (!getPasswordUser) {
        throw new Error("사용자를 찾을 수 없습니다.");
      }
      // 비밀번호 비교하기 (입력된 평문 vs DB의 해싱된 암호)
      const isMatch = await bcrypt.compare(password, getPasswordUser.password);
      if (!isMatch) {
        throw new Error("비밀번호가 일치하지 않습니다.");
      }
    
      // 일치할 경우 삭제
      await User.deleteOne({ _id: user.id });
    
    return c.json({ message: "회원 탈퇴가 완료되었습니다." });
    }
    catch (err) {
        if (err instanceof Error) {
            return c.json({ message: "사용자 조회 실패", error: err.message }, 400);
        }
        return c.json({ message: "사용자 조회 실패", error: "알 수 없는 오류" }, 400);
    }
}


export default userController;