/**
 * 第五周验收：顾问语音输入与方案朗读 + 语音 API 预热/转写路由
 */
const BASE = process.env.ACCEPTANCE_BASE_URL ?? 'http://127.0.0.1:5173';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function main() {
  console.log(`验收基址: ${BASE}`);
  const ping = await fetch(BASE);
  assert(ping.ok, `首页不可达 HTTP ${ping.status}`);

  console.log('\n[1/4] 语音相关源码存在 …');
  const { readFileSync, existsSync } = await import('node:fs');
  const { fileURLToPath } = await import('node:url');
  const { dirname, join } = await import('node:path');
  const projectRoot = join(dirname(fileURLToPath(import.meta.url)), '..');

  const voiceFiles = [
    'src/hooks/ai/useAdvisorSpeechInput.ts',
    'src/lib/browser/advisorLocalSpeech.ts',
    'src/lib/browser/advisorEdgeSpeech.ts',
    'src/lib/speech/advisorSpeechHallucinations.ts',
    'src/lib/browser/planVoiceNarration.ts',
    'src/components/features/ai/AIChatMessageInput.tsx',
    'src/components/features/map/PlanResultView.tsx',
    'server/api/ai/speech-warmup.ts',
  ];
  for (const rel of voiceFiles) {
    const full = join(projectRoot, rel);
    assert(existsSync(full), `缺少文件 ${rel}`);
    const text = readFileSync(full, 'utf8');
    if (rel.includes('useAdvisorSpeechInput')) {
      assert(/beginHold|endHold|transcribePcmSamples/.test(text), '语音 hook 未接入按住说话');
    }
    if (rel.includes('AIChatMessageInput')) {
      assert(/按住麦克风说话|onPointerDown/.test(text), '输入框未改为按住说话');
      assert(/useAdvisorSpeechInput/.test(text), '顾问输入框未挂载语音 hook');
      assert(/Mic/.test(text), '顾问输入框缺少麦克风按钮');
    }
    if (rel.includes('advisorLocalSpeech')) {
      assert(/speechWarmup|speech-warmup/.test(text), '语音应走服务端预热 API');
    }
    if (rel.includes('PlanResultView')) {
      assert(/speakPlanVoiceNarration|Volume2/.test(text), '方案弹窗缺少朗读按钮');
    }
    if (rel.includes('planVoiceNarration')) {
      assert(/buildPlanResultSpeakText/.test(text), '缺少方案朗读摘要构建');
    }
  }
  console.log('  ✓ 语音输入/朗读模块已接入');

  console.log('\n[2/4] 顾问页 HTML 可达 …');
  const aiPage = await fetch(`${BASE}/ai`);
  assert(aiPage.ok, `/ai HTTP ${aiPage.status}`);
  const html = await aiPage.text();
  assert(html.includes('id="root"') || html.length > 200, '顾问页 HTML 异常');
  console.log('  ✓ 顾问页可打开');

  console.log('\n[3/4] speech-warmup 端点 …');
  const warmup = await fetch(`${BASE}/api/ai/speech-warmup`);
  assert(warmup.ok, `speech-warmup HTTP ${warmup.status}`);
  const warmupBody = await warmup.json();
  assert(warmupBody.ready === true, 'speech-warmup 未返回 ready');
  console.log('  ✓ 语音模型预热成功');

  console.log('\n[4/4] speech-transcribe 路由与参数校验 …');
  const streamProbe = await fetch(`${BASE}/api/ai/chat-stream`, { method: 'GET' });
  assert(streamProbe.status === 405 || streamProbe.status === 404, 'chat-stream 路由异常');

  const tooShort = await fetch(`${BASE}/api/ai/speech-transcribe`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/octet-stream',
      'X-Audio-Sample-Rate': '16000',
    },
    body: new Uint8Array(16),
  });
  assert(tooShort.status === 400, '过短录音应返回 400');
  const tooShortBody = await tooShort.json();
  assert(tooShortBody.code === 'too_short', '过短录音应返回 too_short');
  console.log('  ✓ 语音转写 API 路由正常');

  console.log('\n✅ 第五周验收冒烟通过\n');
  console.log('目视清单：');
  console.log('  · /ai 麦克风：按住说话 2 秒以上，松开后文字填入（Edge 优先原生识别）');
  console.log('  · Chrome：服务端 Whisper 识别，打开 /ai 后模型应已预热');
  console.log('  · 方案弹窗底部「朗读」→ 浏览器 TTS 播报摘要');
}

main().catch((err) => {
  console.error('\n❌ 验收失败:', err.message);
  process.exit(1);
});
