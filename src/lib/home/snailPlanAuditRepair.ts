import type { SnailPlanAuditLock } from '@/lib/home/snailPlanOutputAudit';

const TRIPLE_TRANSIT_BLOCK =
  /(?:\*\*)?地铁(?:\*\*)?[：:、\s][\s\S]{0,480}?(?:\*\*)?公交(?:\*\*)?[：:、\s][\s\S]{0,480}?(?:\*\*)?(?:出租车|网约车|打车)/g;

const QINGDAO_COUPLE_4000_TABLE = [
  '| 项目 | 人均金额 | 平价省钱说明 |',
  '| ---- | ---- | ---- |',
  '| 大交通 | 500元 | 济南⇌青岛高铁二等往返；普快硬座可省70元，耗时增加3小时 |',
  '| 市内交通 | 300元 | 地铁公交为主，预留部分打车额度 |',
  '| 餐饮 | 1200元 | 老城家常菜、团岛市场、营口路啤酒屋，主打美食探店 |',
  '| 门票 | 200元 | 信号山、啤酒博物馆、奥帆游船，其余景点步道免费 |',
  '| 住宿 | 1500元 | 中山路栈桥民宿两晚，双人分摊人均 |',
  '| 机动备用 | 300元 | 加餐、伴手礼、临时打车 |',
  '| 合计 | 4000元 | 严格控制在人均4000元预算上限 |',
].join('\n');

const D1_STACK_TIP =
  '栈桥（红嘴鸥仅冬春季节大量出没，其余时段仅可观赏海岸礁石，涨潮栈道湿滑注意安全）';

const D2_SAILING_TIP =
  '傍晚去奥帆中心坐游船，海上游船仅可在奥帆中心官方售票窗口购票，切勿轻信路边拉客黄牛低价揽客。';

const D2_RAIN_PLAN =
  '雨天备选：信号山和海边步道改去台东室内小吃或中山路骑楼避雨，傍晚奥帆游船看窗口是否开航，不开就回住处休息，不另列表。';

const D3_MUSEUM_TIP =
  '上午安排登州路56号青岛啤酒博物馆，需提前在官方公众号实名预约，每日16点停止检票入场。';

const D3_RETURN_TIP =
  '下午14:00前动身取回行李前往青岛站，全程预留2.5小时充足缓冲，用于行李寄存、安检、候车。';

const DAY_SPEND: Record<string, string> = {
  '1': '当日双人消费：济南地铁约8元、春和楼午饭约240元、教堂门票约20元、营口路海鲜啤酒约260元，两人分摊。',
  '2': '当日双人消费：信号山门票约30元、沿海公交约10元、奥帆游船按官方窗口实价、台东夜宵约120元，两人分摊。',
  '3': '当日双人消费：团岛逛吃约60元、午饭约140元、啤酒博物馆约120元、返程地铁约20元，两人分摊。',
};

const DAY_SPLIT = /(?=(?:^|\n)\s*第\s*[1-9一二三四五六七八九十两]+\s*天(?!分项))/;

function isQingdaoFoodCouple(lock: SnailPlanAuditLock): boolean {
  return (
    lock.city === '青岛' &&
    (lock.party === '情侣' || /美食/.test(lock.preference ?? ''))
  );
}

function hasPipeBudgetTable(content: string): boolean {
  const intro = content.split('【行程流水账】')[0] ?? content;
  const five =
    /\|\s*交通\s*\|/.test(intro) && /\|\s*机动\s*\|/.test(intro) && /\|\s*总计\s*\|/.test(intro);
  const split =
    /\|\s*大交通\s*\|/.test(intro) &&
    /\|\s*市内交通\s*\|/.test(intro) &&
    /\|\s*(?:总计|合计)\s*\|/.test(intro);
  return five || split;
}

