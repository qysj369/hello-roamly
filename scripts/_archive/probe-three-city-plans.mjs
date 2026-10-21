/**
 * 生产流式规划抽检：杭州 / 成都 / 西安
 * 用法：node scripts/probe-three-city-plans.mjs
 */
const ORIGIN = '济南市历下区中林路绿城百合花园';
const CASES = [
  {
    id: 'hangzhou',
    locationName: '杭州',
    lng: 120.1551,
    lat: 30.2741,
    budgetYuan: 1500,
    query: '去杭州玩3天，同行情侣，人均预算约1500元，自然山水',
  },
  {
    id: 'chengdu',
    locationName: '成都',
    lng: 104.0665,
    lat: 30.5723,
    budgetYuan: 1200,
    query: '去成都玩3天，同行单人，人均预算约1200元，美食探店',
  },
  {
    id: 'xian',
    locationName: '西安',
    lng: 108.9402,
    lat: 34.3416,
    budgetYuan: 1800,
    query: '去西安玩3天，同行亲子，人均预算约1800元，人文慢逛',
  },
];

function parseSseDone(raw) {
  const blocks = raw.split(/\n\n+/);
  let content = '';
  let error = null;
  let statuses = [];
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

function extractTotal(content) {
  const intro = content.split('【行程流水账】')[0] ?? content;
  const dotted = intro.match(/总计[^\d]{0,16}(\d+)\s*元/);
  if (dotted?.[1]) return Number.parseInt(dotted[1], 10);
  const table = intro.match(/\|\s*总计\s*\|\s*(?:约\s*)?(\d+)/);
  return table?.[1] ? Number.parseInt(table[1], 10) : null;
}

function judge(content, cityCase) {
  const itinerary = content.split('【蜗牛提示】')[0] ?? content;
  const tips = content.split('【蜗牛提示】')[1]?.split('【避坑指南】')[0] ?? '';
  const pitfalls = content.split('【避坑指南】')[1] ?? '';
  const total = extractTotal(content);
  const flags = [];
  if (!content.includes('【方案简介】') || !content.includes('【行程流水账】')) {
    flags.push('缺装配标题');
  }
  if (!/第\s*1\s*天/.test(content) || !/第\s*2\s*天/.test(content) || !/第\s*3\s*天/.test(content)) {
    flags.push('天数不齐');
  }
  if (/\*\*地铁\*\*[\s\S]{0,480}?\*\*公交\*\*/.test(content)) {
    flags.push('三选一交通模板');
  }
  const altCount = (content.match(/也可以地铁|也可以公交|但公交更方便/g) || []).length;
  if (altCount >= 2) flags.push(`交通同质句×${altCount}`);
  if (tips.includes('防滑') || pitfalls.includes('黄牛') || /【蜗牛提示】\s*\n(?:[^\n见]{8,})/.test(content)) {
    if (!/见行程/.test(tips) && tips.replace(/\s/g, '').length > 20) {
      flags.push('提示区仍独立成篇');
    }
  }
  if (total != null && total > cityCase.budgetYuan * 1.05) {
    flags.push(`超预算 ${total}>${cityCase.budgetYuan}`);
  }
  if (total == null) flags.push('无总计');
  if (!/机动/.test(content.split('【行程流水账】')[0] ?? '')) flags.push('预算缺机动');
  if (!/2\.5|2\.5小时|两个半小时|缓冲/.test(itinerary)) flags.push('末日前缓冲弱');
  if (/去北(?!京)|京玩|自然山(?!水)|约偏|探店站/.test(content)) flags.push('疑似假地名');
  const extraCity = ['绍兴', '乌镇', '重庆', '上海', '南京'].filter(
    (name) => name !== cityCase.locationName && new RegExp(`去${name}|转场.*${name}|${name}东站`).test(itinerary),
  );
  if (extraCity.length) flags.push(`疑似跨城:${extraCity.join(',')}`);
  const intro = (content.split('【行程流水账】')[0] ?? '').replace(/【方案简介】|\|[\s\S]*/g, '');
  if (intro.replace(/\s/g, '').length < 80) flags.push('开篇过短');
  return { total, flags, tipLen: tips.trim().length, pitLen: pitfalls.trim().length };
}

async function runOne(cityCase) {
  const started = Date.now();
  const res = await fetch('https://helloroamly.com/api/ai/generate-plan-stream', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream' },
    body: JSON.stringify({
      lng: cityCase.lng,
      lat: cityCase.lat,
      query: cityCase.query,
      searchQuery: cityCase.query,
      locationName: cityCase.locationName,
      originName: ORIGIN,
    }),
  });
  const raw = await res.text();
  const parsed = parseSseDone(raw);
  const verdict = parsed.content ? judge(parsed.content, cityCase) : { total: null, flags: ['无正文'], tipLen: 0, pitLen: 0 };
  return {
    id: cityCase.id,
    city: cityCase.locationName,
    ms: Date.now() - started,
    http: res.status,
    error: parsed.error,
    statuses: parsed.statuses,
    chars: parsed.content.length,
    ...verdict,
    snippet: parsed.content.slice(0, 280).replace(/\n/g, ' '),
    content: parsed.content,
  };
}

const outDir = new URL('../tmp-plan-probes/', import.meta.url);
await import('node:fs/promises').then((fs) => fs.mkdir(outDir, { recursive: true }));

const results = [];
for (const cityCase of CASES) {
  console.log(`\n=== ${cityCase.locationName} ===`);
  try {
    const row = await runOne(cityCase);
    const { content, ...summary } = row;
    console.log(JSON.stringify(summary, null, 2));
    await import('node:fs/promises').then((fs) =>
      fs.writeFile(new URL(`${cityCase.id}.md`, outDir), content || row.error || '', 'utf8'),
    );
    results.push(summary);
  } catch (error) {
    console.error(cityCase.id, error);
    results.push({ id: cityCase.id, error: String(error), flags: ['请求失败'] });
  }
}

console.log('\n=== SUMMARY ===');
console.log(JSON.stringify(results, null, 2));
