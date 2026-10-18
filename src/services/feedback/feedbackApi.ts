import { http } from '@/lib/api/http';

export type FeedbackCategory = 'city_error' | 'guide_issue' | 'ui_bug' | 'other';

export type SubmitFeedbackInput = {
  category: FeedbackCategory;
  message: string;
  city?: string;
  page?: string;
  contact?: string;
};

export type SubmitFeedbackResult = {
  ok: boolean;
  id?: string;
  message: string;
};

/** 提交产品反馈（城市信息 / 攻略 / 交互） */
export async function submitProductFeedback(
  input: SubmitFeedbackInput,
): Promise<SubmitFeedbackResult> {
  const { data } = await http.post('/api/feedback', input);
  const payload = data as SubmitFeedbackResult & { error?: string };
  if (!payload?.ok) {
    throw new Error(payload?.error || payload?.message || '提交失败');
  }
  return {
    ok: true,
    id: payload.id,
    message: payload.message || '感谢反馈',
  };
}
