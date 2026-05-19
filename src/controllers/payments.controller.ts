import Payment from "../models/Payment";
import User from "../models/User";
import { Context } from "hono";
import { PaymentsController } from "../types/payments.types";

interface PopulatedPaymentUser {
  _id: string;
  username: string;
}

interface PaymentResponseItem {
  _id: string;
  studentId: string;
  amount: number;
  status: string;
  user: {
    username: string;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

const paymentsController: PaymentsController = {} as PaymentsController;

paymentsController.createPayment = async (c: Context) => {
  try {
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
    const { page = 1, limit = 10, name } = c.req.query();

    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const paymentFilter: Record<string, unknown> = {};
    if (name) {
      const matchingStudents = await User.find(
        { username: { $regex: name, $options: "i" }, role: "user" },
        "_id",
      );
      paymentFilter.studentId = { $in: matchingStudents.map((s) => s._id) };
    }

    const [payments, total] = await Promise.all([
      Payment.find(paymentFilter)
        .populate<{ studentId: PopulatedPaymentUser }>("studentId", "username")
        .skip(skip)
        .limit(limitNumber)
        .sort({ createdAt: -1 }),
      Payment.countDocuments(paymentFilter),
    ]);

    const paymentItems: PaymentResponseItem[] = payments.map((payment) => ({
      _id: String(payment._id),
      studentId: String(payment.studentId?._id ?? payment.studentId),
      amount: payment.amount,
      status: payment.status,
      user: {
        username: payment.studentId?.username ?? "",
      },
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
    }));

    const totalPages = Math.ceil(total / limitNumber);

    return c.json({
      payments: paymentItems,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total,
        totalPages,
      },
    });
  } catch (err) {
    if (err instanceof Error) {
      return c.json({ message: "결제 조회 실패", error: err.message }, 400);
    }
    return c.json({ message: "결제 조회 실패", error: "알 수 없는 오류" }, 400);
  }
};

paymentsController.updatePayment = async (c: Context) => {
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
    const { paymentId } = c.req.param();
    if (!paymentId) {
      throw new Error("결제 ID가 필요합니다.");
    }

    const payment = await Payment.findById(paymentId).populate<{ studentId: PopulatedPaymentUser }>(
      "studentId",
      "username",
    );
    if (!payment) {
      throw new Error("결제 정보를 찾을 수 없습니다.");
    }

    const paymentItem: PaymentResponseItem = {
      _id: String(payment._id),
      studentId: String(payment.studentId?._id ?? payment.studentId),
      amount: payment.amount,
      status: payment.status,
      user: {
        username: payment.studentId?.username ?? "",
      },
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
    };

    return c.json({ payment: paymentItem }, 200);
  } catch (err) {
    if (err instanceof Error) {
      return c.json({ message: "결제 상세 조회 실패", error: err.message }, 400);
    }
    return c.json({ message: "결제 상세 조회 실패", error: "알 수 없는 오류" }, 400);
  }
};

paymentsController.getUnpaidPayments = async (c: Context) => {
  try {
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
