import OpenAI from "openai";

const AI_PROMPTS = {
CLASS_SUMMARY: `다음 수업 기록 데이터를 요약해줘.

  조건:
  1. 각 수업별로 "진도(progress)"와 "숙제(homework)"를 나눠서 작성할 것
  2. 각 수업 요약은 총 2줄 이내로 작성할 것 (진도 1줄, 숙제 1줄)
  3. 불필요한 설명 없이 핵심만 간단히 요약할 것
  4. 수학 용어와 핵심 개념은 유지할 것
  5. 여러 수업이 있을 경우 시간 순서대로 정리할 것
  6. 반드시 아래의 JSON 배열(Array) 형식으로만 응답할 것:
  [
    {
      "date": "YYYY-MM-DD",
      "progress": "진도 요약 내용 (1줄)",
      "homework": "숙제 요약 내용 (1줄)"
    }
  ]

  수업 기록:`
  ,
COUNSEL_ANALYSIS: `다음 상담 내용을 요약해줘.

    [작성 조건]
  1. 반드시 "진도/상황", "조치/요청" 두 항목으로 구분할 것
  2. 각 항목은 한 줄씩만 작성 (총 2줄)
  3. 불필요한 배경 설명, 반복 표현 제거하고 핵심만 요약
  4. 문장은 명사형 또는 간결한 평서형으로 작성 (길게 늘어지지 않게)
  5. 학습 개념, 문제 유형, 원인, 조치 내용 등 핵심 키워드는 유지
  6. 추측하거나 없는 내용 추가하지 말 것

  [출력 형식]
  진도/상황: ...
  조치/요청: ...`
  ,
  COUNSEL_MESSAGE: "다음 상담 내용을 바탕으로 학부모님(또는 학생)에게 전송할 정중하고 친절한 안내 문자 메시지 초안을 작성해 주세요:\n\n",
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const openaiService = {
  async generateResponse(systemPrompt: string, userContent: string) {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userContent },
        ],
      });
      return response.choices[0].message.content;
    } catch (error) {
      console.error("OpenAI API 호출 에러:", error);
      throw new Error("AI 응답을 생성하는 중에 오류가 발생했습니다.");
    }
  },

  async getWeeklyClassSummary(reportsData: string) {
    return this.generateResponse(AI_PROMPTS.CLASS_SUMMARY, reportsData);
  },

  async getCounselAnalysis(counselText: string) {
    return this.generateResponse(AI_PROMPTS.COUNSEL_ANALYSIS, counselText);
  },

  async generateCounselMessage(counselText: string) {
    return this.generateResponse(AI_PROMPTS.COUNSEL_MESSAGE, counselText);
  },
};