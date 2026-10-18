/**
 * 生成完成后的展示清洗：去掉 Prompt/Markdown 标记，不改行程语义。
 * 不放进 src/lib/plan（流水线禁区）。
 */

const TRANSIT_LINE_EMOJI = /^[\s]*[🚇🚌🚕🎫🚠🏔️🍜⛩️🍵🐌]\s*/u;

function scrubLineMarkup(line: string): string {
  const isTable = /^\s*\|/.test(line);
  let text = line;
  if (!isTable) {
    text = text.replace(/^\s{0,3}#{1,6}\s+/, '');
  }
  for (let i = 0; i < 4; i += 1) {
    text = text.replace(/\*{1,3}([^*\n]+)\*{1,3}/g, '$1');
  }
  text = text.replace(/[*#＊＃]/g, '');
  if (!isTable && /落地最佳/.test(text)) {
    return '';
  }
  if (!isTable) {
    text = text.replace(TRANSIT_LINE_EMOJI, '');
    text = text.replace(/周边）/g, '周边');
    text = text.replace(/R\s*3\s*号线|R3线/g, '3号线').replace(/地铁\s*R\s*3/g, '地铁3号线');
    text = text.replace(/R\s*2\s*号线|R2线/g, '2号线').replace(/地铁\s*R\s*2/g, '地铁2号线');
  }
  if (!isTable && /^\s*-{1,3}\s*$/.test(text)) {
    return '';
  }
  return text;
}

/** 去掉文末装配占位，避免读者看到独立【蜗牛提示】【避坑指南】 */
function stripTrailingInsightBlocks(content: string): string {
  const tip = content.search(/\n【蜗牛提示】/);
  const pit = content.search(/\n【避坑指南】/);
  const startsAtTitle =
    content.startsWith('【蜗牛提示】') || content.startsWith('【避坑指南】') ? 0 : -1;
  const cut = [tip, pit, startsAtTitle].filter((index) => index >= 0).sort((a, b) => a - b)[0];
  return cut == null ? content : content.slice(0, cut).trimEnd();
}

/** 去掉未闭合/多余 Markdown，保留表格与列表，压缩空行 */
export function scrubPlanDisplayMarkup(content: string): string {
  if (!content) {
    return content;
  }
  const next = stripTrailingInsightBlocks(content)
    .replace(/^>.*严重偏差[^\n]*(?:\n+|$)/gm, '')
    .replace(/>?\s*🐌?\s*\*{0,2}质检提醒\*{0,2}：[^\n]*/g, '')
    .replace(/【蜗牛质检】[\s\S]*$/g, '')
    .replace(/🐌\s*/g, '')
    .split(/\r?\n/)
    .map(scrubLineMarkup)
    .join('\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  return next;
}

export function planDisplayHasCodeMarkup(content: string): boolean {
  return /[*#＊＃]/.test(content);
}
