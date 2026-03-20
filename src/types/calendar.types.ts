import { Context } from "hono";

export interface CalendarController {
  // 캘린더 일정 조회
  getCalendar: (c: Context) => Promise<Response>;
  // 캘린더 일정 추가
  createEvent: (c: Context) => Promise<Response>;
  // 캘린더 일정 수정
  updateEvent: (c: Context) => Promise<Response>;
  // 캘린더 일정 삭제
  deleteEvent: (c: Context) => Promise<Response>;
  // 캘린더 일정 상세 조회
  getEventDetail: (c: Context) => Promise<Response>;
}
