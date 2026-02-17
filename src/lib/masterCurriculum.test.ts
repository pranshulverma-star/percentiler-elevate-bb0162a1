import { describe, it, expect } from "vitest";
import { generateFullPlan, type PlanConfig } from "./masterCurriculum";

describe("Subject-Dedicated Weekly Structure", () => {
  const baseConfig: PlanConfig = {
    targetYear: 2026,
    startDate: new Date("2026-02-17"),
    prepLevel: "Beginner",
  };

  it("Day 1 (Mon) = QA, Day 2 (Tue) = VARC, Day 3 (Wed) = LRDI", () => {
    const plan = generateFullPlan(baseConfig);
    expect(plan[0].subjectFocus).toBe("QA");
    expect(plan[0].dayOfWeek).toBe(0);
    expect(plan[1].subjectFocus).toBe("VARC");
    expect(plan[1].dayOfWeek).toBe(1);
    expect(plan[2].subjectFocus).toBe("LRDI");
    expect(plan[2].dayOfWeek).toBe(2);
  });

  it("Day 4 (Thu) = QA, Day 5 (Fri) = VARC, Day 6 (Sat) = LRDI, Day 7 (Sun) = WEEKLY_TEST", () => {
    const plan = generateFullPlan(baseConfig);
    expect(plan[3].subjectFocus).toBe("QA");
    expect(plan[4].subjectFocus).toBe("VARC");
    expect(plan[5].subjectFocus).toBe("LRDI");
    expect(plan[6].subjectFocus).toBe("WEEKLY_TEST");
  });

  it("QA questions split evenly across Mon and Thu", () => {
    const plan = generateFullPlan(baseConfig);
    // Week 1: 60 QA questions → 30 + 30
    const mon = plan[0];
    const thu = plan[3];
    expect(mon.questionCount + thu.questionCount).toBe(60);
    expect(mon.topic).toBe("Vedic Maths + Ratios");
    expect(thu.topic).toBe("Vedic Maths + Ratios");
  });

  it("LRDI sets split across Wed and Sat", () => {
    const plan = generateFullPlan(baseConfig);
    const wed = plan[2];
    const sat = plan[5];
    expect(wed.questionCount + sat.questionCount).toBe(14);
    expect(wed.questionLabel).toBe("sets");
  });

  it("Sunday has weekly_test flag when applicable", () => {
    const plan = generateFullPlan(baseConfig);
    // Week 1 has weekly_test: false
    expect(plan[6].weekly_test).toBe(false);
    // Week 2 has weekly_test: true
    expect(plan[13].weekly_test).toBe(true);
    expect(plan[13].subjectFocus).toBe("WEEKLY_TEST");
  });

  it("subject pattern repeats every week", () => {
    const plan = generateFullPlan(baseConfig);
    const expected = ["QA", "VARC", "LRDI", "QA", "VARC", "LRDI", "WEEKLY_TEST"];
    for (let w = 0; w < 3; w++) {
      for (let d = 0; d < 7; d++) {
        expect(plan[w * 7 + d].subjectFocus).toBe(expected[d]);
      }
    }
  });
});

describe("Video Integration", () => {
  it("shows video on first subject day, not second (Beginner)", () => {
    const plan = generateFullPlan({
      targetYear: 2026,
      startDate: new Date("2026-02-17"),
      prepLevel: "Beginner",
    });
    // Mon (QA first) should have video, Thu (QA second) should not
    expect(plan[0].showVideo).toBe(true);
    expect(plan[0].videoHours).toBeGreaterThan(0);
    expect(plan[3].showVideo).toBe(false);
  });

  it("marks video as optional for Concepts Done", () => {
    const plan = generateFullPlan({
      targetYear: 2026,
      startDate: new Date("2026-02-17"),
      prepLevel: "Concepts Done",
    });
    expect(plan[0].showVideo).toBe(true);
    expect(plan[0].videoOptional).toBe(true);
  });

  it("hides video for Sectionals/Mocks prep level", () => {
    const plan = generateFullPlan({
      targetYear: 2026,
      startDate: new Date("2026-02-17"),
      prepLevel: "Sectionals",
    });
    expect(plan[0].showVideo).toBe(false);
  });
});

describe("Mock Phase", () => {
  it("mock days on Wed and Sun in mock phase", () => {
    const plan = generateFullPlan({
      targetYear: 2026,
      startDate: new Date("2026-02-17"),
      prepLevel: "Beginner",
    });
    const mockDays = plan.filter(d => d.is_mock_day);
    expect(mockDays.length).toBeGreaterThan(0);
    for (const d of mockDays) {
      expect(d.phase).toBe("Mock Phase");
      expect([2, 6]).toContain(d.dayOfWeek);
    }
  });

  it("non-mock days in mock phase use subject-dedicated structure", () => {
    const plan = generateFullPlan({
      targetYear: 2026,
      startDate: new Date("2026-02-17"),
      prepLevel: "Beginner",
    });
    const mockPractice = plan.filter(d => d.phase === "Mock Phase" && !d.is_mock_day);
    expect(mockPractice.length).toBeGreaterThan(0);
    for (const d of mockPractice) {
      expect(["QA", "VARC", "LRDI", "WEEKLY_TEST"]).toContain(d.subjectFocus);
    }
  });
});

describe("Crash Mode", () => {
  it("no revision on Sunday in crash mode", () => {
    const plan = generateFullPlan({
      targetYear: 2026,
      startDate: new Date("2026-10-20"),
      prepLevel: "Beginner",
    });
    const sundays = plan.filter(d => d.subjectFocus === "WEEKLY_TEST");
    for (const d of sundays) {
      expect(d.revision).toBe(false);
    }
  });
});

describe("Determinism", () => {
  it("same input produces identical output", () => {
    const config: PlanConfig = {
      targetYear: 2026,
      startDate: new Date("2026-06-01"),
      prepLevel: "Beginner",
    };
    const p1 = generateFullPlan(config);
    const p2 = generateFullPlan(config);
    expect(p1.length).toBe(p2.length);
    for (let i = 0; i < p1.length; i++) {
      expect(p1[i].topic).toBe(p2[i].topic);
      expect(p1[i].subjectFocus).toBe(p2[i].subjectFocus);
      expect(p1[i].questionCount).toBe(p2[i].questionCount);
    }
  });
});
