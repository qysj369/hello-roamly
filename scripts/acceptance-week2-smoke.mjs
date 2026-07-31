/**
 * 第二周验收：顾问会话持久化 + 上下文 handoff
 * 用法：node scripts/acceptance-week2-smoke.mjs
 */
const BASE = process.env.ACCEPTANCE_BASE_URL ?? 'http://127.0.0.1:5173';

async function readSse(response, { maxMs = 60_000 } = {}) {
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

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function main() {
  console.log(`验收基址: ${BASE}`);
  const ping = await fetch(BASE);
  assert(ping.ok, `首页不可达 HTTP ${ping.status}`);

  const sessionId = `advisor-smoke-${Date.now()}`;

  console.log('\n[1/3] 创建顾问会话 (trigger=advisor)…');
  const createRes = await fetch(`${BASE}/api/user/ai-sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: sessionId,
      trigger: 'advisor',
      initialQuery: '济南 3 天 1500',
      location: { name: '济南', lng: 117.0, lat: 36.65 },
      fullHistory: [
        { role: 'user', content: '济南 3 天 1500，多安排免费景点' },
        { role: 'assistant', content: '好的，济南三天可以这样安排…' },
      ],
    }),
  });
  assert(createRes.ok, `create session HTTP ${createRes.status}`);
  const created = await createRes.json();
  assert(created.item?.trigger === 'advisor', 'trigger 应为 advisor');

  console.log('\n[2/3] 读取会话 (模拟 /ai?session= 恢复)…');
  const getRes = await fetch(`${BASE}/api/user/ai-sessions/${encodeURIComponent(sessionId)}`);
  assert(getRes.ok, `get session HTTP ${getRes.status}`);
  const got = await getRes.json();
  assert(got.item?.fullHistory?.length === 2, '历史应有 2 条');
  console.log('  ✓ 会话可恢复');

  console.log('\n[3/3] 顾问流式（带 planExcerpt 上下文）…');
  const chatRes = await fetch(`${BASE}/api/ai/chat-stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream' },
    body: JSON.stringify({
      messages: [{ role: 'user', content: '基于已有方案，第二天能改成免费景点吗？' }],
      context: {
        destination: '济南',
        days: 3,
        budget: '1500',
        planExcerpt: '【方案简介】济南三天穷游…',
        source: 'plan_result',
        linkedPlanSessionId: 'plan-demo-001',
      },
    }),
  });
  assert(chatRes.ok, `chat-stream HTTP ${chatRes.status}`);
  const events = await readSse(chatRes);
  const err = events.find((e) => e.event === 'error');
  assert(!err, `chat error: ${JSON.stringify(err?.data)}`);
  assert(events.some((e) => e.event === 'done'), 'chat 未收到 done');
  console.log('  ✓ 带上下文的顾问流式正常');

  console.log('\n✅ 第二周 API 验收冒烟通过\n');
}

main().catch((err) => {
  console.error('\n❌ 验收失败:', err.message);
  process.exit(1);
});
