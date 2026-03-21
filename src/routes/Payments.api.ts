import { Hono } from "hono";
import paymentsController from "../controllers/payments.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = new Hono();

// 결제 생성
router.post("/", authMiddleware, paymentsController.createPayment);
// 결제 조회
router.get("/", authMiddleware, paymentsController.getPayments);
// 결제 상태 업데이트 (미납, 결제 완료, 실패 등 다양한 상태 업데이트 가능)
router.put("/:paymentId/status", authMiddleware, paymentsController.updatePayment);
router.get("/:paymentId", authMiddleware, paymentsController.getPaymentDetail);
router.get("/unpaid", authMiddleware, paymentsController.getUnpaidPayments);
router.delete("/:paymentId", authMiddleware, paymentsController.deletePayment);

export default router;
