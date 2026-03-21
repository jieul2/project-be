import { Schema, model, InferSchemaType } from "mongoose";

// 1. 스키마 정의
const classReportsSchema = new Schema(
  {
    classId: { type: Schema.Types.ObjectId, ref: "Class", required: true },
    date: { type: Date, required: true },
    progress: { type: String, required: true }, // 진도 기록
    homework: { type: String }, // 숙제 기록 (선택)
  },
  { timestamps: true }
);

// 2. 타입 추출
export type IClassReports = InferSchemaType<typeof classReportsSchema>;

// 3. 모델 생성
const ClassReports = model<IClassReports>("ClassReports", classReportsSchema);

export default ClassReports;