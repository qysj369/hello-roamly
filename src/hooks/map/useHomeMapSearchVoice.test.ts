import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useHomeMapSearchVoice } from '@/hooks/map/useHomeMapSearchVoice';
import { TRAVEL_VOICE_NEED_PLAN, TRAVEL_VOICE_REFUSAL } from '@/lib/home/travelVoiceIntent';
import { requestAutoNarrateNextPlan, speakPlanVoiceNarration } from '@/lib/browser/planVoiceNarration';

let onSend: ((text: string) => Promise<void>) | null = null;

vi.mock('@/hooks/ai/useAdvisorVoiceDialog', () => ({
  useAdvisorVoiceDialog: (options: { onSend: (text: string) => Promise<void> }) => {
    onSend = options.onSend;
    return {
      supported: true,
      active: false,
      processing: false,
      error: null,
      preview: '',
      status: '',
      inputLevel: 0,
      requiresManualFinish: false,
      toggle: vi.fn(),
      finishUtterance: vi.fn(),
      stop: vi.fn(),
    };
  },
}));

vi.mock('@/lib/browser/planVoiceNarration', () => ({
  speakPlanVoiceNarration: vi.fn(),
  requestAutoNarrateNextPlan: vi.fn(),
}));

vi.mock('@/lib/speech/advisorSpeechIntentCorrections', () => ({
  correctAdvisorSpeechIntent: (text: string) => text,
}));

describe('useHomeMapSearchVoice', () => {
  beforeEach(() => {
    onSend = null;
    vi.mocked(speakPlanVoiceNarration).mockClear();
    vi.mocked(requestAutoNarrateNextPlan).mockClear();
  });

  it('refuses non-travel chat with the fixed spoken line', async () => {
    const onRecognized = vi.fn();
    renderHook(() => useHomeMapSearchVoice({ onRecognized }));
    await onSend?.('讲个笑话');
    expect(speakPlanVoiceNarration).toHaveBeenCalledWith(TRAVEL_VOICE_REFUSAL, { immediate: true });
    expect(onRecognized).not.toHaveBeenCalled();
  });

  it('marks auto-narrate and forwards travel planning speech', async () => {
    const onRecognized = vi.fn();
    renderHook(() => useHomeMapSearchVoice({ onRecognized }));
    await onSend?.('去杭州玩三天');
    expect(requestAutoNarrateNextPlan).toHaveBeenCalled();
    expect(onRecognized).toHaveBeenCalledWith('去杭州玩三天');
  });

  it('asks for a plan before exporting when no handler is wired', async () => {
    renderHook(() => useHomeMapSearchVoice({ onRecognized: vi.fn() }));
    await onSend?.('生成小红书图文');
    expect(speakPlanVoiceNarration).toHaveBeenCalledWith(TRAVEL_VOICE_NEED_PLAN, { immediate: true });
  });

  it('routes Xiaohongshu and Douyin export commands', async () => {
    const onExportIntent = vi.fn();
    renderHook(() => useHomeMapSearchVoice({ onRecognized: vi.fn(), onExportIntent }));
    await onSend?.('生成小红书图文');
    expect(onExportIntent).toHaveBeenCalledWith('xhs');
    await onSend?.('导出抖音短视频素材');
    expect(onExportIntent).toHaveBeenCalledWith('douyin');
  });
});
