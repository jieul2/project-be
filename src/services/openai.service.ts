import OpenAI from "openai";

const AI_PROMPTS = {
  CLASS_SUMMARY: `Summarize the class logs into a JSON object in Korean.
Rules:
1. Extract "progress" and "homework" per class. Max 1 line each.
2. Be concise. Keep core math terms.
3. Sort chronologically.
4. Output only JSON

Format:
{"data": [{"date":"YYYY-MM-DD","progress":"...","homework":"..."}]}

Logs:`,
  /*
  [해석: 다음 수업 기록을 한국어로 된 JSON 객체로 요약해 줘.
  규칙:
  1. 각 수업별로 "progress(진도)"와 "homework(숙제)"를 추출할 것. 각각 최대 1줄.
  2. 간결하게 작성하고 핵심 수학 용어는 유지할 것.
  3. 시간 순서대로 정렬할 것.
  4. 오직 다음 구조와 일치하는 유효한 JSON 형식으로만 출력할 것: 
  {"data": [{"date":"YYYY-MM-DD","progress":"...","homework":"..."}]}
  
  수업 기록:]
  */

  COUNSEL_ANALYSIS: `Summarize the counseling logs into a JSON object in Korean.
Rules:
1. Divide into "progress" (Progress/Status) and "action" (Action/Request).
2. Max 1 line per section using concise, noun-ending phrases. No filler words.
3. Retain core keywords. Do not guess or add unmentioned details.
4. Output only JSON

Format:
{"progress": "...", "action": "..."}

Logs:`,
  /*
  [해석: 다음 상담 기록을 한국어로 된 JSON 객체로 요약해 줘.
  규칙:
  1. "progress(진도/상황)"와 "action(조치/요청)"으로 나눌 것.
  2. 각 섹션은 최대 1줄로, 명사형이나 간결한 문장으로 작성할 것. 불필요한 수식어 금지.
  3. 핵심 키워드를 유지할 것. 추측하거나 언급되지 않은 세부 사항을 추가하지 말 것.
  4. 오직 다음 구조와 일치하는 유효한 JSON 형식으로만 출력할 것:
  {"progress": "...", "action": "..."}
  
  상담 기록:]
  */

  COUNSEL_MESSAGE: `Draft a polite, professional, and friendly text message to a parent (or student) based on the counseling logs.
Rules:
1. Write entirely in Korean.
2. Maintain a warm and trustworthy tone.
3. Output only JSON

Format:
{"message": "..."}

Logs:\n`,
  /*
  [해석: 상담 기록을 바탕으로 학부모(또는 학생)에게 보낼 정중하고 전문적이며 친절한 문자 메시지 초안을 작성해 줘.
  규칙:
  1. 완전히 한국어로 작성할 것.
  2. 따뜻하고 신뢰감 있는 어조를 유지할 것.
  3. 오직 다음 구조와 일치하는 유효한 JSON 형식으로만 출력할 것:
  {"message": "..."}
  
  상담 기록:]
  */
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const openaiService = {
  async generateResponse(systemPrompt: string, userContent: string, maxTokens: number = 500) {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userContent },
        ],
        response_format: { type: "json_object" },
        max_tokens: maxTokens, 
      });
      
      const content = response.choices[0].message.content;
      if (!content) throw new Error("AI 응답이 비어있습니다.");
      
      return JSON.parse(content);
    } catch (error) {
      console.error("OpenAI API 호출 에러:", error);
      throw new Error("AI 응답을 생성하는 중에 오류가 발생했습니다.");
    }
  },

  async getWeeklyClassSummary(reportsData: string) {
    // 반환값: { data: [ { date: string, progress: string, homework: string } ] }
    return this.generateResponse(AI_PROMPTS.CLASS_SUMMARY, reportsData, 700); 
  },

  async getCounselAnalysis(counselText: string) {
    // 반환값: { progress: string, action: string }
    return this.generateResponse(AI_PROMPTS.COUNSEL_ANALYSIS, counselText, 300);
  },

  async generateCounselMessage(counselText: string) {
    // 반환값: { message: string }
    return this.generateResponse(AI_PROMPTS.COUNSEL_MESSAGE, counselText, 500);
  },
};