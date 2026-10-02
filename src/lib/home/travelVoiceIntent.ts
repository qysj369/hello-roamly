import { holoHotCitiesAll } from '@/data/holoDreamDestinations';
import { sanitizePosterOverlayText } from '@/lib/home/searchPlanShareChannels';

export type TravelVoiceExportKind = 'xhs' | 'douyin' | 'wechat';

export type TravelVoiceIntent = 'reject' | 'travel' | `export-${TravelVoiceExportKind}`;

export const TRAVEL_VOICE_REFUSAL =
  '我是蜗牛旅行专属语音助手，仅能解答旅行出游相关问题，你可以告诉我想去的城市、出行人数，我为你整理游玩灵感';

export const TRAVEL_VOICE_NEED_PLAN = '先告诉我想去的城市，生成行程后再导出素材。';

export const TRAVEL_VOICE_FOLLOWUP = '还想改天数、同行，或让我生成小红书图文，直接说就行。';

export const TRAVEL_VOICE_EDIT_ACK = '正在按你说的改行程，图文和抖音素材会一起刷新。';

const EXPORT_XHS = /小红书|种草图文|三张海报/;
const EXPORT_DOUYIN = /抖音|短视频素材|竖版素材/;
const EXPORT_WECHAT = /微信海报|朋友圈|方形海报|方图/;
const EXPORT_VERB = /生成|导出|做[一份张]|出[一份张]|发到/;

const OFF_TOPIC =
  /股市|股票|基金|证券|写作业|作业答案|笑话|段子|星座运势|算命|编程|写代码|政治新闻|总统|点外卖|减肥食谱|恋爱烦恼|相亲/;

const TRAVEL_TOPIC =
  /旅游|旅行|出游|出行|行程|攻略|景点|玩几天|玩\d+天|\d+\s*天|[一二三四五六七八九十两]天|漫游|慢游|慢行|周末|亲子|情侣|单人|结伴|交通|地铁|高铁|动车|飞机|美食|馆子|小吃|探店|避坑|酒店|住宿|民宿|博物馆|古镇|老街|街巷|老店|路线|天数|改成|改行程|改天数|素材|海报|去哪|出发|怎么玩|怎么走|玩法|风格|灵感|种草|短途|近郊|city\s*walk|不设预算|人均|下雨|雨天|避雨|人多|节假日|发给朋友|分享行程|少走路|室内|分流/;

function mentionsHotCity(text: string): boolean {
  return holoHotCitiesAll.some((city) => city.length >= 2 && text.includes(city));
}

export function sanitizeTravelVoiceSpeech(text: string): string {
  return sanitizePosterOverlayText(text)
    .replace(/(?:人均)?\s*\d{2,5}\s*(?:[-—~～至到]\s*\d{2,5})?\s*元/g, '')
    .replace(/预算[^\n。]{0,16}/g, '')
    .replace(/https?:\/\/\S+/gi, '')
    .replace(/helloroamly\.com/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** 口语回复：碎片灵感 + 出行追问，不接闲聊。拒答固定句不走这里。 */
export function buildTravelVoiceReply(body: string): string {
  const clean = sanitizeTravelVoiceSpeech(body);
  if (!clean) return TRAVEL_VOICE_FOLLOWUP;
  if (clean.includes(TRAVEL_VOICE_FOLLOWUP)) return clean;
  return `${clean} ${TRAVEL_VOICE_FOLLOWUP}`.trim();
}

export function travelVoiceExportAck(kind: TravelVoiceExportKind): string {
  if (kind === 'xhs') {
    return buildTravelVoiceReply('正在生成小红书三张竖图，配图跟着当前点位走。');
  }
  if (kind === 'douyin') {
    return buildTravelVoiceReply('正在导出抖音竖版素材，画面只留一个游玩碎片。');
  }
  return buildTravelVoiceReply('正在导出一张方图，方便发给朋友。');
}

/** 识别完成后的意图分类；不改讯飞 / TTS 底层。 */
export function classifyTravelVoiceIntent(raw: string): TravelVoiceIntent {
  const text = raw.trim();
  if (!text) return 'reject';
  if (EXPORT_XHS.test(text) && (EXPORT_VERB.test(text) || /图文|海报|素材/.test(text))) {
    return 'export-xhs';
  }
  if (EXPORT_DOUYIN.test(text) && (EXPORT_VERB.test(text) || /口播|字幕|素材/.test(text))) {
    return 'export-douyin';
  }
  if (EXPORT_WECHAT.test(text) && (EXPORT_VERB.test(text) || /海报|文案/.test(text))) {
    return 'export-wechat';
  }
  if (OFF_TOPIC.test(text)) return 'reject';
  if (TRAVEL_TOPIC.test(text) || mentionsHotCity(text)) return 'travel';
  return 'reject';
}
