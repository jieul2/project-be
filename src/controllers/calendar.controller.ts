import { Context } from "hono";
import { CalendarController } from "../types/calendar.types";
import Calendar from "../models/Calender";

const calendarController: CalendarController = {} as CalendarController;

calendarController.getCalendar = async (c: Context) => {
  try {
    const userId = c.get("user"); // 인증 미들웨어에서 사용자 ID를 설정했다고 가정
    if (!userId) {
      throw new Error("사용자 ID가 필요합니다.");
    }

    const events = await Calendar.find({});
    return c.json({ events }, 200);
  } catch (err) {
    if (err instanceof Error) {
      return c.json({ message: "캘린더 조회 실패", error: err.message }, 400);
    }
    return c.json({ message: "캘린더 조회 실패", error: "알 수 없는 오류" }, 400);
  }
};

calendarController.createEvent = async (c: Context) => {
  try {
    const userId = c.get("user"); // 인증 미들웨어에서 사용자 ID를 설정했다고 가정
    if (!userId) {
      throw new Error("사용자 ID가 필요합니다.");
    }

    const { title, start, end, category, description } = await c.req.json();
    if (!title || !start || !end || !category) {
      throw new Error("필수 필드가 누락되었습니다.");
    }

    const event = await Calendar.create({
      title,
      start,
      end,
      category,
      description,
    });

    return c.json({ message: "일정 생성 성공", event }, 200);
  } catch (err) {
    if (err instanceof Error) {
      return c.json({ message: "일정 생성 실패", error: err.message }, 400);
    }
    return c.json({ message: "일정 생성 실패", error: "알 수 없는 오류" }, 400);
  }
};

calendarController.updateEvent = async (c: Context) => {
  try {
    const userId = c.get("user"); // 인증 미들웨어에서 사용자 ID를 설정했다고 가정
    if (!userId) {
      throw new Error("사용자 ID가 필요합니다.");
    }

    const { eventId } = c.req.param();
    const { title, start, end, category, description } = await c.req.json();

    const event = await Calendar.findOneAndUpdate(
      { _id: eventId },
      { title, start, end, category, description },
      { new: true },
    );

    if (!event) {
      throw new Error("일정을 찾을 수 없습니다.");
    }

    return c.json({ message: "일정 업데이트 성공", event }, 200);
  } catch (err) {
    if (err instanceof Error) {
      return c.json({ message: "일정 업데이트 실패", error: err.message }, 400);
    }
    return c.json({ message: "일정 업데이트 실패", error: "알 수 없는 오류" }, 400);
  }
};

calendarController.deleteEvent = async (c: Context) => {
  try {
    const userId = c.get("user"); // 인증 미들웨어에서 사용자 ID를 설정했다고 가정
    if (!userId) {
      throw new Error("사용자 ID가 필요합니다.");
    }

    const { eventId } = c.req.param();

    const event = await Calendar.findOneAndDelete({ _id: eventId });

    if (!event) {
      throw new Error("일정을 찾을 수 없습니다.");
    }

    return c.json({ message: "일정 삭제 성공" }, 200);
  } catch (err) {
    if (err instanceof Error) {
      return c.json({ message: "일정 삭제 실패", error: err.message }, 400);
    }
    return c.json({ message: "일정 삭제 실패", error: "알 수 없는 오류" }, 400);
  }
};

export default calendarController;
