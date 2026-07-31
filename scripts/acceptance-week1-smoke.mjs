/**
 * 第一周验收冒烟：跨城规划 SSE + 顾问 chat-stream
 * 用法：node scripts/acceptance-week1-smoke.mjs
 */
const BASE = process.env.ACCEPTANCE_BASE_URL ?? 'http://127.0.0.1:5173';

async function readSse(response, { maxMs = 120_000, stopOn = ['done', 'error'] } = {}) {
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
      if (stopOn.includes(event)) {
        await reader.cancel();
        return events;
      }
    }
  }
  await reader.cancel();
  return events;
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function testChatStream() {
  console.log('\n[1/2] 顾问 /api/ai/chat-stream …');
  const res = await fetch(`${BASE}/api/ai/chat-stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream' },
    body: JSON.stringify({
      messages: [{ role: 'user', content: '济南到莆田三天1500，先给一句建议' }],
    }),
  });
  assert(res.ok, `chat-stream HTTP ${res.status}`);
  const events = await readSse(res, { maxMs: 45_000 });
  const deltas = events.filter((e) => e.event === 'delta');
  const done = events.some((e) => e.event === 'done');
  const err = events.find((e) => e.event === 'error');
  assert(!err, `chat-stream error: ${JSON.stringify(err?.data)}`);
  assert(done, 'chat-stream 未收到 done');
  assert(deltas.length > 0, 'chat-stream 无 delta 输出');
  const text = deltas.map((d) => d.data?.text ?? '').join('');
  assert(text.trim().length > 8, 'chat-stream 回复过短');
  console.log(`  ✓ 流式回复 ${text.length} 字，done 正常`);
}

async function testPlanStream() {
  console.log('\n[2/2] 跨城 /api/ai/generate-plan-stream …');
  const res = await fetch(`${BASE}/api/ai/generate-plan-stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream' },
    body: JSON.stringify({
      lng: 119.007777,
      lat: 25.454084,
      locationName: '莆田',
      originName: '济南市历下区中林路绿城百合花园',
      query:
        '从济南市历下区中林路绿城百合花园出发，目的地莆田，3天预算1500元。必须写门到门：家门口→济南西站/机场→莆田→玩法。目的地必须是莆田，禁止写成昆明或弥勒。',
    }),
  });
  assert(res.ok, `generate-plan-stream HTTP ${res.status}`);
  const events = await readSse(res, { maxMs: 180_000 });
  const err = events.find((e) => e.event === 'error');
  assert(!err, `plan-stream error: ${JSON.stringify(err?.data)}`);
  const done = events.find((e) => e.event === 'done');
  assert(done, 'plan-stream 未收到 done');
  const content =
    done?.data?.content ??
    events
      .filter((e) => e.event === 'delta')
      .map((d) => d.data?.text ?? '')
      .join('');
  assert(content.includes('【方案简介】'), '缺少【方案简介】');
  assert(content.includes('【行程流水账】'), '缺少【行程流水账】');
  assert(content.includes('【蜗牛提示】'), '缺少【蜗牛提示】');
  assert(content.includes('【避坑指南】'), '缺少【避坑指南】');
  assert(/莆田/.test(content), '方案未提及莆田');
  assert(!/昆明|弥勒/.test(content), '方案出现错误目的地（昆明/弥勒）');
  assert(/济南|西站|历下|百合/.test(content), '跨城方案未写济南出发段');
  console.log(`  ✓ 四段齐全，约 ${content.length} 字，done 正常`);
}

async function main() {
  console.log(`验收基址: ${BASE}`);
  try {
    const ping = await fetch(BASE);
    assert(ping.ok, `首页不可达 HTTP ${ping.status}`);
  } catch (e) {
    throw new Error(`请先启动 pnpm run dev：${e.message}`);
  }
  await testChatStream();
  await testPlanStream();
  console.log('\n✅ 第一周 API 验收冒烟通过\n');
}

main().catch((err) => {
  console.error('\n❌ 验收失败:', err.message);
  process.exit(1);
});
