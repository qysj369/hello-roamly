import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import { generateAiSnailGuide } from '@/services/ai/generateAiSnailGuide';
import type { AiChatMessage } from '@/types/domain/aiChat';
import { SNAIL_UI_COPY } from '@/lib/config/snailCommunity';
import {
  AI_SNAIL_BUDGET_OPTIONS,
  AI_SNAIL_PREFERENCE_OPTIONS,
  type AiSnailBudgetRangeId,
  type AiSnailGuideParams,
  type AiSnailGuideResult,
  type AiSnailGuideStep,
  type AiSnailPreferenceId,
} from '@/types/domain/aiSnailGuide';
import type { GuidePublishEditorDraft } from '@/types/domain/guidePublish';
import { aiSnailGuideToEditorDraft } from '@/utils/guidePublishDraft';
import { toErrorMessage } from '@/utils/toErrorMessage';

export type UseAISnailGuideWizardOptions = {
  onGuideGenerated?: (payload: {
    guide: AiSnailGuideResult;
    editorDraft: GuidePublishEditorDraft;
  }) => void;
};

function createMessage(role: AiChatMessage['role'], content: string): AiChatMessage {
  return {
    id: `snail-${role}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role,
    content,
    createdAt: new Date().toISOString(),
  };
}

const WELCOME_MESSAGE = SNAIL_UI_COPY.aiWelcome;

const STEP_PROMPTS: Record<'days' | 'budget' | 'preferences', string> = {
  days: '好的！**第二步：计划玩几天？**\n点击下方天数，或输入自定义天数。',
  budget: '收到。**第三步：人均总预算大概是多少？**\n请选择以下预算档位（全程人均）。',
  preferences:
    '明白。**第四步：这次旅行更在意什么？**\n可多选，选好后点「开始生成攻略」。',
};

function formatPreferences(preferences: AiSnailPreferenceId[]): string {
  return preferences
    .map((id) => AI_SNAIL_PREFERENCE_OPTIONS.find((option) => option.id === id)?.label)
    .filter(Boolean)
    .join('、');
}

/** AI蜗牛向导多轮对话状态机 */
export function useAISnailGuideWizard(options: UseAISnailGuideWizardOptions = {}) {
  const { onGuideGenerated } = options;
  const [step, setStep] = useState<AiSnailGuideStep>('destination');
  const [messages, setMessages] = useState<AiChatMessage[]>(() => [
    createMessage('assistant', WELCOME_MESSAGE),
  ]);
  const [destination, setDestination] = useState('');
  const [days, setDays] = useState<number | null>(null);
  const [budgetRange, setBudgetRange] = useState<AiSnailBudgetRangeId | null>(null);
  const [preferences, setPreferences] = useState<AiSnailPreferenceId[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastGuide, setLastGuide] = useState<AiSnailGuideResult | null>(null);
  const [editorDraft, setEditorDraft] = useState<GuidePublishEditorDraft | null>(null);
  const [publishedGuideId, setPublishedGuideId] = useState<string | null>(null);
  const requestIdRef = useRef(0);
  const scrollTickRef = useRef(0);

  const params = useMemo((): AiSnailGuideParams | null => {
    if (!destination.trim() || days == null || budgetRange == null || preferences.length === 0) {
      return null;
    }
    return {
      destination: destination.trim(),
      days,
      budgetRange,
      preferences,
    };
  }, [budgetRange, days, destination, preferences]);

  const appendMessages = useCallback((...next: AiChatMessage[]) => {
    setMessages((current) => [...current, ...next]);
    scrollTickRef.current += 1;
  }, []);

  const submitDestination = useCallback(
    (value: string) => {
      const trimmed = value.trim();
      if (!trimmed || step !== 'destination') {
        return;
      }
      setDestination(trimmed);
      appendMessages(
        createMessage('user', trimmed),
        createMessage('assistant', STEP_PROMPTS.days),
      );
      setStep('days');
      setError(null);
    },
    [appendMessages, step],
  );

  const submitDays = useCallback(
    (value: number) => {
      if (!Number.isFinite(value) || value < 1 || value > 30 || step !== 'days') {
        return;
      }
      setDays(value);
      appendMessages(
        createMessage('user', `${value} 天`),
        createMessage('assistant', STEP_PROMPTS.budget),
      );
      setStep('budget');
      setError(null);
    },
    [appendMessages, step],
  );

  const submitBudget = useCallback(
    (value: AiSnailBudgetRangeId) => {
      if (step !== 'budget') {
        return;
      }
      const label = AI_SNAIL_BUDGET_OPTIONS.find((option) => option.id === value)?.label ?? value;
      setBudgetRange(value);
      appendMessages(
        createMessage('user', label),
        createMessage('assistant', STEP_PROMPTS.preferences),
      );
      setStep('preferences');
      setError(null);
    },
    [appendMessages, step],
  );

  const togglePreference = useCallback((id: AiSnailPreferenceId) => {
    setPreferences((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  }, []);

  const generateGuide = useCallback(
    async (selectedPreferences: AiSnailPreferenceId[]) => {
      if (step !== 'preferences' || selectedPreferences.length === 0) {
        setError('请至少选择一项旅行偏好');
        return null;
      }

      const nextParams: AiSnailGuideParams = {
        destination: destination.trim(),
        days: days!,
        budgetRange: budgetRange!,
        preferences: selectedPreferences,
      };

      const requestId = requestIdRef.current + 1;
      requestIdRef.current = requestId;

      setPreferences(selectedPreferences);
      setStep('generating');
      setIsGenerating(true);
      setError(null);

      appendMessages(
        createMessage('user', formatPreferences(selectedPreferences)),
        createMessage(
          'assistant',
          '信息已收齐，正在生成结构化漫行攻略…\n文字会边生成边出现，请稍候。',
        ),
      );

      try {
        const guide = await generateAiSnailGuide(nextParams);
        if (requestIdRef.current !== requestId) {
          return null;
        }
        const draft = aiSnailGuideToEditorDraft(guide);
        setLastGuide(guide);
        setEditorDraft(draft);
        setPublishedGuideId(null);
        setStep('editor');
        onGuideGenerated?.({ guide, editorDraft: draft });
        appendMessages(
          createMessage(
            'assistant',
            `攻略草稿已生成：**${guide.title}**\n\n人均约 ¥${guide.costBreakdown.total} · ${nextParams.days} 天 · ${nextParams.destination}\n\n内容已填入下方**留下黏液轨迹**发布器，请审核微调后发布。`,
          ),
        );
        return guide;
      } catch (err) {
        if (requestIdRef.current !== requestId) {
          return null;
        }
        const message = toErrorMessage(err, '生成攻略失败，请稍后再试');
        setError(message);
        setStep('preferences');
        appendMessages(createMessage('assistant', `生成时遇到问题：${message}\n\n请调整偏好后重试。`));
        return null;
      } finally {
        if (requestIdRef.current === requestId) {
          setIsGenerating(false);
        }
      }
    },
    [appendMessages, budgetRange, days, destination, onGuideGenerated, step],
  );

  const reset = useCallback(() => {
    requestIdRef.current += 1;
    setStep('destination');
    setMessages([createMessage('assistant', WELCOME_MESSAGE)]);
    setDestination('');
    setDays(null);
    setBudgetRange(null);
    setPreferences([]);
    setIsGenerating(false);
    setError(null);
    setLastGuide(null);
    setEditorDraft(null);
    setPublishedGuideId(null);
  }, []);

  const openEditor = useCallback(() => {
    if (editorDraft) {
      setStep('editor');
    }
  }, [editorDraft]);

  const markPublished = useCallback(
    (guideId: string) => {
      setPublishedGuideId(guideId);
      setStep('published');
      appendMessages(
        createMessage('assistant', '攻略已发布！可在「攻略」列表中查看，或继续生成下一份。'),
      );
    },
    [appendMessages],
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    step,
    messages,
    destination,
    days,
    budgetRange,
    preferences,
    params,
    isGenerating,
    error,
    lastGuide,
    editorDraft,
    publishedGuideId,
    scrollTick: scrollTickRef.current,
    submitDestination,
    submitDays,
    submitBudget,
    togglePreference,
    generateGuide,
    reset,
    openEditor,
    markPublished,
    clearError,
  };
}

export function useAiSnailScrollToBottom(
  scrollRef: RefObject<HTMLDivElement | null>,
  tick: number,
) {
  useEffect(() => {
    const node = scrollRef.current;
    if (!node) {
      return;
    }
    node.scrollTo({ top: node.scrollHeight, behavior: 'smooth' });
  }, [scrollRef, tick]);
}

/** @deprecated 使用 useAISnailGuideWizard */
export const useAiSnailGuide = useAISnailGuideWizard;
