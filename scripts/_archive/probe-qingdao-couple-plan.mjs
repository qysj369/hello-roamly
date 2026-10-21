/**
 * 抽检青岛3天情侣美食：预算表 / 无提示板块 / 住宿 / 缓冲
 * 用法：node scripts/probe-qingdao-couple-plan.mjs
 */
const payload = {
  lng: 120.3826,
  lat: 36.0671,
  locationName: '青岛',
  query: '从济南出发，去青岛玩3天，同行情侣，人均预算约4000元，美食探店',
  searchQuery: '从济南出发，去青岛玩3天，同行情侣，人均预算约4000元，美食探店',
  originName: '济南市历下区中林路绿城百合花园',
};

function parseSse(raw) {
  const blocks = raw.split(/\n\n+/);
  let content = '';
  let error = null;
  const statuses = [];
  for (const block of blocks) {
    const event = block.match(/^event:\s*(\S+)/m)?.[1];
    const dataLine = block.match(/^data:\s*(.+)$/m)?.[1];
    if (!dataLine) continue;
    let data;
    try {
      data = JSON.parse(dataLine);
    } catch {
      continue;
    }
    if (event === 'status' && data.message) statuses.push(data.message);
    if (event === 'error') error = data.message || data.code || 'error';
    if (event === 'done' && typeof data.content === 'string') content = data.content;
    if (event === 'sync' && typeof data.text === 'string' && data.text.length > content.length) {
      content = data.text;
    }
  }
  return { content, error, statuses };
}

const checks = [
  ['管道预算表', (c) => /\|\s*(?:大交通|交通)\s*\|/.test(c) && /\|\s*(?:合计|总计)\s*\|/.test(c)],
  ['无圆点伪表', (c) => !/[·•]\s*(?:大交通|市内交通|餐饮|门票|住宿)/.test(c.split('【行程流水账】')[0] ?? c)],
  ['无蜗牛提示板块', (c) => !c.includes('【蜗牛提示】') && !c.includes('【避坑指南】')],
  ['无见行程正文套话', (c) => !c.includes('见行程正文')],
  ['连住中山路或栈桥', (c) => {
    const nights = [...c.matchAll(/今晚住宿片区[：:]\s*([^\n。]+)/g)].map((m) => m[1] ?? '');
    const stay = nights.filter((n) => !/返程|回家|无需住宿/.test(n));
    return stay.length > 0 && stay.every((n) => /中山路|栈桥/.test(n));
  }],
  ['无质检红字', (c) => !/质检提醒|严重偏差|【蜗牛质检】/.test(c)],
  ['D3 2.5小时缓冲', (c) => /2\.5\s*小时|两个半小时|两小时半/.test(c)],
  ['海鸥季节', (c) => /冬春/.test(c)],
  ['博物馆预约停检', (c) => /预约/.test(c) && /16/.test(c)],
  ['奥帆拒黄牛', (c) => /官方售票|黄牛/.test(c)],
  ['无三选一模板', (c) => !/(?:地铁[：:].{0,80}公交[：:].{0,80}打车)|落地最佳|三方案/.test(c)],
  ['无行程内消费表', (c) => !/\|------\|/.test(c.split('【行程流水账】')[1] ?? '')],
  ['无地铁公交分栏', (c) => !(/地铁方案/.test(c) && /公交方案/.test(c))],
  ['栈桥涨潮湿滑', (c) => /涨潮|湿滑/.test(c)],
  ['D2雨天备选完整', (c) => /雨天备选/.test(c)],
  ['D3取行李14点', (c) => /14:00前动身取回行李/.test(c)],
  ['无蜗牛表情', (c) => !c.includes('🐌')],
];

const res = await fetch('https://helloroamly.com/api/ai/generate-plan-stream', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload),
});
const raw = await res.text();
const { content, error, statuses } = parseSse(raw);
const regen = statuses.some((s) => /重新生成/.test(s));
console.log('HTTP', res.status, 'chars', content.length, 'regen', regen);
console.log('statuses', statuses.join(' | ') || '(none)');
if (error) console.log('error', error);
for (const [name, fn] of checks) {
  console.log(`${fn(content) ? 'PASS' : 'FAIL'}  ${name}`);
}

function copyKeepPipes(markdown) {
  return markdown
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => (/^\s*\|/.test(line) ? line.trim() : line))
    .join('\n');
}
const copied = copyKeepPipes(content);
console.log(copied.includes('| 大交通 |') || copied.includes('| 交通 |') ? 'PASS  复制后仍是管道表' : 'FAIL  复制后仍是管道表');
console.log(!/[·•]\s*(?:大交通|市内交通)/.test((copied.split('【行程流水账】')[0] ?? copied)) ? 'PASS  复制后无圆点伪表' : 'FAIL  复制后无圆点伪表');
const days = ['第1天', '第2天', '第3天'].filter((d) => content.includes(d));
console.log(days.length === 3 ? 'PASS  三天齐全' : `FAIL  三天齐全（现有 ${days.join(' ')}）`);

console.log('\n----- PLAN -----\n');
console.log(content.slice(0, 6000));
if (content.length > 6000) console.log('\n...[truncated]...\n', content.slice(-1500));
