import { Schema, model, InferSchemaType } from "mongoose";

// 1. 스키마 정의
const userSchema = new Schema(
  {
    username: { type: String, required: true },
    role: {
      type: String,
      enum: ["instructor", "admin", "user"],
      default: "user",
    },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    phone: { type: String },
    birthDate: { type: Date },
    gender: { type: String, enum: ["male", "female"] },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  { timestamps: true },
);

// 2. 타입 추출
export type IUser = InferSchemaType<typeof userSchema>;

// 3. 모델 생성
const User = model<IUser>("User", userSchema);

export default User;
