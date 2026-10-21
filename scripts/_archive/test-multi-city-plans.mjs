/**
 * 多地行程生成冒烟测试
 * 用法：node scripts/test-multi-city-plans.mjs
 */
const BASE = process.env.ACCEPTANCE_BASE_URL ?? 'http://127.0.0.1:5173';
const ORIGIN = '济南市历下区中林路绿城百合花园';

const CITIES = [
  { name: '西安', lng: 108.9398, lat: 34.3416, days: 3, budget: 2000 },
  { name: '成都', lng: 104.0665, lat: 30.5723, days: 3, budget: 1800 },
  { name: '杭州', lng: 120.1551, lat: 30.2741, days: 2, budget: 1500 },
  { name: '大理', lng: 100.2257, lat: 25.5894, days: 4, budget: 2500 },
  { name: '北京', lng: 116.4074, lat: 39.9042, days: 3, budget: 3000 },
  { name: '扬州', lng: 119.4129, lat: 32.3942, days: 2, budget: 1200 },
  { name: '莆田', lng: 119.0076, lat: 25.4541, days: 3, budget: 1500 },
  { name: '厦门', lng: 118.0894, lat: 24.4798, days: 3, budget: 2000 },
];

async function readSseUntilDone(response, maxMs = 180_000) {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  const events = [];
  const start = Date.now();

  while (Date.now() - start < maxMs) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split('\n\n');
    buffer = parts.pop() ?? '';
    for (const part of parts) {
      const lines = part.split('\n');
      let event = 'message';
      let data = '';
      for (const line of lines) {
        if (line.startsWith('event:')) event = line.slice(6).trim();
        if (line.startsWith('data:')) data += line.slice(5).trim();
      }
      if (!data) continue;
      let parsed;
      try {
        parsed = JSON.parse(data);
      } catch {
        parsed = data;
      }
      events.push({ event, data: parsed });
      if (event === 'done' || event === 'error') {
        await reader.cancel();
        return events;
      }
    }
  }
  await reader.cancel();
  return events;
}

function extractContent(events) {
  const done = events.find((e) => e.event === 'done');
  if (done?.data?.content) return done.data.content;
  return events
    .filter((e) => e.event === 'delta')
    .map((d) => d.data?.text ?? '')
    .join('');
}

async function testCity(city) {
  const query = `从${ORIGIN}出发，目的地${city.name}，${city.days}天预算${city.budget}元。必须写门到门交通。目的地必须是${city.name}。`;
  const started = Date.now();
  const res = await fetch(`${BASE}/api/ai/generate-plan-stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream' },
    body: JSON.stringify({
      lng: city.lng,
      lat: city.lat,
      locationName: city.name,
      originName: ORIGIN,
      query,
    }),
  });

  if (!res.ok) {
    return { city: city.name, ok: false, error: `HTTP ${res.status}`, ms: Date.now() - started };
  }

  const events = await readSseUntilDone(res);
  const err = events.find((e) => e.event === 'error');
  if (err) {
    return {
      city: city.name,
      ok: false,
      error: typeof err.data === 'string' ? err.data : JSON.stringify(err.data),
      ms: Date.now() - started,
    };
  }

  const content = extractContent(events);
  const sections = ['【方案简介】', '【行程流水账】', '【蜗牛提示】', '【避坑指南】'];
  const missing = sections.filter((s) => !content.includes(s));
  const mentionsCity = content.includes(city.name);
  const hasOrigin = /济南|历下|西站|百合/.test(content);

  return {
    city: city.name,
    ok: missing.length === 0 && mentionsCity && hasOrigin,
    error:
      missing.length > 0
        ? `缺少: ${missing.join(' ')}`
        : !mentionsCity
          ? `未提及${city.name}`
          : !hasOrigin
            ? '未写济南出发'
            : null,
    chars: content.length,
    ms: Date.now() - started,
  };
}

async function main() {
  console.log(`\n多地行程测试 · ${BASE}\n`);
  try {
    const ping = await fetch(BASE);
    if (!ping.ok) throw new Error(`首页 HTTP ${ping.status}`);
  } catch (e) {
    console.error('请先启动 pnpm run dev');
    process.exit(1);
  }

  const results = [];
  for (const city of CITIES) {
    process.stdout.write(`测试 ${city.name}（${city.days}天 ¥${city.budget}）… `);
    const result = await testCity(city);
    results.push(result);
    if (result.ok) {
      console.log(`✓ ${result.chars}字 ${Math.round(result.ms / 1000)}s`);
    } else {
      console.log(`✗ ${result.error} (${Math.round(result.ms / 1000)}s)`);
    }
  }

  const passed = results.filter((r) => r.ok).length;
  console.log(`\n结果: ${passed}/${results.length} 通过\n`);
  if (passed < results.length) {
    console.log('失败城市:');
    for (const r of results.filter((x) => !x.ok)) {
      console.log(`  - ${r.city}: ${r.error}`);
    }
    process.exit(1);
  }
  console.log('✅ 全部城市行程生成正常\n');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
