import "dotenv/config";
import mongoose from "mongoose";
import * as bcrypt from "bcrypt-ts";
import User from "./models/User";
import Subject from "./models/Subject";
import Classroom from "./models/Classroom";
import Class from "./models/Class";
import ClassReports from "./models/ClassReports";
import Counsel from "./models/Counsel";

// 실행 방법 - pnpm exec tsx src/seed.ts

const seedDatabase = async () => {
  try {
    const uri = process.env.MONGO_URL;
    if (!uri) throw new Error("MONGO_URL이 설정되지 않았습니다.");

    await mongoose.connect(uri);
    console.log("🌱 데이터베이스 연결 성공! 더 풍부한 더미 데이터 생성을 시작합니다...");

    // 1. 기존 데이터 초기화
    await User.deleteMany({});
    await Subject.deleteMany({});
    await Classroom.deleteMany({});
    await Class.deleteMany({});
    await ClassReports.deleteMany({});
    await Counsel.deleteMany({});

    // 2. 강사 및 학생 유저 생성
    const hashedPassword = await bcrypt.hash("password123", 10);
    
    const instructor = await User.create({
      username: "김강사",
      role: "instructor",
      email: "instructor@test.com",
      password: hashedPassword,
      phone: "010-1111-2222"
    });

    const student = await User.create({
      username: "이학생",
      role: "user",
      email: "student@test.com",
      password: hashedPassword,
      phone: "010-3333-4444"
    });

    // 3. 과목 및 강의실 생성
    const subject = await Subject.create({ title: "수학" });
    const classroom = await Classroom.create({ classroomName: "101호" });

    // 4. 수업(Class) 생성
    const testClass = await Class.create({
      classroomId: classroom._id,
      subjectId: subject._id,
      instructorId: instructor._id,
      startTime: new Date("2026-03-23T14:00:00Z"),
      endTime: new Date("2026-03-23T16:00:00Z"),
      students: [student._id]
    });

    // 5. 수업 일지(ClassReports) 생성 (일주일 4회 수업 가정)
    const today = new Date();
    const sevenDaysAgo = new Date(today); sevenDaysAgo.setDate(today.getDate() - 7);
    const fiveDaysAgo = new Date(today); fiveDaysAgo.setDate(today.getDate() - 5);
    const threeDaysAgo = new Date(today); threeDaysAgo.setDate(today.getDate() - 3);
    const oneDayAgo = new Date(today); oneDayAgo.setDate(today.getDate() - 1);

    await ClassReports.create([
      {
        classId: testClass._id,
        date: oneDayAgo,
        progress: "수학 II - 다항함수의 미분법 단원 진도 완료. 접선의 방정식의 세 가지 케이스(곡선 위의 점, 기울기가 주어질 때, 곡선 밖의 점)를 완벽히 정리함. 특히 학생들이 자주 실수하는 '곡선 밖의 한 점'에서 그은 접선 구하기 알고리즘을 반복 숙달함. 평균값 정리와 롤의 정리의 기하학적 의미를 그래프를 통해 시각적으로 이해함.",
        homework: "교재 82페이지부터 95페이지까지 연습문제 및 실전 수능 기출 문제(15번, 21번 고난도 포함) 총 30문항 풀이. 틀린 문제는 반드시 오답 노트를 작성하고, 미분 계수의 정의를 활용한 증명 과정을 직접 손으로 써볼 것."
      },
      {
        classId: testClass._id,
        date: threeDaysAgo,
        progress: "수학 II - 미분계수와 도함수 단원 진도 진행. 평균변화율의 기하학적 의미인 '할선의 기울기'에서 출발하여 극한을 취해 순간변화율(접선의 기울기)로 넘어가는 논리적 흐름을 완벽히 숙지시킴. 미분가능성과 연속성의 관계를 벤다이어그램과 첨점(뾰족점) 그래프를 통해 직관적으로 이해하도록 지도함. 도함수의 정의를 이용해 다항함수의 미분법 공식을 직접 유도해 보는 시간을 가졌으며, 단순 공식 암기 이전에 원리 이해와 증명 과정에 초점을 맞춤.",
        homework: "프린트물 '미분계수의 정의와 성질' 2장 분량(총 30문항) 풀이. 주의할 점: 앞의 10문제는 다항함수의 미분 공식(nx^(n-1))을 바로 사용하지 않고, 오직 극한의 정의(h->0)만을 이용하여 도함수를 구하는 과정을 서술형으로 작성해야 함. 틀린 문제는 반드시 왜 틀렸는지(단순 연산 실수인지, 정의 암기 누락인지) 코멘트를 달아 오답 노트에 꼼꼼히 정리해 올 것."
      },
      {
        classId: testClass._id,
        date: oneDayAgo,
        progress: "수학 II - 접선의 방정식 및 평균값 정리 단원 완료. 접선의 방정식 구하는 세 가지 핵심 유형(1. 곡선 위의 점이 주어질 때, 2. 기울기가 주어질 때, 3. 곡선 밖의 점이 주어질 때)을 단계별로 반복 훈련함. 학생들이 가장 까다로워하는 '곡선 밖의 점' 유형은 접점의 임의의 좌표를 (t, f(t))로 미지수로 두고 방정식을 세우는 알고리즘을 체화하도록 집중 지도함. 롤의 정리와 평균값 정리는 복잡한 수식적 증명보다는 그래프를 통한 기하학적 의미 파악과, 실제 수능 기출문제에서 어떤 방식으로 조건으로 활용되는지 분석함.",
        homework: "수능 기출 및 평가원 모의고사 모음집 프린트(미분 활용 파트) 40문항 풀이. 이 중 고난도 킬러 문항(21번, 22번 급) 5문제는 바로 해설지를 보지 않고, 최소 15분 이상 스스로 고민하며 접근해 본 흔적을 연습장에 반드시 남겨올 것. 주말 동안 미분법 전 범위의 개념 마인드맵을 작성해 오고, 다가오는 월요일 단원 종합 평가(객관식 15문항, 서술형 3문항)를 철저히 대비할 것."
      }
    ]);

    // 6. 상담 내역(Counsel) 생성 (다양한 케이스 추가)
    const counsels = await Counsel.create([
        {
        studentId: student._id,
        instructorId: instructor._id,
        consultation_type: "parent",
        text: "학생의 희망 전공인 의생명공학과와 현재 생활기록부의 세부능력 및 특기사항(세특) 간의 연계성을 점검함. 수학 성적에 비해 과학 탐구(생명과학, 화학) 성적이 소폭 하향 곡선인 점을 지적하고, 2학기 기말고사에서의 반등 전략을 논의함. 학부모님은 학생의 적성보다 취업률을 고려한 약대 진학을 선호하시나, 학생은 연구직에 대한 의지가 강해 일단 학생부 종합전형 준비를 위해 심화 탐구 보고서 주제를 '유전자 가위 기술의 윤리적 쟁점'으로 구체화하기로 합의함",
        start: new Date("2026-03-15T10:00:00Z"),
        end: new Date("2026-03-15T10:30:00Z")
        },
        {
        studentId: student._id,
        instructorId: instructor._id,
        consultation_type: "student",
        text: "학생과 1:1 개별 면담을 통해 최근 숙제 수행도가 낮아진 원인에 대해 심도 있게 이야기를 나누었습니다. 학생은 이번 달부터 영어 및 과학 학원 수업이 추가되면서 전체적인 학습 시간이 부족해졌고, 그로 인해 수학 숙제에 충분한 시간을 투자하기 어려운 상황이라고 설명하였습니다. 실제로 최근 제출된 과제를 확인한 결과, 문제 풀이의 정확도 자체는 크게 떨어지지 않았으나 풀이 과정이 생략되거나 마무리가 미흡한 경우가 일부 확인되었습니다. 이에 따라 학생의 학습 부담을 고려하여 당분간 수학 숙제의 양을 약 20% 정도 조절하되, 대신 학습의 질을 유지하기 위해 오답 노트 작성은 반드시 철저히 수행하도록 지도하였습니다. 특히 틀린 문제에 대해서는 단순 정답 확인이 아닌, 왜 틀렸는지 원인을 분석하고 다시 풀어보는 과정을 강조하였으며, 주말 시간을 활용해 부족한 부분을 보완하기로 학생과 합의하였습니다.",
        start: new Date("2026-03-18T17:00:00Z"),
        end: new Date("2026-03-18T17:20:00Z")
        },
        {
        studentId: student._id,
        instructorId: instructor._id,
        consultation_type: "parent",
        text: "중간고사를 앞두고 학부모님과 유선 상담을 진행하였습니다. 학부모님께서는 학생이 첫 정기 시험을 앞두고 심리적인 부담을 크게 느끼고 있으며, 최근 들어 예민한 반응을 보이거나 스스로에 대한 자신감이 다소 떨어진 모습을 보인다고 전달해주셨습니다. 이에 대해 학원에서는 현재 시점에서 성적 향상도 중요하지만, 학생의 정서적 안정과 학습에 대한 긍정적인 태도 형성이 더욱 중요하다고 판단하고 있음을 안내드렸습니다. 따라서 수업 중에는 틀린 부분을 지적하기보다는 잘한 점을 먼저 언급하고, 작은 성취라도 충분히 인정해주며 자신감을 회복할 수 있도록 지도할 계획입니다. 또한 다음 주말에 예정된 1차 모의고사를 통해 현재 학습 수준을 객관적으로 점검하고, 결과를 바탕으로 향후 학습 방향을 보다 구체적으로 설정할 예정입니다. 모의고사 결과가 나온 이후에는 다시 한번 자세한 상담을 통해 학생의 학습 계획을 함께 조율해 나가기로 하였습니다.",
        start: new Date("2026-03-21T19:00:00Z"),
        end: new Date("2026-03-21T19:15:00Z")
        }
    ]);

    console.log("✅ 더미 데이터 생성 완료!");
    console.log("-----------------------------------------");
    console.log(`🔑 테스트용 강사 이메일: ${instructor.email} (비밀번호: password123)`);
    console.log(`📌 테스트용 Class ID: ${testClass._id}`);
    console.log("-----------------------------------------");
    console.log("📌 생성된 Counsel ID 목록 (분석/문자 생성 테스트용):");
    counsels.forEach((c, idx) => {
      console.log(`   [${idx + 1}] ${c.consultation_type === 'parent' ? '학부모' : '학생'} 상담: ${c._id}`);
    });
    console.log("-----------------------------------------");

    process.exit(0);
  } catch (error) {
    console.error("❌ 더미 데이터 생성 중 오류 발생:", error);
    process.exit(1);
  }
};

seedDatabase();