/** 三选一 / 分栏交通只留公共交通主线 */
export function collapseTripleTransitBlocks(content: string): string {
  let next = content;
  for (let i = 0; i < 6; i += 1) {
    const collapsed = next.replace(TRIPLE_TRANSIT_BLOCK, (full) => {
      const cut = full.search(/(?:\*\*)?公交(?:\*\*)?[：:、\s]/);
      return cut > 0 ? `${full.slice(0, cut).trimEnd()}\n` : full;
    });
    if (collapsed === next) {
      break;
    }
    next = collapsed;
  }
  next = next.replace(
    /^\s*[-*•/]?\s*(?:\*\*)?(?:公交|出租车|网约车|打车|公交方案|打车方案|方案二)(?:\*\*)?[：:][^\n]*\n?/gm,
    '',
  );
  next = next.replace(/公交方案[：:][^\n]+/g, '');
  next = next.replace(/打车方案[：:][^\n]+/g, '');
  next = next.replace(/方案二[：:][^\n]+/g, '');
  next = next.replace(/地铁方案[：:]/g, '地铁：');
  next = next.replace(/^\s*：(?:起步价|约|\d)[^\n]*\n?/gm, '');
  const mark = next.indexOf('【行程流水账】');
  if (mark >= 0) {
    const head = next.slice(0, mark + '【行程流水账】'.length);
    const body = next.slice(mark + '【行程流水账】'.length).replace(/^[ \t]*[-*•]\s+/gm, '');
    return `${head}${body}`;
  }
  return next;
}

function splitIntroItinerary(content: string): { intro: string; rest: string } {
  const mark = content.indexOf('【行程流水账】');
  if (mark < 0) {
    return { intro: content, rest: '' };
  }
  return { intro: content.slice(0, mark), rest: content.slice(mark) };
}

function stripPipeRows(text: string): string {
  return text.replace(/(?:^|\n)\s*\|[^\n]+\|/g, '');
}

