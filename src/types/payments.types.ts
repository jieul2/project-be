import { Context } from "hono";

export interface PaymentsController {
  // 결제 조회
  getPayments: (c: Context) => Promise<Response>;
  // 결제 상태 업데이트
  updatePayment: (c: Context) => Promise<Response>;
  // 결제 상세 조회
  getPaymentDetail: (c: Context) => Promise<Response>;
  // 미납 결제 조회
  getUnpaidPayments: (c: Context) => Promise<Response>;
  // 결제 생성
  createPayment: (c: Context) => Promise<Response>;
  // 결제 삭제
  deletePayment: (c: Context) => Promise<Response>;
}
