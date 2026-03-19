import { Context } from "hono";

export interface PaymentsController {
  // 결제 조회
  getPayments: (c: Context) => Promise<Response>;
  // 결제 상태 업데이트
  updateStatus: (c: Context) => Promise<Response>;
  // 영수증 발행 여부 조회
  getReceipt: (c: Context) => Promise<Response>;
}
