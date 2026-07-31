/**
 * 第七周验收：顾问回复 TTS 朗读（语音对话模式下边出字边播）
 */
const BASE = process.env.ACCEPTANCE_BASE_URL ?? 'http://127.0.0.1:5173';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function main() {
  console.log(`验收基址: ${BASE}`);
  const ping = await fetch(BASE);
  assert(ping.ok, `首页不可达 HTTP ${ping.status}`);

  console.log('\n[1/3] TTS 相关源码 …');
  const { readFileSync, existsSync } = await import('node:fs');
  const { fileURLToPath } = await import('node:url');
  const { dirname, join } = await import('node:path');
  const projectRoot = join(dirname(fileURLToPath(import.meta.url)), '..');

  const files = [
    'src/hooks/ai/useAdvisorReplySpeech.ts',
    'src/lib/browser/advisorVoiceNarration.ts',
    'src/lib/browser/browserSpeechQueue.ts',
    'src/components/features/ai/AIChatMessageInput.tsx',
  ];

  for (const rel of files) {
    const full = join(projectRoot, rel);
    assert(existsSync(full), `缺少文件 ${rel}`);
  }

  const hook = readFileSync(join(projectRoot, 'src/hooks/ai/useAdvisorReplySpeech.ts'), 'utf8');
  assert(/enqueueAdvisorReplySpeech/.test(hook), 'useAdvisorReplySpeech 未接入 TTS 队列');
  assert(/splitAdvisorReplySpeechDelta/.test(hook), '未实现流式 TTS 切分');

  const input = readFileSync(
    join(projectRoot, 'src/components/features/ai/AIChatMessageInput.tsx'),
    'utf8',
  );
  assert(/useAdvisorReplySpeech/.test(input), '顾问输入框未挂载 TTS hook');
  assert(/voiceDialog\.active/.test(input), 'TTS 未绑定语音对话模式');
  assert(/顾问正在朗读/.test(input), '缺少 TTS 状态提示');

  const voiceHook = readFileSync(join(projectRoot, 'src/hooks/ai/useAdvisorVoiceDialog.ts'), 'utf8');
  assert(/primeAdvisorReplySpeech/.test(voiceHook), '开启语音对话时未预热 TTS');

  console.log('\n[2/3] 顾问流式 API …');
  const chatRes = await fetch(`${BASE}/api/ai/chat-stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [{ role: 'user', content: '济南去西安三天预算一千五，一句话回复' }],
      userId: 'week7-smoke',
    }),
  });
  assert(chatRes.ok, `chat-stream HTTP ${chatRes.status}`);
  const reader = chatRes.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let gotDelta = false;
  const start = Date.now();
  while (Date.now() - start < 60_000) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    if (buffer.includes('event: delta') || buffer.includes('"delta"')) {
      gotDelta = true;
      break;
    }
    if (buffer.includes('event: error')) {
      throw new Error('chat-stream 返回 error');
    }
  }
  await reader.cancel();
  assert(gotDelta, 'chat-stream 未收到流式回复');

  console.log('\n[3/3] 第七周验收通过');
  console.log('目视：Edge 开语音对话 → 提问 → 顾问回复时应朗读');
}

main().catch((error) => {
  console.error('\n第七周验收失败:', error.message);
  process.exit(1);
});
