export type AdvisorSpeechConfig = {
  provider: 'local-whisper' | 'iflytek' | 'volcengine';
  cloudReady: boolean;
  voiceDialogReady: boolean;
  voiceDialogMode: 'iflytek-stream' | 'unavailable';
  streamPath: string;
  setupUrl: string;
  hint: string;
};

let cachedConfig: AdvisorSpeechConfig | null = null;

export async function fetchAdvisorSpeechConfig(): Promise<AdvisorSpeechConfig> {
  if (cachedConfig) {
    return cachedConfig;
  }

  const response = await fetch('/api/ai/speech-config');
  if (!response.ok) {
    throw new Error('无法获取语音配置');
  }

  cachedConfig = (await response.json()) as AdvisorSpeechConfig;
  return cachedConfig;
}

export function advisorSpeechSetupHint(config: AdvisorSpeechConfig): string {
  if (config.voiceDialogReady) {
    return config.hint;
  }
  return `语音对话需讯飞 Key：打开 ${config.setupUrl} 申请「语音听写流式版」，填入 .env.local 后重启开发服`;
}
