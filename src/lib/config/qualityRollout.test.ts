import { describe, expect, it } from 'vitest';
import { validateAllCityPreviewTemplates } from '@/data/cityPreviewTemplate';
import {
  CURRENT_ROLLOUT_PHASE,
  MEDIA_PRIORITY_HOT_CITIES,
  ROLLOUT_PHASES,
  getCurrentRolloutPhase,
} from '@/lib/config/rolloutPhases';
import { CITY_PREVIEW_SECTION_ORDER } from '@/lib/config/productPositioning';

describe('quality + rollout contracts', () => {
  it('uses four-section city preview template labels', () => {
    expect(CITY_PREVIEW_SECTION_ORDER).toEqual([
      '城市简介',
      '核心地标',
      '本地美食与街巷',
      '出行贴士',
    ]);
  });

  it('all configured city panels pass template validation', () => {
    expect(validateAllCityPreviewTemplates()).toEqual([]);
  });

  it('documents four rollout phases and current beta', () => {
    expect(ROLLOUT_PHASES).toHaveLength(4);
    expect(CURRENT_ROLLOUT_PHASE).toBe('phase1_beta');
    expect(getCurrentRolloutPhase().commercial).toBe('off');
  });

  it('prioritizes eight hot cities for full media', () => {
    expect(MEDIA_PRIORITY_HOT_CITIES).toHaveLength(8);
    expect(MEDIA_PRIORITY_HOT_CITIES[0]).toBe('北京');
    expect(MEDIA_PRIORITY_HOT_CITIES[7]).toBe('成都');
  });
});
