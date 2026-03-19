import { Hono } from "hono";
import paymentsController from "../controllers/payments.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = new Hono();

// 결제 조회
router.get("/", authMiddleware, paymentsController.getPayments);
// 결제 상태 업데이트
router.patch("/:paymentId/status", authMiddleware, paymentsController.updateStatus);
// 영수증 조회
router.get("/:paymentId/receipt", authMiddleware, paymentsController.getReceipt);

export default router;