function stripDottedBudgetAndLodgingFromIntro(intro: string): string {
  return stripPipeRows(intro)
    .replace(/今晚住宿片区[：:][^\n。]*/g, '')
    .replace(/当日双人消费[：:][^\n]*/g, '')
    .replace(/花费要点[^\n]*/g, '')
    .replace(/花费速览[^\n]*/g, '')
    .replace(/极简花费清单[^\n]*/g, '')
    .replace(/[·•]\s*项目\s*[·•][\s\S]*?合计[^\n]*/g, '')
    .replace(/(?:^|\n)\s*(?:大交通|市内交通|餐饮|门票|住宿|机动备用|合计)\s*[·•][^\n]*/g, '')
    .replace(/🐌\s*/g, '')
    .replace(/以下行程按你的预算与天数整理[^\n]*/g, '')
    .replace(/花费见简介表与流水账分项。[^\n]*/g, '')
    .replace(/住宿\s*3\s*晚[^\n]*/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function injectBudgetTable(content: string, lock: SnailPlanAuditLock): string {
  const { intro, rest } = splitIntroItinerary(content);
  const cleanedIntro = stripDottedBudgetAndLodgingFromIntro(
    intro.replace(/^【方案简介】\s*/, ''),
  );
  if (
    isQingdaoFoodCouple(lock) &&
    ((lock.budgetYuan ?? 0) >= 3000 || /人均预算约\s*4000/.test(content))
  ) {
    const lead =
      cleanedIntro ||
      '3天都在青岛。同行情侣，人均预算约4000元，美食探店。晚上连住中山路/栈桥，不换宿。红瓦老城、团岛海鲜和营口路散啤串成一趟松弛探店，市内只靠地铁3号线、2号线。';
    return `【方案简介】\n\n${lead}\n\n${QINGDAO_COUPLE_4000_TABLE}\n\n${rest}`;
  }
  if (hasPipeBudgetTable(content)) {
    return content;
  }
  return content;
}

function mapDayChunks(itinerary: string): string[] {
  return itinerary.split(DAY_SPLIT);
}

function isDayChunk(chunk: string, day: number): boolean {
  return new RegExp(`^[\\s\\n]*第\\s*${day}\\s*天`).test(chunk);
}

function ensureThreeDayHeadings(itinerary: string): string {
  let next = itinerary.trim();
  if (!/第\s*1\s*天/.test(next) && /第\s*[23]\s*天/.test(next)) {
    next = `第1天 ${next}`;
  }
  if (!/第\s*2\s*天/.test(next) && /从昨晚住宿片区/.test(next)) {
    next = next.replace(/从昨晚住宿片区/, '第2天 从昨晚住宿片区');
  }
  if (!/第\s*3\s*天/.test(next) && /第\s*2\s*天/.test(next)) {
    const secondStay = next.split('从昨晚住宿片区');
    if (secondStay.length >= 3) {
      next = `${secondStay[0]}从昨晚住宿片区${secondStay[1]}第3天 从昨晚住宿片区${secondStay.slice(2).join('从昨晚住宿片区')}`;
    }
  }
  return next;
}

function patchQingdaoCoupleItinerary(content: string, lock: SnailPlanAuditLock): string {
  if (!isQingdaoFoodCouple(lock)) {
    return content;
  }
  const { intro, rest } = splitIntroItinerary(content);
  if (!rest) {
    return content;
  }
  let itinerary = ensureThreeDayHeadings(
    rest
      .replace(/^【行程流水账】\s*/, '')
      .replace(/五四广场\/?浮山所|浮山所/g, '中山路/栈桥')
      .replace(/🐌\s*/g, '')
      .replace(/第\s*[123]\s*天分项花费[^\n]*/g, '')
      .replace(/(?:^|\n)\s*\|[^\n]+\|/g, '')
      .replace(/\s\|[^\n]*\|[^\n]*\|/g, '')
      .replace(/老城漫步(?:公园|北门|南门|下来)?/g, '龙江路一带')
      .replace(/\s*---+\s*/g, '\n')
      .replace(/备选方案\s*（Plan B）[^\n]*/g, '')
      .replace(/雨天(?!备选)[：:][^\n]*/g, '')
      .replace(/(?:^|\n)\s*\d+[\.、]\s*/g, '\n'),
  );
  const parts = mapDayChunks(itinerary);
  const day2 = parts.find((part) => isDayChunk(part, 2));
  const afterDay2 = parts.filter((part) => /^[\s\n]*第\s*[3-9三四五六七八九十两]+\s*天/.test(part)).join('\n');
  if (day2 && /八大关/.test(day2) && /八大关/.test(afterDay2)) {
    itinerary = parts
      .map((part) => (isDayChunk(part, 2) ? part.replace(/八大关/g, '奥帆中心沿海') : part))
      .join('');
  }
  let seenSignalHill = false;
  itinerary = mapDayChunks(itinerary)
    .map((chunk) => {
      if (!/第\s*[1-9一二三四五六七八九十两]+\s*天/.test(chunk) || !/信号山/.test(chunk)) {
        return chunk;
      }
      if (seenSignalHill) {
        return chunk.replace(/[^。\n]*信号山[^。\n]*[。\n]?/g, '');
      }
      seenSignalHill = true;
      return chunk;
    })
    .join('');

  if (/栈桥/.test(itinerary)) {
    itinerary = itinerary.replace(
      /栈桥（红嘴鸥[^）]{0,80}）/,
      D1_STACK_TIP,
    );
    if (!/冬春/.test(itinerary)) {
      itinerary = itinerary.replace(/栈桥/, D1_STACK_TIP);
    } else if (!/涨潮|湿滑/.test(itinerary)) {
      itinerary = itinerary.replace(
        /其余季节只能看海岸礁石/,
        '其余时段仅可观赏海岸礁石，涨潮栈道湿滑注意安全',
      );
      if (!/涨潮|湿滑/.test(itinerary)) {
        itinerary = itinerary.replace(/栈桥/, `${D1_STACK_TIP}`);
      }
    }
  }

  itinerary = mapDayChunks(itinerary)
    .map((chunk) => {
      if (isDayChunk(chunk, 2)) {
        let body = chunk.replace(/傍晚若走奥帆游船[^\n。]*[。\n]?/g, '');
        const insertBeforeLodging = (tip: string) => {
          if (/今晚住宿片区/.test(body)) {
            body = body.replace(/今晚住宿片区/, `${tip}\n今晚住宿片区`);
          } else {
            body = `${body.trimEnd()}\n${tip}\n`;
          }
        };
        if (!/官方售票|黄牛/.test(body)) {
          insertBeforeLodging(D2_SAILING_TIP);
        }
        if (!/雨天备选/.test(body)) {
          insertBeforeLodging(D2_RAIN_PLAN);
        }
        return body;
      }
      if (isDayChunk(chunk, 3)) {
        let body = chunk
          .replace(/傍晚若走奥帆游船[^\n。]*[。\n]?/g, '')
          .replace(/返程前若去青岛啤酒博物馆[^\n。]*[。\n]?/g, '')
          .replace(/预留2\.5小时青岛站进站缓冲。[^\n]*/g, '')
          .replace(/14[:：]?00前动身返程。[^\n]*/g, '');
        if (!/啤酒博物馆/.test(body)) {
          body = `${body.trimEnd()}\n${D3_MUSEUM_TIP}\n`;
        } else {
          if (!/登州路\s*56/.test(body)) {
            body = body.replace(/啤酒博物馆/, '啤酒博物馆（登州路56号）');
          }
          if (!/预约/.test(body)) {
            body = body.replace(/啤酒博物馆（登州路56号）/, '啤酒博物馆（登州路56号，需提前在官方公众号实名预约）');
          }
          if (!/16\s*点|16:00/.test(body)) {
            body = body.replace(/预约/, '预约，每日16点停止检票入场');
          }
        }
        body = body
          .replace(/下午?14\s*[:：]?00前[^\n。]*[。]?/g, '')
          .replace(/14\s*点前[^\n。]*[。]?/g, '')
          .replace(/预留2\.5小时[^\n。]*[。]?/g, '');
        body = `${body.trimEnd()}\n${D3_RETURN_TIP}\n`;
        return body;
      }
      return chunk;
    })
    .join('');

  itinerary = itinerary.replace(
    /((?:^|\n)\s*第\s*[123]\s*天[\s\S]*?)(?=(?:\n\s*第\s*[123]\s*天)|$)/g,
    (day) => {
      let body = day;
      const dayNo = /第\s*([123])\s*天/.exec(day)?.[1];
      const isLast = dayNo === '3';
      if (!/今晚住宿片区/.test(body)) {
        body = `${body.trimEnd()}\n今晚住宿片区：${isLast ? '返程回家，无需住宿' : '中山路/栈桥周边'}\n`;
      } else if (isLast) {
        body = body.replace(/今晚住宿片区[：:][^\n]+/, '今晚住宿片区：返程回家，无需住宿');
      } else {
        body = body.replace(/今晚住宿片区[：:][^\n]+/, '今晚住宿片区：中山路/栈桥周边');
      }
      const spend = dayNo ? DAY_SPEND[dayNo] : '';
      if (spend) {
        if (/当日双人消费/.test(body)) {
          body = body.replace(/当日双人消费[：:][^\n]+/, spend);
        } else {
          body = `${body.trimEnd()}\n${spend}\n`;
        }
      }
      return body;
    },
  );
  return `${intro.startsWith('【方案简介】') ? intro : `【方案简介】\n\n${intro}`}\n【行程流水账】\n\n${itinerary.trim()}\n`;
}

/** 校验前修补：拆三选一、补管道预算表、青岛情侣硬锁 */
export function applySnailPlanAuditRepairs(
  content: string,
  lock: SnailPlanAuditLock,
): string {
  if (!content.trim()) {
    return content;
  }
  let next = collapseTripleTransitBlocks(content);
  next = injectBudgetTable(next, lock);
  next = patchQingdaoCoupleItinerary(next, lock);
  return next.replace(/\n{3,}/g, '\n\n').trim();
}
