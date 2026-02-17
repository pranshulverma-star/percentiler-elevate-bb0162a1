import { describe, it, expect } from "vitest";
import { generateFullPlan, type PlanConfig } from "./masterCurriculum";

describe("Master Curriculum Engine", () => {
  it("generates correct sequence for Feb start (285 days)", () => {
    const config: PlanConfig = {
      targetYear: 2026,
      startDate: new Date("2026-02-17"),
      prepLevel: "Beginner",
    };
    const plan = generateFullPlan(config);
    
    // Should have ~285 days total
    expect(plan.length).toBeGreaterThan(280);
    
    // Day 1 should be April Week 1
    expect(plan[0].weekLabel).toBe("April Week 1");
    expect(plan[0].qa_topic).toBe("Vedic Maths + Ratios");
    
    // Day 7 should still be April Week 1
    expect(plan[6].weekLabel).toBe("April Week 1");
    
    // Day 8 should be April Week 2
    expect(plan[7].weekLabel).toBe("April Week 2");
    expect(plan[7].qa_topic).toBe("Percentages");
    
    // Day 85 (week 13) = July Week 1
    expect(plan[84].weekLabel).toBe("July Week 1");
    expect(plan[84].qa_topic).toBe("Prime/HCF/LCM");
  });

  it("generates correct sequence for June start (~170 days)", () => {
    const config: PlanConfig = {
      targetYear: 2026,
      startDate: new Date("2026-06-01"),
      prepLevel: "Beginner",
    };
    const plan = generateFullPlan(config);
    
    // ~181 days (June 1 to Nov 29)
    expect(plan.length).toBeGreaterThan(175);
    
    // Total curriculum = 140 days, mock = 45 days
    // 181 - 45 = 136 curriculum days < 140, so some compression should happen
    // Day 1 should still start with April Week 1
    expect(plan[0].qa_topic).toBeDefined();
    
    // Last ~45 days should be mock phase
    const lastDay = plan[plan.length - 1];
    expect(lastDay.phase).toBe("Mock Phase");
    
    // Check mock days exist (Wed + Sun)
    const mockDays = plan.filter(d => d.is_mock_day);
    expect(mockDays.length).toBeGreaterThan(0);
  });

  it("activates crash mode for ≤50 days left", () => {
    const config: PlanConfig = {
      targetYear: 2026,
      startDate: new Date("2026-10-20"), // ~40 days before CAT
      prepLevel: "Beginner",
    };
    const plan = generateFullPlan(config);
    
    expect(plan.length).toBeGreaterThan(0);
    expect(plan.length).toBeLessThanOrEqual(50);
    
    // Should NOT contain Tier 3 topics
    const tier3Topics = ["Vedic Maths", "Profit & Loss", "Max/Min", "Quadrilaterals", "Mensuration", "Probability"];
    for (const day of plan) {
      for (const topic of tier3Topics) {
        expect(day.qa_topic).not.toContain(topic);
      }
    }
  });

  it("applies prep level modifiers", () => {
    const beginnerConfig: PlanConfig = {
      targetYear: 2026,
      startDate: new Date("2026-02-17"),
      prepLevel: "Beginner",
    };
    const advConfig: PlanConfig = {
      targetYear: 2026,
      startDate: new Date("2026-02-17"),
      prepLevel: "Concepts Done",
    };
    
    const beginnerPlan = generateFullPlan(beginnerConfig);
    const advPlan = generateFullPlan(advConfig);
    
    // Day 1 QA questions: Beginner = 60/7 ≈ 9, Concepts Done = 60*0.6/7 ≈ 5
    expect(beginnerPlan[0].qa_questions).toBeGreaterThan(advPlan[0].qa_questions);
  });

  it("sequence is deterministic - same input = same output", () => {
    const config: PlanConfig = {
      targetYear: 2026,
      startDate: new Date("2026-02-17"),
      prepLevel: "Beginner",
    };
    const plan1 = generateFullPlan(config);
    const plan2 = generateFullPlan(config);
    
    expect(plan1.length).toBe(plan2.length);
    for (let i = 0; i < plan1.length; i++) {
      expect(plan1[i].qa_topic).toBe(plan2[i].qa_topic);
      expect(plan1[i].lrdi_topic).toBe(plan2[i].lrdi_topic);
      expect(plan1[i].varc_topic).toBe(plan2[i].varc_topic);
    }
  });
});
