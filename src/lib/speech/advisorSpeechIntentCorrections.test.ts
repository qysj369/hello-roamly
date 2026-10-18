import { describe, expect, it } from 'vitest';
import { correctAdvisorSpeechIntent } from '@/lib/speech/advisorSpeechIntentCorrections';

describe('correctAdvisorSpeechIntent', () => {
  it('fixes common place name misrecognitions', () => {
    expect(correctAdvisorSpeechIntent('曲府微山胡台二庄三天')).toBe('曲阜微山湖台儿庄三天');
  });

  it('normalizes budget phrasing', () => {
    expect(correctAdvisorSpeechIntent('一千五穷游规划')).toBe('1500漫行规划');
    expect(correctAdvisorSpeechIntent('一千五漫行规划')).toBe('1500漫行规划');
  });

  it('merges multi-stop destinations', () => {
    expect(correctAdvisorSpeechIntent('曲阜 微山湖 台儿庄 三天')).toBe('曲阜微山湖台儿庄三天');
  });

  it('preserves origin phrase', () => {
    expect(correctAdvisorSpeechIntent('从历下区出发去曲府')).toBe('从历下区出发去曲阜');
  });

  it('merges Zhoucun-Qingzhou-Weifang speech', () => {
    expect(correctAdvisorSpeechIntent('周村 青州 潍坊 四天 自驾')).toBe('周村古城青州潍坊四天自驾');
  });
});
