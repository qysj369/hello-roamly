import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/share/posterCanvas', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/share/posterCanvas')>();
  return {
    ...actual,
    drawCoverImage: vi.fn(async () => undefined),
  };
});

import { recordSearchPlanDouyinReel } from '@/lib/home/recordSearchPlanDouyinReel';
import { matchSearchPlanGoldExample } from '@/lib/home/searchPlanGoldExamples';

const plan = matchSearchPlanGoldExample({
  startCity: '济南',
  targetCity: '上海',
  days: 3,
  peopleType: '好友结伴',
  budget: null,
  theme: null,
})!;

describe('recordSearchPlanDouyinReel', () => {
  beforeEach(() => {
    class FakeRecorder {
      mimeType = 'video/webm';
      state = 'inactive';
      ondataavailable: ((event: { data: Blob }) => void) | null = null;
      onstop: (() => void) | null = null;
      addEventListener(type: string, handler: (event?: { data: Blob }) => void) {
        if (type === 'dataavailable') this.ondataavailable = handler;
        if (type === 'stop') this.onstop = handler as () => void;
      }
      start() {
        this.state = 'recording';
      }
      stop() {
        this.state = 'inactive';
        this.ondataavailable?.({ data: new Blob(['reel'], { type: 'video/webm' }) });
        this.onstop?.();
      }
    }
    vi.stubGlobal('MediaRecorder', Object.assign(FakeRecorder, { isTypeSupported: () => true }));
    HTMLCanvasElement.prototype.captureStream = vi.fn(
      () =>
        ({
          getTracks: () => [{ stop: vi.fn() }],
        }) as unknown as MediaStream,
    );
    HTMLCanvasElement.prototype.getContext = vi.fn(
      () =>
        ({
          fillStyle: '',
          font: '',
          fillRect: vi.fn(),
          fillText: vi.fn(),
          drawImage: vi.fn(),
          save: vi.fn(),
          restore: vi.fn(),
          beginPath: vi.fn(),
          closePath: vi.fn(),
          clip: vi.fn(),
          moveTo: vi.fn(),
          arcTo: vi.fn(),
          measureText: () => ({ width: 12 }),
          createLinearGradient: () => ({ addColorStop: vi.fn() }),
        }) as unknown as CanvasRenderingContext2D,
    );
  });

  it('records a brand-free slideshow video from the motion scenes', async () => {
    const result = await recordSearchPlanDouyinReel(plan, { sceneMs: 1 });
    expect(result.blob.size).toBeGreaterThan(0);
    expect(result.filename).toMatch(/漫游\.(webm|mp4)$/);
  });
});
