import Payment from "../models/Payment";
import { Context } from "hono";
import { PaymentsController } from "../types/payments.types";

const paymentsController: PaymentsController = {} as PaymentsController;

paymentsController.createPayment = async (c: Context) => {
  try {
    const user = c.get("user");
    if (!user.role || (user.role !== "admin" && user.role !== "instructor")) {
      throw new Error("권한이 없습니다.");
    }
    const { studentId, amount } = await c.req.json();
    if (!amount || !studentId) {
      throw new Error("필수 필드가 누락되었습니다.");
    }
    const newPayment = await Payment.create({ studentId, amount });
    return c.json({ message: "결제 생성 성공", payment: newPayment }, 200);
  } catch (err) {
    ``;
    if (err instanceof Error) {
      return c.json({ message: "결제 생성 실패", error: err.message }, 400);
    }
    return c.json({ message: "결제 생성 실패", error: "알 수 없는 오류" }, 400);
  }
};

paymentsController.getPayments = async (c: Context) => {
  try {
    const user = c.get("user");
    if (!user.role || (user.role !== "admin" && user.role !== "instructor")) {
      throw new Error("권한이 없습니다.");
    }
    const payments = await Payment.find();
    if (!payments) {
      throw new Error("결제 정보를 찾을 수 없습니다.");
    }
    return c.json({ payments }, 200);
  } catch (err) {
    if (err instanceof Error) {
      return c.json({ message: "결제 조회 실패", error: err.message }, 400);
    }
    return c.json({ message: "결제 조회 실패", error: "알 수 없는 오류" }, 400);
  }
};

paymentsController.updatePayment = async (c: Context) => {
  try {
    const user = c.get("user");
    if (!user.role || (user.role !== "admin" && user.role !== "instructor")) {
      throw new Error("권한이 없습니다.");
    }
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

    return c.json({ message: "결제 상태 업데이트 성공", payment }, 200);
  } catch (err) {
    if (err instanceof Error) {
      return c.json({ message: "결제 상태 업데이트 실패", error: err.message }, 400);
    }
    return c.json({ message: "결제 상태 업데이트 실패", error: "알 수 없는 오류" }, 400);
  }
};

paymentsController.deletePayment = async (c: Context) => {
  try {
    const user = c.get("user");
    if (!user.role || (user.role !== "admin" && user.role !== "instructor")) {
      throw new Error("권한이 없습니다.");
    }
    const { paymentId } = c.req.param();
    if (!paymentId) {
      throw new Error("결제 ID가 필요합니다.");
    }
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      throw new Error("결제 정보를 찾을 수 없습니다.");
    }
    return c.json({ message: "결제 삭제 성공" }, 200);
  } catch (err) {
    if (err instanceof Error) {
      return c.json({ message: "결제 삭제 실패", error: err.message }, 400);
    }
    return c.json({ message: "결제 삭제 실패", error: "알 수 없는 오류" }, 400);
  }
};

paymentsController.getPaymentDetail = async (c: Context) => {
  try {
    const user = c.get("user");
    if (!user.role || (user.role !== "admin" && user.role !== "instructor")) {
      throw new Error("권한이 없습니다.");
    }
    const { paymentId } = c.req.param();
    if (!paymentId) {
      throw new Error("결제 ID가 필요합니다.");
    }
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      throw new Error("결제 정보를 찾을 수 없습니다.");
    }
    return c.json({ payment }, 200);
  } catch (err) {
    if (err instanceof Error) {
      return c.json({ message: "결제 상세 조회 실패", error: err.message }, 400);
    }
    return c.json({ message: "결제 상세 조회 실패", error: "알 수 없는 오류" }, 400);
  }
};

paymentsController.getUnpaidPayments = async (c: Context) => {
  try {
    const user = c.get("user");
    if (!user.role || (user.role !== "admin" && user.role !== "instructor")) {
      throw new Error("권한이 없습니다.");
    }
    const unpaidPayments = await Payment.find({ status: "pending" });
    if (!unpaidPayments) {
      throw new Error("미납 결제 정보를 찾을 수 없습니다.");
    }
    return c.json({ unpaidPayments }, 200);
  } catch (err) {
    if (err instanceof Error) {
      return c.json({ message: "미납 결제 조회 실패", error: err.message }, 400);
    }
    return c.json({ message: "미납 결제 조회 실패", error: "알 수 없는 오류" }, 400);
  }
};

export default paymentsController;
