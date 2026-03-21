import { Schema, model, InferSchemaType } from "mongoose";

// 1. 스키마 정의
const parentStudentSchema = new Schema(
  {
    parentId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    studentId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

// 2. 타입 추출
export type IParentStudent = InferSchemaType<typeof parentStudentSchema>;

// 3. 모델 생성
const ParentStudent = model<IParentStudent>("ParentStudent", parentStudentSchema);

export default ParentStudent;