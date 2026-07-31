/**
 * 第三周验收：穷游专家人设 + 顾问生成行程 + 会话保存
 * 用法：node scripts/acceptance-week3-smoke.mjs
 */
const BASE = process.env.ACCEPTANCE_BASE_URL ?? 'http://127.0.0.1:5173';
const USER_ID = 'user-roamly-demo';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function readSse(response, { maxMs = 90_000 } = {}) {
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

async function main() {
  console.log(`验收基址: ${BASE}`);
  const ping = await fetch(BASE);
  assert(ping.ok, `首页不可达 HTTP ${ping.status}`);

  console.log('\n[1/3] 顾问流式（穷游专家上下文）…');
  const chatRes = await fetch(`${BASE}/api/ai/chat-stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream' },
    body: JSON.stringify({
      messages: [{ role: 'user', content: '扬州三天600，多给免费景点和公交方案' }],
      context: {
        destination: '扬州',
        days: 3,
        budget: '600',
        origin: { name: '济南市历下区绿城百合花园', lng: 117.1, lat: 36.65 },
        travelParams: {
          days: 3,
          budgetMin: 500,
          budgetMax: 700,
          pace: 'balanced',
          interests: ['food', 'culture'],
        },
      },
    }),
  });
  assert(chatRes.ok, `chat-stream HTTP ${chatRes.status}`);
  const chatEvents = await readSse(chatRes);
  const chatErr = chatEvents.find((e) => e.event === 'error');
  assert(!chatErr, `chat error: ${JSON.stringify(chatErr?.data)}`);
  assert(chatEvents.some((e) => e.event === 'done'), 'chat 未收到 done');
  const chatText = chatEvents
    .filter((e) => e.event === 'delta')
    .map((e) => e.data?.text ?? '')
    .join('');
  assert(chatText.trim().length > 20, '顾问回复过短');
  console.log(`  ✓ 顾问回复 ${chatText.length} 字`);

  console.log('\n[2/3] 穷游专家人设单测 …');
  const { execSync } = await import('node:child_process');
  const { fileURLToPath } = await import('node:url');
  const { dirname, join } = await import('node:path');
  const scriptDir = dirname(fileURLToPath(import.meta.url));
  const projectRoot = join(scriptDir, '..');
  execSync(
    'pnpm exec vitest run src/services/ai/prompts/travelAdvisorSystem.test.ts --reporter=dot',
    { cwd: projectRoot, stdio: 'inherit' },
  );
  console.log('  ✓ 顾问人设与出发地约束单测通过');

  console.log('\n[3/3] 顾问会话保存到方案库 …');
  const sessionId = `advisor-w3-${Date.now()}`;
  const headers = { 'Content-Type': 'application/json', 'x-user-id': USER_ID };
  const createRes = await fetch(`${BASE}/api/user/ai-sessions`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      id: sessionId,
      trigger: 'advisor',
      initialQuery: '扬州三天600',
      location: { name: '扬州', lng: 119.42, lat: 32.39 },
      fullHistory: [
        { role: 'user', content: '扬州三天600，多给免费景点' },
        { role: 'assistant', content: chatText.slice(0, 400) },
      ],
    }),
  });
  assert(createRes.ok, `create session HTTP ${createRes.status}`);

  const saveRes = await fetch(`${BASE}/api/user/ai-sessions/${encodeURIComponent(sessionId)}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({
      title: '第三周验收-扬州',
      isPublic: false,
      isSaved: true,
      initialQuery: '扬州三天600',
      location: { name: '扬州', lng: 119.42, lat: 32.39 },
      fullHistory: [
        { role: 'user', content: '扬州三天600，多给免费景点' },
        { role: 'assistant', content: chatText.slice(0, 400) },
      ],
    }),
  });
  assert(saveRes.ok, `save session HTTP ${saveRes.status}`);
  const saved = await saveRes.json();
  assert(saved.item?.isSaved === true, '会话未标记 isSaved');
  assert(saved.item?.title === '第三周验收-扬州', '保存标题不匹配');

  const plansRes = await fetch(`${BASE}/api/user/plans`, { headers });
  const plansPayload = await plansRes.json();
  const inPlans = plansPayload?.items?.some((item) => item.id === sessionId);
  assert(inPlans, '保存后未出现在我的方案');
  console.log('  ✓ 顾问会话已保存到方案库');

  console.log('\n✅ 第三周 API 验收冒烟通过\n');
}

main().catch((err) => {
  console.error('\n❌ 验收失败:', err.message);
  process.exit(1);
});
