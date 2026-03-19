import Payment from "../models/Payment";
import { Context } from "hono";
import { PaymentsController } from "../types/payments.types";

const paymentsController: PaymentsController = {} as PaymentsController;

paymentsController.getPayments = async (c: Context) => {
  try {
    const payments = await Payment.find();
    if (!payments) {
      throw new Error("결제 정보를 찾을 수 없습니다.");
    }
    return c.json({ payments });
  } catch (err) {
    if (err instanceof Error) {
      return c.json({ message: "결제 조회 실패", error: err.message }, 500);
    }
    return c.json({ message: "결제 조회 실패", error: "알 수 없는 오류" }, 500);
  }
};

// 미납, 결제 완료, 실패 등 다양한 상태 업데이트 가능
paymentsController.updateStatus = async (c: Context) => {
  try {
    const { paymentId } = c.req.param();
    const { status } = await c.req.json();

    if (!paymentId || !status) {
      throw new Error("결제 ID와 상태가 필요합니다.");
    }

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      throw new Error("결제 정보를 찾을 수 없습니다.");
    }

    payment.status = status;
    await payment.save();

    return c.json({ message: "결제 상태 업데이트 성공", payment });
  } catch (err) {
    if (err instanceof Error) {
      return c.json({ message: "결제 상태 업데이트 실패", error: err.message }, 500);
    }
    return c.json({ message: "결제 상태 업데이트 실패", error: "알 수 없는 오류" }, 500);
  }
};

export default paymentsController;
