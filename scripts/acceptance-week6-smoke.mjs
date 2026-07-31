/**

 * 第六周验收：顾问语音对话（讯飞流式 ASR，说完自动发送）

 */

const BASE = process.env.ACCEPTANCE_BASE_URL ?? 'http://127.0.0.1:5173';



function assert(condition, message) {

  if (!condition) throw new Error(message);

}



async function main() {

  console.log(`验收基址: ${BASE}`);

  const ping = await fetch(BASE);

  assert(ping.ok, `首页不可达 HTTP ${ping.status}`);



  console.log('\n[1/4] 语音对话相关源码 …');

  const { readFileSync, existsSync } = await import('node:fs');

  const { fileURLToPath } = await import('node:url');

  const { dirname, join } = await import('node:path');

  const projectRoot = join(dirname(fileURLToPath(import.meta.url)), '..');



  const files = [

    'src/hooks/ai/useAdvisorVoiceDialog.ts',

    'src/lib/browser/advisorStreamVoiceDialog.ts',

    'server/lib/iflytekIat.ts',

    'server/api/ai/speech-stream-handler.ts',

    'src/components/features/ai/AIChatMessageInput.tsx',

  ];

  for (const rel of files) {

    const full = join(projectRoot, rel);

    assert(existsSync(full), `缺少文件 ${rel}`);

    const text = readFileSync(full, 'utf8');

    if (rel.includes('useAdvisorVoiceDialog')) {

      assert(/AdvisorStreamVoiceDialogSession/.test(text), '语音对话 hook 未接入讯飞流式');

      assert(/onSend/.test(text), '语音对话应自动发送');

      assert(/requiresManualFinish:\s*false/.test(text), '语音对话应为自动断句发送');

    }

    if (rel.includes('advisorStreamVoiceDialog')) {

      assert(/onUtterance|speech-stream/.test(text), '流式语音对话缺少识别发送');

      assert(/停顿/.test(text), '流式语音对话缺少自动发送提示');

    }

    if (rel.includes('iflytekIat')) {

      assert(/IflytekIatStreamSession/.test(text), '缺少讯飞流式会话');

      assert(/vad_eos/.test(text), '缺少静音断句参数');

    }

    if (rel.includes('AIChatMessageInput')) {

      assert(/useAdvisorVoiceDialog/.test(text), '输入框未挂载语音对话');

      assert(/AudioLines/.test(text), '输入框缺少语音对话按钮');

    }

  }

  console.log('  ✓ 讯飞流式语音对话模块已接入');



  console.log('\n[2/4] 顾问页 HTML 可达 …');

  const aiPage = await fetch(`${BASE}/ai`);

  assert(aiPage.ok, `/ai HTTP ${aiPage.status}`);

  console.log('  ✓ 顾问页可打开');



  console.log('\n[3/4] 语音 API …');

  const warmup = await fetch(`${BASE}/api/ai/speech-warmup`);

  assert(warmup.ok, `speech-warmup HTTP ${warmup.status}`);

  const config = await fetch(`${BASE}/api/ai/speech-config`);

  assert(config.ok, `speech-config HTTP ${config.status}`);

  const configBody = await config.json();

  assert(

    configBody.voiceDialogMode === 'iflytek-stream' || configBody.voiceDialogMode === 'unavailable',

    'speech-config 缺少 voiceDialogMode',

  );

  assert(configBody.streamPath === '/api/ai/speech-stream', 'speech-config 缺少 streamPath');

  console.log(`  ✓ 语音 API 正常（通道: ${configBody.provider}，对话: ${configBody.voiceDialogMode}）`);



  console.log('\n[4/4] 按住说话模块仍保留 …');

  const holdPath = join(projectRoot, 'src/hooks/ai/useAdvisorSpeechInput.ts');

  const holdText = readFileSync(holdPath, 'utf8');

  assert(/beginHold|endHold/.test(holdText), '第五周按住说话应保留');

  console.log('  ✓ 第五周按住说话仍可用');



  console.log('\n✅ 第六周验收冒烟通过\n');

  console.log('目视清单：');

  if (!configBody.voiceDialogReady) {

    console.log('  ⚠ 未配置讯飞 Key：在 .env.local 填入 IFLYTEK_APP_ID / KEY / SECRET 后重启开发服');

    console.log('  · 申请地址：https://console.xfyun.cn/ → 语音听写（流式版）');

  } else {

    console.log('  · /ai 点绿色波形 → 说「杭州三天预算一千五」→ 停顿约 1 秒自动发送');

    console.log('  · 识别过程中应出现「听到：…」实时预览');

    console.log('  · Chrome / Edge 均可；顾问回复期间暂停，回复完继续听');

    console.log('  · 再点波形关闭；打字仍可用');

  }

}



main().catch((err) => {

  console.error('\n❌ 验收失败:', err.message);

  process.exit(1);

});


