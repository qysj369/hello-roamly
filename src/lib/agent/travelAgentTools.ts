import { recalcSearchPlanLocalBudget } from '@/lib/agent/patchSearchPlanLocal';
import { searchPlanPosterShareUrl } from '@/lib/home/buildSearchPlanPoster';
import {
  defaultSearchPlanTitle,
  ensureSharedSearchPlan,
  saveSearchStructuredPlan,
} from '@/lib/home/saveSearchStructuredPlan';
import {
  searchPlanCatchyTitle,
  searchPlanShareHashtags,
  searchPlanShareHook,
} from '@/lib/home/searchPlanShareCopy';
import { copyTextToClipboard } from '@/utils/copyTextToClipboard';
import type { SearchStructuredPlan } from '@/types/domain/searchStructuredPlan';

export type TravelAgentToolName = 'save' | 'poster' | 'copy_link' | 'copy_share' | 'recalc' | 'share';

export type TravelAgentToolResult = {
  ok: boolean;
  message: string;
  sessionId?: string;
  plan?: SearchStructuredPlan;
  shareUrl?: string;
  shareText?: string;
  openPoster?: boolean;
  openShare?: boolean;
};

export function formatSearchPlanSharePack(plan: SearchStructuredPlan): string {
  const tags = searchPlanShareHashtags(plan).map((tag) => `#${tag}`).join(' ');
  return [searchPlanCatchyTitle(plan), searchPlanShareHook(plan), tags].join('\n');
}

export async function executeTravelAgentTool(
  tool: TravelAgentToolName,
  plan: SearchStructuredPlan,
  sessionId?: string | null,
): Promise<TravelAgentToolResult> {
  if (tool === 'recalc') {
    return {
      ok: true,
      plan: recalcSearchPlanLocalBudget(plan),
      message: '已按本地消费区间重新核算市内预算，往返大交通仍只做文字提示。',
    };
  }

  if (tool === 'save') {
    const result = await saveSearchStructuredPlan({
      plan,
      title: defaultSearchPlanTitle(plan),
      isPublic: false,
      sessionId: sessionId ?? undefined,
    });
    return {
      ok: true,
      sessionId: result.sessionId,
      message: `已保存到我的方案：${defaultSearchPlanTitle(plan)}`,
    };
  }

  if (tool === 'copy_share') {
    const shareText = formatSearchPlanSharePack(plan);
    const copied = (await copyTextToClipboard(shareText)) === 'copied';
    return {
      ok: copied,
      shareText,
      message: copied ? '已复制分享标题、种草短句和话题标签。' : '复制失败，文案如下，可手动选中。',
    };
  }

  if (tool === 'share') {
    let nextSessionId = sessionId ?? undefined;
    try {
      nextSessionId = await Promise.race([
        ensureSharedSearchPlan(plan, sessionId),
        new Promise<string>((_, reject) => {
          window.setTimeout(() => reject(new Error('share-save-timeout')), 4000);
        }),
      ]);
    } catch {
      nextSessionId = sessionId ?? undefined;
    }
    return {
      ok: true,
      sessionId: nextSessionId,
      openShare: true,
      message: nextSessionId
        ? '分享已打开。点微信、抖音或小红书：下载海报并复制文案。网页发不进 App，粘贴或扫码即可。'
        : '分享已打开。点微信、抖音或小红书下载海报并复制文案。扫码需要先能保存行程，这次可先粘贴给朋友。',
    };
  }

  const nextSessionId = await ensureSharedSearchPlan(plan, sessionId);
  const shareUrl = searchPlanPosterShareUrl(nextSessionId, plan.baseInfo);

  if (tool === 'copy_link') {
    const copied = (await copyTextToClipboard(shareUrl)) === 'copied';
    return {
      ok: copied,
      sessionId: nextSessionId,
      shareUrl,
      message: copied ? '已复制分享链接。' : `链接已生成，可手动复制：${shareUrl}`,
    };
  }

  return {
    ok: true,
    sessionId: nextSessionId,
    shareUrl,
    openPoster: true,
    message: '已备好分享海报，配图按行程主题匹配。',
  };
}
