import { getTravelSpeechHotwordCount } from '@/lib/speech/travelSpeechHotwords';

export type SpeechAsrProvider = 'local-whisper' | 'iflytek' | 'volcengine';



export type VoiceDialogMode = 'iflytek-stream' | 'unavailable';



export type SpeechAsrStatus = {

  provider: SpeechAsrProvider;

  cloudReady: boolean;

  voiceDialogReady: boolean;

  voiceDialogMode: VoiceDialogMode;

  streamPath: string;

  setupUrl: string;

  hint: string;

  travelHotwordCount: number;

};



const IFLYTEK_SETUP_URL = 'https://console.xfyun.cn/';

const SPEECH_STREAM_PATH = '/api/ai/speech-stream';



function hasIflytekKeys(): boolean {

  return Boolean(

    process.env.IFLYTEK_APP_ID?.trim() &&

      process.env.IFLYTEK_API_KEY?.trim() &&

      process.env.IFLYTEK_API_SECRET?.trim(),

  );

}



function hasVolcKeys(): boolean {

  return Boolean(

    process.env.VOLC_SPEECH_APP_ID?.trim() && process.env.VOLC_SPEECH_ACCESS_TOKEN?.trim(),

  );

}



export function resolveSpeechAsrProvider(): SpeechAsrProvider {

  const preferred = process.env.SPEECH_ASR_PROVIDER?.trim().toLowerCase();

  if (preferred === 'local-whisper') {

    return 'local-whisper';

  }

  if (preferred === 'iflytek' && hasIflytekKeys()) {

    return 'iflytek';

  }

  if (preferred === 'volcengine' && hasVolcKeys()) {

    return 'volcengine';

  }

  if (hasIflytekKeys()) {

    return 'iflytek';

  }

  if (hasVolcKeys()) {

    return 'volcengine';

  }

  return 'local-whisper';

}



export function getSpeechAsrStatus(): SpeechAsrStatus {

  const provider = resolveSpeechAsrProvider();

  const cloudReady = provider !== 'local-whisper';

  const iflytekReady = hasIflytekKeys();

  /** 有讯飞 Key 走流式；否则走本机 Whisper 录音（需点「说完了」） */
  const voiceDialogReady = iflytekReady || provider === 'local-whisper';

  let hint = '语音对话：Microsoft Edge 大声说话，停顿约 2 秒自动发送';

  if (iflytekReady) {

    hint = '语音对话：讯飞流式识别，大声说话停顿约 2 秒自动发送';

  } else if (provider === 'local-whisper') {

    hint = '语音对话：点麦克风后大声说话，说完点「说完了」再规划';

  } else if (!iflytekReady) {

    hint =

      '语音对话未启用：请在 .env.local 配置讯飞 IFLYTEK_* Key（免费额度），重启开发服后点波形即可';

  } else if (provider === 'volcengine') {

    hint = '已配置火山引擎 Key；语音对话当前走讯飞流式通道';

  }



  return {

    provider,

    cloudReady,

    voiceDialogReady,

    /** 仅真实有讯飞凭证时才宣称流式；避免前端空连 /speech-stream 再落到卡死的 Edge 听写 */
    voiceDialogMode: iflytekReady ? 'iflytek-stream' : 'unavailable',

    streamPath: SPEECH_STREAM_PATH,

    setupUrl: IFLYTEK_SETUP_URL,

    hint,

    travelHotwordCount: getTravelSpeechHotwordCount(),

  };

}


