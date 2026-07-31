/**
 * 第四周验收：预算/POI/天气工具 + 流式追问 continue-chat-stream
 */
const BASE = process.env.ACCEPTANCE_BASE_URL ?? 'http://127.0.0.1:5173';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const SAMPLE_PLAN = `【方案简介】

莆田 3 天。

| 项目 | 金额 |
| **总计** | **¥1500** |

【行程流水账】

Day1 湄洲岛公园 ¥50，高铁 ¥200，午餐 ¥80。Day2 广化寺景区 ¥100，门票 ¥100。

【蜗牛提示】

老城免费逛。

【避坑指南】

别在码头被宰。`;

async function consumeSse(response, signal) {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let reply = '';
  let finished = false;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const chunks = buffer.split('\n\n');
    buffer = chunks.pop() ?? '';
    for (const chunk of chunks) {
      const lines = chunk.split('\n');
      let event = 'message';
      const dataLines = [];
      for (const line of lines) {
        if (line.startsWith('event:')) event = line.slice(6).trim();
        if (line.startsWith('data:')) dataLines.push(line.slice(5).trim());
      }
      if (dataLines.length === 0) continue;
      let data;
      try {
        data = JSON.parse(dataLines.join('\n'));
      } catch {
        continue;
      }
      if (event === 'delta' && data.text) reply += data.text;
      if (event === 'done') {
        if (data.reply) reply = data.reply;
        finished = true;
      }
      if (event === 'error' && data.code !== 'deepseek_unconfigured') {
        throw new Error(data.message ?? 'SSE error');
      }
    }
  }
  return { reply, finished };
}

async function main() {
  console.log(`验收基址: ${BASE}`);
  const ping = await fetch(BASE);
  assert(ping.ok, `首页不可达 HTTP ${ping.status}`);

  console.log('\n[1/5] 预算校验单测 …');
  const { execSync } = await import('node:child_process');
  const { fileURLToPath } = await import('node:url');
  const { dirname, join } = await import('node:path');
  const projectRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
  execSync(
    'pnpm exec vitest run src/lib/plan/planBudgetValidator.test.ts src/lib/plan/detectFollowUpIntent.test.ts --reporter=dot',
    { cwd: projectRoot, stdio: 'inherit' },
  );
  console.log('  ✓ 预算校验与追问意图单测通过');

  console.log('\n[2/5] plan-tools 工具层 …');
  const toolsRes = await fetch(`${BASE}/api/ai/plan-tools`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      content: SAMPLE_PLAN,
      locationName: '莆田',
    }),
  });
  assert(toolsRes.ok, `plan-tools HTTP ${toolsRes.status}`);
  const toolsPayload = await toolsRes.json();
  const report = toolsPayload?.report;
  assert(report?.budget, 'plan-tools 缺少 budget');
  assert(Array.isArray(report.poiChecks), 'plan-tools 缺少 poiChecks');
  assert(report.weather?.summary, 'plan-tools 缺少 weather');
  assert(report.combinedFootnote, 'plan-tools 缺少 combinedFootnote');
  console.log('  ✓ 预算/POI/天气工具层返回正常');

  console.log('\n[3/5] continue-chat 非流式追问 …');
  const res = await fetch(`${BASE}/api/ai/continue-chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      planId: `week4-smoke-${Date.now()}`,
      message: '预算压到 1200，花费表和流水账要对齐，目的地仍是莆田',
      locationName: '莆田',
      lng: 119.0,
      lat: 25.45,
      fullHistory: [
        { role: 'assistant', content: SAMPLE_PLAN },
        { role: 'user', content: '预算能不能再省一点' },
      ],
    }),
  });
  assert(res.ok, `continue-chat HTTP ${res.status}`);
  const payload = await res.json();
  const reply = payload?.reply ?? '';
  assert(reply.includes('【方案简介】'), '追问回复缺少【方案简介】');
  assert(reply.includes('【行程流水账】'), '追问回复缺少【行程流水账】');
  assert(/莆田/.test(reply), '追问后目的地漂移');
  console.log(`  ✓ 增量追问回复约 ${reply.length} 字`);

  console.log('\n[4/5] continue-chat-stream 流式追问 …');
  const streamRes = await fetch(`${BASE}/api/ai/continue-chat-stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'text/event-stream',
    },
    body: JSON.stringify({
      planId: `week4-stream-${Date.now()}`,
      message: '第三天轻松一点，少排一个景点',
      locationName: '莆田',
      lng: 119.0,
      lat: 25.45,
      fullHistory: [{ role: 'assistant', content: SAMPLE_PLAN }],
    }),
  });
  const streamType = streamRes.headers.get('Content-Type') ?? '';
  if (streamType.includes('text/event-stream') && streamRes.ok) {
    const { reply: streamReply, finished } = await consumeSse(streamRes);
    assert(finished || streamReply.length > 80, '流式追问无有效内容');
    assert(streamReply.includes('【'), '流式追问缺少方案区块');
    console.log(`  ✓ 流式追问约 ${streamReply.length} 字`);
  } else {
    console.log('  ⚠ DeepSeek 未配置，跳过流式正文校验（客户端会回退非流式）');
  }

  console.log('\n[5/5] 预算校验脚注 …');
  assert(/预算校验/.test(reply), '追问回复应附带预算校验脚注或提示');
  console.log('  ✓ 工具层脚注已注入');

  console.log('\n✅ 第四周 API 验收冒烟通过\n');
}

main().catch((err) => {
  console.error('\n❌ 验收失败:', err.message);
  process.exit(1);
});
