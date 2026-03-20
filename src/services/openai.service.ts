import OpenAI from "openai";

// 아래 내용은 예시 프롬프트입니다. 실제로는 프로젝트 요구사항에 맞게 프롬프트를 작성해야 합니다.
const AI_PROMPTS = {
  COUNSEL_SUMMARY: "다음 상담 내용을 요약해줘:",
  GRADE_FEEDBACK: "다음 성적 데이터를 분석해서 피드백을 제공해줘:",
};

// OpenAI 클라이언트 초기화
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

  // 아래는 예시 함수입니다. 실제로는 프로젝트 요구사항에 맞게 함수를 작성해야 합니다.
  async getCounselSummary(counselText: string) {
    return this.generateResponse(AI_PROMPTS.COUNSEL_SUMMARY, counselText);
  },

  async getGradeFeedback(gradeData: string) {
    return this.generateResponse(AI_PROMPTS.GRADE_FEEDBACK, gradeData);
  },
};
