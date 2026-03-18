import { Schema, model, InferSchemaType } from "mongoose";

// 1. 스키마 정의 (값 정의)
const attendanceSchema = new Schema(
  {
    studentId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    classId: { type: Schema.Types.ObjectId, ref: "Class", required: true },
    status: { type: String, enum: ["present", "absent", "late"], required: true },
    date: { type: Date, required: true },
    reason: { type: String },
  },
  { timestamps: true },
);

// 2. 스키마로부터 타입을 자동으로 추출 (InferSchemaType 활용)
// 이렇게 하면 스키마를 수정할 때 타입도 자동으로 업데이트됩니다!
export type IAttendance = InferSchemaType<typeof attendanceSchema>;

// 3. 모델 생성 및 내보내기
const Attendance = model<IAttendance>("Attendance", attendanceSchema);

export default Attendance;
