import { buildTravelExpertAdvisorPrompt } from '@/lib/ai/travelExpertPersona';

import { buildStrictOriginConstraint } from '@/lib/plan/doorToDoorTransit';

import type { AiChatContext } from '@/types/domain/aiChat';

import { TRAVEL_INTEREST_OPTIONS, TRAVEL_PACE_OPTIONS } from '@/types/domain/aiTravelParams';



export function buildTravelAdvisorSystemPrompt(context?: AiChatContext): string {

  const lines = [buildTravelExpertAdvisorPrompt()];



  if (context?.dream?.trim()) {

    lines.push(`\n用户旅行梦想：${context.dream.trim()}`);

  }

  if (context?.destination?.trim()) {

    lines.push(`偏好目的地：${context.destination.trim()}`);

  }

  if (context?.origin?.name?.trim()) {

    const name = context.origin.name.trim();

    lines.push(

      `\n用户已确认出发地：${name}（${context.origin.lng}, ${context.origin.lat}）`,

    );

    lines.push(buildStrictOriginConstraint(name));

    lines.push(

      '默认从该出发地规划门到门交通与大交通；禁止要求用户再回复出发地。若用户明确要换出发地，提示回首页点「确认出发地」校正。',

    );

  }

  if (context?.location?.name?.trim()) {

    lines.push(

      `关联地图地点：${context.location.name.trim()}（${context.location.lng}, ${context.location.lat}）`,

    );

  }

  if (context?.planExcerpt?.trim()) {

    lines.push(

      `\n用户刚从地图规划带入的方案摘要（可在此基础上追问、微调，勿重复整段照抄）：\n${context.planExcerpt.trim()}`,

    );

  }

  if (context?.linkedPlanSessionId) {

    lines.push(`关联地图规划会话：${context.linkedPlanSessionId}`);

  }



  const params = context?.travelParams;

  if (params) {

    lines.push(

      `\n当前参数：${params.days} 天 · 预算 ¥${params.budgetMin}–${params.budgetMax}`,

    );

    const pace = TRAVEL_PACE_OPTIONS.find((o) => o.id === params.pace)?.label;

    if (pace) {

      lines.push(`旅行节奏：${pace}`);

    }

    if (params.interests.length > 0) {

      const labels = params.interests

        .map((id) => TRAVEL_INTEREST_OPTIONS.find((o) => o.id === id)?.label)

        .filter(Boolean);

      lines.push(`兴趣标签：${labels.join('、')}`);

    }

  } else if (context?.days != null || context?.budget) {

    const bits: string[] = [];

    if (context.days != null) {

      bits.push(`${context.days} 天`);

    }

    if (context.budget?.trim()) {

      bits.push(`预算约 ¥${context.budget.trim()}`);

    }

    if (bits.length > 0) {

      lines.push(`\n当前参数：${bits.join(' · ')}`);

    }

  }



  return lines.join('');

}

