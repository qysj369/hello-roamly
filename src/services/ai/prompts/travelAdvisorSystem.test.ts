import { describe, expect, it } from 'vitest';
import { TRAVEL_EXPERT_PERSONA_NAME } from '@/lib/ai/travelExpertPersona';
import { buildTravelAdvisorSystemPrompt } from '@/services/ai/prompts/travelAdvisorSystem';

describe('buildTravelAdvisorSystemPrompt', () => {
  it('uses shared travel expert persona', () => {
    const prompt = buildTravelAdvisorSystemPrompt();
    expect(prompt).toContain(TRAVEL_EXPERT_PERSONA_NAME);
    expect(prompt).toContain('预算敏感');
    expect(prompt).not.toContain('Hello Roamly 的 AI 旅行顾问');
  });

  it('locks origin when provided', () => {
    const prompt = buildTravelAdvisorSystemPrompt({
      origin: { name: '济南市历下区绿城百合花园', lng: 117.1, lat: 36.65 },
    });
    expect(prompt).toContain('用户已确认出发地');
    expect(prompt).toContain('禁止要求用户再回复出发地');
  });
});
