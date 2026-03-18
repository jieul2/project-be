import { Schema, model, InferSchemaType } from "mongoose";

// 1. 스키마 정의 (값 정의)
const paymentSchema = new Schema(
  {
    studentId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: ["pending", "completed", "failed"], default: "pending" },
  },
  { timestamps: true },
);

// 2. 스키마로부터 타입을 자동으로 추출 (InferSchemaType 활용)
// 이렇게 하면 스키마를 수정할 때 타입도 자동으로 업데이트됩니다!
export type IPayment = InferSchemaType<typeof paymentSchema>;

// 3. 모델 생성 및 내보내기
const Payment = model<IPayment>("Payment", paymentSchema);

export default Payment;
