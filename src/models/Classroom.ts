import { Schema, model, InferSchemaType } from "mongoose";

// 1. 스키마 정의 (값 정의)
const classroomSchema = new Schema(
  {
    classroomName: { type: String, required: true },
  },
  { timestamps: true },
);

// 2. 스키마로부터 타입을 자동으로 추출 (InferSchemaType 활용)
// 이렇게 하면 스키마를 수정할 때 타입도 자동으로 업데이트됩니다!
export type IClassroom = InferSchemaType<typeof classroomSchema>;

// 3. 모델 생성 및 내보내기
const Classroom = model<IClassroom>("Classroom", classroomSchema);

export default Classroom;
