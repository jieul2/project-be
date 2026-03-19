import { Hono } from "hono";
import paymentsController from "../controllers/payments.controller";

const router = new Hono();

// 결제 조회
router.get("/", paymentsController.getPayments);
// 결제 상태 업데이트
router.patch("/:paymentId/status", paymentsController.updateStatus);
// 영수증 조회
router.get("/:paymentId/receipt", paymentsController.getReceipt);

export default router;
