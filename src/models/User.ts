import { Schema, model, InferSchemaType } from "mongoose";

// 1. 스키마 정의 (값 정의)
const userSchema = new Schema(
  {
    username: { type: String, required: true, unique: true },
    // role: 기존 설정에 "parent"와 기본값인 "user"를 enum에 추가하여 유효성 검사 에러 방지
    role: { 
      type: String, 
      enum: ["student", "instructor", "admin", "parent", "user"], 
      default: "user" 
    },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    phone: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    children: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true },
);

// 2. 스키마로부터 타입을 자동으로 추출 (InferSchemaType 활용)
// 이렇게 하면 스키마를 수정할 때 타입도 자동으로 업데이트됩니다!
export type IUser = InferSchemaType<typeof userSchema>;

// 3. 모델 생성 및 내보내기
const User = model<IUser>("User", userSchema);

export default User;
