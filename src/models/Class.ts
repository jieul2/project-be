// src/models/Class.ts
import { Schema, model, InferSchemaType } from "mongoose";

// 매주 반복되는 스케줄 서브 스키마
const scheduleSchema = new Schema(
  {
    dayOfWeek: { type: Number, required: true, min: 0, max: 6 }, // 0(일) ~ 6(토)
    startTime: { type: String, required: true }, // "09:00"
    endTime: { type: String, required: true },   // "10:30"
  },
  { _id: false } // 서브 스키마의 불필요한 자동 _id 생성 방지
);

// 학생 수강 이력 서브 스키마 (관리자가 학생을 배정할 때 사용)
const studentEnrollmentSchema = new Schema(
  {
    studentId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    enrolledAt: { type: Date, default: Date.now }, // 합류일
    droppedAt: { type: Date, default: null },      // 퇴소일 (null이면 현재 수강 중)
  },
  { _id: false }
);

const classSchema = new Schema(
  {
    subjectId: { type: Schema.Types.ObjectId, ref: "Subject", required: true },
    instructorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    classroomId: { type: Schema.Types.ObjectId, ref: "Classroom", required: true },
    
    // 1. 기간: 특강반과 정규반 구분
    startDate: { type: Date, required: true },
    endDate: { type: Date, default: null }, // null일 경우 기한이 없는 정규반
    
    // 2. 시간표: 해당 기간 동안 매주 진행되는 요일/시간
    schedules: { type: [scheduleSchema], required: true },
    
    // 3. 수강생: 강사/관리자가 직접 배정한 학생 이력
    students: { type: [studentEnrollmentSchema], default: [] },
    
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: true }
);

export type IClass = InferSchemaType<typeof classSchema>;
const Class = model<IClass>("Class", classSchema);

export default Class;