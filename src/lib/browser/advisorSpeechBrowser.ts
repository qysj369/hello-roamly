export function isChromeBrowser(): boolean {

  if (typeof navigator === 'undefined') {

    return false;

  }

  return /Chrome\//.test(navigator.userAgent) && !/Edg\//.test(navigator.userAgent);

}



export function isEdgeBrowser(): boolean {

  if (typeof navigator === 'undefined') {

    return false;

  }

  return /Edg\//.test(navigator.userAgent);

}



export function advisorSpeechBrowserHint(): string {

  return '点绿色波形开语音对话（说完停顿自动发送），或按住麦克风/打字';

}



export function advisorSpeechFailureHint(): string {

  return '没听清：请靠近麦克风、减少环境噪音，或直接打字输入';

}



/** Cursor / VS Code 内嵌预览会静默拒绝麦克风，语音功能无法在内置浏览器里使用 */
export function isEmbeddedMicBlockedContext(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return false;
  }

  try {
    if (window.self !== window.top) {
      return true;
    }
  } catch {
    return true;
  }

  const ua = navigator.userAgent;
  if (/Electron/i.test(ua) || /Cursor/i.test(ua)) {
    return true;
  }

  return window.location.protocol === 'vscode-webview:';
}

export function embeddedMicBlockedHint(): string {
  return '语音需用系统 Edge 或 Chrome 打开 http://127.0.0.1:5173/（Cursor 内置浏览器不支持麦克风，请点键盘图标打字）';
}

/** 语音对话：需麦克风 + 云端讯飞（不依赖浏览器内置语音 API） */

export function isVoiceDialogBrowserSupported(): boolean {

  if (typeof navigator === 'undefined') {

    return false;

  }

  if (isEmbeddedMicBlockedContext()) {
    return false;
  }

  return Boolean(navigator.mediaDevices?.getUserMedia);

}



export function advisorVoiceDialogNetworkHint(): string {

  return '语音服务连接失败：请检查网络与讯飞 Key 配置，或改用按住麦克风/打字';

}



export function formatMicrophoneStartError(error: unknown): string {

  const detail = error instanceof Error ? error.message : '';

  if (/permission|denied|not allowed|permissions policy/i.test(detail)) {

    if (isEmbeddedMicBlockedContext()) {
      return embeddedMicBlockedHint();
    }

    return '请允许麦克风权限（地址栏锁图标 → 麦克风 → 允许）';

  }

  if (/notfound|devicesnotfound|no device/i.test(detail)) {

    return '未检测到麦克风：请检查耳机/麦克风是否插好，或系统是否静音';

  }

  if (/notreadable|could not start|trackstart/i.test(detail)) {

    return '麦克风被占用：请关闭其他正在用麦克风的软件后重试';

  }

  if (/语音服务连接|语音连接已断开/i.test(detail)) {

    return `${detail}：请确认开发服在运行，或刷新后重试`;

  }

  if (/讯飞|IFLYTEK|语音对话需配置/i.test(detail)) {

    return detail;

  }

  if (detail.trim()) {

    return `无法启动麦克风（${detail}）：请检查权限与设备，或改用文字输入`;

  }

  return '无法启动麦克风：请检查权限与设备，或改用文字输入';

}


