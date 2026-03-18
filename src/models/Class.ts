import { Schema, model, InferSchemaType } from "mongoose";

// 1. 스키마 정의 (값 정의)
const classSchema = new Schema(
  {
    classroomId: { type: Schema.Types.ObjectId, ref: "Classroom", required: true },
    subjectId: { type: Schema.Types.ObjectId, ref: "Subject", required: true },
    instructorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    students: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true },
);

// 2. 스키마로부터 타입을 자동으로 추출 (InferSchemaType 활용)
// 이렇게 하면 스키마를 수정할 때 타입도 자동으로 업데이트됩니다!
export type IClass = InferSchemaType<typeof classSchema>;

// 3. 모델 생성 및 내보내기
const Class = model<IClass>("Class", classSchema);

export default Class;
