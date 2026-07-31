/** 语音识别后：旅行意图与地名纠错（第8周：口音/误识别 → 标准搜索词） */

type SpeechCorrectionRule = {
  pattern: RegExp;
  replace: string | ((match: string, ...groups: string[]) => string);
};

const SPEECH_CORRECTION_RULES: SpeechCorrectionRule[] = [
  // 连读：多地联游（须在单站替换之前）
  {
    pattern: /曲阜\s*微山湖\s*台儿庄/g,
    replace: '曲阜微山湖台儿庄',
  },
  {
    pattern: /去\s*曲阜\s*再去\s*微山湖\s*再去\s*台儿庄/g,
    replace: '去曲阜微山湖台儿庄',
  },
  {
    pattern: /周村古城\s*青州\s*潍坊/g,
    replace: '周村古城青州潍坊',
  },
  {
    pattern: /周村\s*青州\s*潍坊/g,
    replace: '周村古城青州潍坊',
  },
  // 地名谐音
  { pattern: /台儿庄/g, replace: '台儿庄' },
  { pattern: /台儿装|台二庄|台而庄/g, replace: '台儿庄' },
  { pattern: /微山湖/g, replace: '微山湖' },
  { pattern: /微山胡|微山壶|巍山湖/g, replace: '微山湖' },
  { pattern: /曲府|曲富/g, replace: '曲阜' },
  { pattern: /周村古城|周村/g, replace: '周村古城' },
  { pattern: /青州|青洲/g, replace: '青州' },
  { pattern: /潍坊|维坊/g, replace: '潍坊' },
  { pattern: /历下区|历下/g, replace: '历下区' },
  { pattern: /力下区|丽下区/g, replace: '历下区' },
  { pattern: /绿城百合花园|百合花园/g, replace: '绿城百合花园' },
  // 天数/预算口语
  { pattern: /三天三夜/g, replace: '三天' },
  { pattern: /([一二三四五六七八九十两\d]+)\s*个\s*地方/g, replace: '$1个地方' },
  { pattern: /一千五|1千5|1500块/g, replace: '1500' },
  { pattern: /两千|2千|2000块/g, replace: '2000' },
  // 交通/主题
  { pattern: /动车站|高铁站/g, replace: '高铁' },
  { pattern: /普快|普列/g, replace: '普快' },
  { pattern: /大巴|巴士/g, replace: '大巴' },
  { pattern: /自驾|自己开车/g, replace: '自驾' },
  { pattern: /露营|野营/g, replace: '露营' },
  { pattern: /垂钓|钓鱼/g, replace: '垂钓' },
  { pattern: /亲子|带娃/g, replace: '亲子' },
  { pattern: /研学/g, replace: '研学' },
  { pattern: /采摘/g, replace: '采摘' },
  // 意图词
  { pattern: /穷游规划|旅游规划|旅行规划/g, replace: '穷游规划' },
  { pattern: /帮我规划|给我规划|帮忙规划/g, replace: '规划' },
  { pattern: /从(.+?)出发/g, replace: '从$1出发' },
];

function applyRule(text: string, rule: SpeechCorrectionRule): string {
  if (typeof rule.replace === 'string') {
    return text.replace(rule.pattern, rule.replace);
  }
  return text.replace(rule.pattern, rule.replace);
}

/** 对 ASR 结果做旅行意图纠错，便于搜索/规划解析 */
export function correctAdvisorSpeechIntent(raw: string): string {
  let text = raw.trim();
  if (!text) {
    return text;
  }

  for (const rule of SPEECH_CORRECTION_RULES) {
    text = applyRule(text, rule);
  }

  return text.replace(/\s+/g, '').trim();
}
