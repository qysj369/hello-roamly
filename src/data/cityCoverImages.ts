import { CITY_COORDINATES } from '@/data/cityCoordinates';
import { resolvePublicAssetUrl, resolveRemoteImageUrl } from '@/lib/cdn';

/**
 * 城市/地标 → 封面图源
 * - Unsplash 照片 ID（`photo-{id}`）
 * - `local:{filename}` → public/city-covers 本地图（更精准时优先）
 */
const CITY_COVER_SOURCES: Record<string, string> = {
  // —— 国内一线 & 热门 ——
  成都: '1625859043880-56acbcb6a6ac', // 大熊猫繁育研究基地
  西安: '1763622480507-4b9be29a172c', // 秦始皇兵马俑
  厦门: '1734333107761-960beae2f6ca', // 鼓浪屿俯瞰
  杭州: '1664275960895-9f5f61c19aec', // 西湖雷峰塔
  西湖: '1747798678108-ba9a8606d58b', // 西湖游船
  灵隐: '1676487419872-c7febf5e1e86', // 灵隐寺
  济南: '1605542959424-324d1d811a95', // 趵突泉公园
  北京: '1662791985431-f467dce3ca08', // 故宫博物院
  上海: '1697776518314-909d8ef8bca8', // 外滩与东方明珠
  重庆: '1676107982922-f942bab11de6', // 洪崖洞夜景
  大理: '1725378673587-571798fc52a5', // 洱海与苍山俯瞰
  长沙: '1682329329556-f6b688eb4a55', // 橘子洲青年毛泽东像
  青岛: '1682425706655-b913db83a52d', // 栈桥
  南京: '1674568191389-ab2e0380e094', // 秦淮河夫子庙
  扬州: '1728357338028-979dd64fa267', // 瘦西湖五亭桥
  莆田: '1754755623358-a9f8bf5b3617', // 湄洲岛妈祖像
  武汉: '1682082435544-3ed4c166cf55', // 黄鹤楼
  广州: '1746880866377-f237a2f7a31a', // 广州塔（小蛮腰）
  深圳: '1593007187880-0d2dee3c90e8', // 深圳 CBD 天际线
  桂林: '1659233306527-226a26a08634', // 漓江山水
  阳朔: '1771967141873-8b714205f4bd', // 阳朔漓江
  三亚: '1559827260-dc66d52bef19', // 亚龙湾海滨
  昆明: '1508804185872-d7badad00f7d', // 石林喀斯特
  丽江: '1677922069735-84366a41e996', // 丽江古城
  哈尔滨: '1773472501781-6b8e056b3e93', // 圣索菲亚教堂
  天津: '1686240311045-74f590f00f4c', // 天津之眼
  黄山: 'local:huangshan.jpg', // 黄山云海
  婺源: '1762970140438-af41c1079b28', // 婺源徽派古村
  景德镇: '1697439300754-5c12d40c1dee', // 景德镇陶瓷作坊
  张家界: '1769007462035-c25219f1920a', // 武陵源石柱峰林
  凤凰: 'local:fenghuang.jpg', // 凤凰古城沱江吊脚楼
  北海: '1771967141873-8b714205f4bd', // 北海银滩海滨
  乐山: '1694565166352-276ffb8e6a8e', // 乐山大佛
  九寨沟: '1763484207971-65aa61e1e99a', // 九寨沟五花海
  镇江: '1773534536899-a83c96a0ac0b', // 金山寺宝塔映湖
  溧阳: '1746586464205-fd75e688c2aa', // 天目湖山水
  泉州: 'local:quanzhou.jpg', // 开元寺镇国塔（东塔）
  福州: 'local:fuzhou.jpg', // 三坊七巷
  洛阳: '1764333944777-aa88655aa515', // 龙门石窟
  开封: '1770722847241-f09a52e608ae', // 铁塔公园古塔
  郑州: 'local:zhengzhou.jpg', // 二七纪念塔
  苏州: '1775486315462-62ea39e31818', // 拙政园
  泰山: 'local:taishan.jpg', // 泰山日观峰日出
  曲阜: 'local:qufu.jpg', // 曲阜孔庙大成殿
  台儿庄: '1779850562330-aa82cb9ca2a8', // 运河古城水乡
  济宁: '1758762894430-7b2fa2de1755', // 济宁古建佛塔
  淄博: '1767039549826-58890cdccf19', // 淄博陶瓷市集
  周村: '1759149059150-490f1b3f13e1', // 周村古街水乡
  周村古城: '1759149059150-490f1b3f13e1', // 周村古商城
  青州: '1534640881905-039ca1e21a81', // 青州古城水巷
  潍坊: '1534640881905-039ca1e21a81', // 潍坊风筝
  微山湖: '1746586464205-fd75e688c2aa', // 微山湖湿地

  // —— 华北东北 ——
  秦皇岛: '1429091967365-492aaa5accfe', // 山海关长城
  承德: '1573824398985-ca6aee6b0cbd', // 避暑山庄外金山岭长城
  大同: '1758079789347-59ecfb292bc4', // 云冈石窟
  平遥: '1742979829727-826d2910b5f7', // 平遥双林寺彩塑
  太原: '1767039549826-58890cdccf19', // 晋祠古建
  呼和浩特: '1758762894430-7b2fa2de1755', // 大召寺古建
  长春: '1515125997599-60e752dbc864', // 伪满皇宫博物院
  沈阳: '1770347258014-06c8acdb77c3', // 沈阳故宫
  大连: '1770036491812-70c032ab1306', // 大连滨海天际
  丹东: '1761127138372-cad230082b19', // 鸭绿江断桥

  // —— 华东补充 ——
  无锡: '1564392495015-6879c09c5655', // 鼋头渚太湖
  宁波: '1748573008328-d20b69fd65a0', // 宁波古街
  温州: '1694355045290-11256c6608a9', // 江心屿瓯江
  嘉兴: '1779850562330-aa82cb9ca2a8', // 嘉兴乌镇水乡
  绍兴: '1722079361613-a801365c12f9', // 绍兴古城水巷
  庐山: '1721569694628-a5b527eb531f', // 庐山云海峰峦
  鼓浪屿: '1734333107761-960beae2f6ca', // 鼓浪屿海岛俯瞰
  武夷山: '1730768772715-561848aa8e3e', // 武夷山丹霞峰林
  威海: '1765121717136-f416076e84de', // 刘公岛海滨
  烟台: '1573824398985-ca6aee6b0cbd', // 烟台蓬莱海岸

  // —— 华中华南 ——
  宜昌: '1746586464205-fd75e688c2aa', // 三峡丹霞峡谷
  常德: '1645157668565-45afc90a3ed2', // 桃花源山水
  南昌: '1704434958840-1bfd23bfa4f5', // 南昌滕王阁街区
  珠海: '1772867342647-6e6d87a0b014', // 珠海渔女与情侣路
  汕头: '1704434537926-bf406c93b5b7', // 汕头骑楼古街
  潮州: '1759149059150-490f1b3f13e1', // 潮州广济桥水乡
  海口: '1730768772715-561848aa8e3e', // 海口骑楼老街

  // —— 西南西北 ——
  峨眉山: '1773335086273-f1b5782b6366', // 峨眉山金顶寺院
  腾冲: '1762970140438-af41c1079b28', // 腾冲和顺古镇
  香格里拉: '1769695239369-2f264f587c9c', // 松赞林寺映湖
  西双版纳: '1767039549826-58890cdccf19', // 西双版纳热带雨林
  贵阳: '1768802871132-edfb74cd4e4a', // 甲秀楼
  遵义: '1748573008328-d20b69fd65a0', // 遵义会议会址古建
  武隆: '1664524948228-37ace30bcd32', // 武隆天生三桥
  兰州: '1748783939742-a7b343fe7d61', // 兰州黄河铁桥
  敦煌: '1755417288480-cc42437bb705', // 鸣沙山月牙泉
  张掖: '1755417288788-f2bea10b450f', // 张掖七彩丹霞
  西宁: '1742127967536-bb395668db2a', // 塔尔寺金顶
  拉萨: '1741257091145-69d62cdf819a', // 布达拉宫
  乌鲁木齐: '1664524948228-37ace30bcd32', // 天山丹霞
  喀什: '1658423538148-6a307b84e959', // 喀什老城巴扎
  伊犁: '1759626507894-68a2c5cbc20a', // 那拉提草原

  // —— 海外 & 区域 ——
  清迈: '1773484133112-09d43885f5f5', // 清迈 Wat Phan Tao
  京都: '1493976040374-85c8e12f0c0e', // 伏见稻荷大社
  冰岛: '1728875650224-fd3f375f6546', // 斯科加瀑布极光
  蓝湖: '1576090674370-842ccf3cd8d8', // 蓝湖温泉
  维克: '1705630547844-29adf8323f28', // 维克黑沙滩
  雷克雅未克: '1728875650224-fd3f375f6546', // 雷克雅未克周边冰岛风光
  越南: '1761127138372-cad230082b19', // 下龙湾喀斯特
};

/** 攻略 id / 英文别名 → 城市封面 */
const GUIDE_ID_CITY: Record<string, string> = {
  chengdu: '成都',
  xian: '西安',
  xiamen: '厦门',
  hangzhou: '杭州',
  jinan: '济南',
  beijing: '北京',
  shanghai: '上海',
  chongqing: '重庆',
  dali: '大理',
  nanjing: '南京',
  yangzhou: '扬州',
  putian: '莆田',
  changsha: '长沙',
  qingdao: '青岛',
  guangzhou: '广州',
  shenzhen: '深圳',
  guilin: '桂林',
  sanya: '三亚',
  kunming: '昆明',
  lijiang: '丽江',
  harbin: '哈尔滨',
  tianjin: '天津',
  suzhou: '苏州',
  wuhan: '武汉',
  vietnam: '越南',
  iceland: '冰岛',
  chiangmai: '清迈',
  kyoto: '京都',
  taishan: '泰山',
  qufu: '曲阜',
  kaifeng: '开封',
  zhengzhou: '郑州',
  quanzhou: '泉州',
  fuzhou: '福州',
  jingdezhen: '景德镇',
  fenghuang: '凤凰',
  qinhuangdao: '秦皇岛',
  chengde: '承德',
  datong: '大同',
  pingyao: '平遥',
  taiyuan: '太原',
  hohhot: '呼和浩特',
  changchun: '长春',
  shenyang: '沈阳',
  dalian: '大连',
  dandong: '丹东',
  wuxi: '无锡',
  ningbo: '宁波',
  wenzhou: '温州',
  jiaxing: '嘉兴',
  shaoxing: '绍兴',
  wuyuan: '婺源',
  huangshan: '黄山',
  'mount-lu': '庐山',
  'xiamen-gulangyu': '鼓浪屿',
  wuyishan: '武夷山',
  weihai: '威海',
  yantai: '烟台',
  luoyang: '洛阳',
  yichang: '宜昌',
  zhangjiajie: '张家界',
  changde: '常德',
  nanchang: '南昌',
  zhuhai: '珠海',
  shantou: '汕头',
  chaozhou: '潮州',
  yangshuo: '阳朔',
  beihai: '北海',
  haikou: '海口',
  'chengdu-leshan': '乐山',
  emei: '峨眉山',
  jiuzhaigou: '九寨沟',
  tengchong: '腾冲',
  shangrila: '香格里拉',
  xishuangbanna: '西双版纳',
  guiyang: '贵阳',
  zunyi: '遵义',
  'chongqing-wulong': '武隆',
  lanzhou: '兰州',
  dunhuang: '敦煌',
  zhangye: '张掖',
  xining: '西宁',
  lhasa: '拉萨',
  urumqi: '乌鲁木齐',
  kashgar: '喀什',
  yining: '伊犁',
};

/** 地点文案中的子地标 → 城市/区域封面（长键优先匹配） */
const PLACE_ALIAS_CITY: readonly [string, string][] = [
  ['蓝湖', '蓝湖'],
  ['雷克雅未克', '雷克雅未克'],
  ['维克', '维克'],
  ['灵隐', '灵隐'],
  ['西湖', '西湖'],
  ['清迈夜市', '清迈'],
  ['清迈', '清迈'],
  ['京都', '京都'],
  ['冰岛', '冰岛'],
  ['下龙湾', '越南'],
  ['越南', '越南'],
  ['凤凰古城', '凤凰'],
  ['凤凰', '凤凰'],
  ['龙门石窟', '洛阳'],
  ['趵突泉', '济南'],
  ['黄鹤楼', '武汉'],
  ['外滩', '上海'],
  ['广州塔', '广州'],
  ['小蛮腰', '广州'],
  ['拙政园', '苏州'],
  ['洱海', '大理'],
  ['甲秀楼', '贵阳'],
  ['滕王阁', '南昌'],
  ['渔女', '珠海'],
  ['江心屿', '温州'],
  ['伪满皇宫', '长春'],
  ['沈阳故宫', '沈阳'],
  ['鼓浪屿', '鼓浪屿'],
  ['兵马俑', '西安'],
  ['洪崖洞', '重庆'],
  ['橘子洲', '长沙'],
  ['瘦西湖', '扬州'],
  ['夫子庙', '南京'],
  ['妈祖', '莆田'],
  ['栈桥', '青岛'],
  ['孔庙', '曲阜'],
  ['孔府', '曲阜'],
  ['孔林', '曲阜'],
  ['三孔', '曲阜'],
  ['尼山', '济宁'],
  ['南天门', '泰山'],
  ['日观峰', '泰山'],
  ['玉皇顶', '泰山'],
  ['泰山', '泰山'],
  ['曲阜', '曲阜'],
  ['开元寺', '泉州'],
  ['镇国塔', '泉州'],
  ['三坊七巷', '福州'],
  ['二七纪念塔', '郑州'],
  ['二七塔', '郑州'],
  ['金山寺', '镇江'],
  ['台儿庄古城', '台儿庄'],
  ['周村古商城', '周村'],
  ['微山湖', '微山湖'],
  ['云冈石窟', '大同'],
  ['月牙泉', '敦煌'],
  ['鸣沙山', '敦煌'],
  ['莫高窟', '敦煌'],
  ['七彩丹霞', '张掖'],
  ['布达拉宫', '拉萨'],
  ['松赞林寺', '香格里拉'],
  ['天生三桥', '武隆'],
  ['滕王阁', '南昌'],
  ['中山桥', '兰州'],
  ['塔尔寺', '西宁'],
  ['武夷山', '武夷山'],
  ['九曲溪', '武夷山'],
];

function normalizeCityKey(city: string): string {
  return city.trim().replace(/(市|省)$/u, '');
}

function buildCoverUrl(source: string, width = 800): string {
  if (source.startsWith('local:')) {
    return resolvePublicAssetUrl(`/city-covers/${source.slice('local:'.length)}`);
  }

  const remote = `https://images.unsplash.com/photo-${source}?auto=format&fit=crop&w=${width}&q=80`;
  return resolveRemoteImageUrl(remote, { width });
}

function resolveCityKeyCover(cityKey: string, width: number): string | null {
  const normalized = normalizeCityKey(cityKey);
  if (!normalized) {
    return null;
  }

  const directSource = CITY_COVER_SOURCES[normalized];
  if (directSource) {
    return buildCoverUrl(directSource, width);
  }

  const guideCity = GUIDE_ID_CITY[normalized.toLowerCase()];
  if (guideCity && CITY_COVER_SOURCES[guideCity]) {
    return buildCoverUrl(CITY_COVER_SOURCES[guideCity], width);
  }

  const fuzzy = Object.entries(CITY_COVER_SOURCES).find(
    ([name]) => normalized.includes(name) || name.includes(normalized),
  );
  return fuzzy ? buildCoverUrl(fuzzy[1], width) : null;
}

/** 从地点/标题/描述文案解析封面（发现页瞬间、方案等） */
export function resolveCoverFromPlaceText(
  text: string,
  options?: { width?: number },
): string | null {
  const trimmed = text.trim();
  if (!trimmed) {
    return null;
  }

  const width = options?.width ?? 800;

  for (const [alias, cityKey] of PLACE_ALIAS_CITY) {
    if (trimmed.includes(alias)) {
      const fromAlias = resolveCityKeyCover(cityKey, width);
      if (fromAlias) {
        return fromAlias;
      }
    }
  }

  const segments = trimmed.split(/[·•|｜,，/\s]+/).map((part) => part.trim()).filter(Boolean);
  for (let index = segments.length - 1; index >= 0; index -= 1) {
    const fromSegment = resolveCityKeyCover(segments[index]!, width);
    if (fromSegment) {
      return fromSegment;
    }
  }

  return resolveCityKeyCover(trimmed, width);
}

/** 城市封面图 URL；未匹配时返回 null，由组件回退渐变色 */
export function resolveCityCoverUrl(
  city: string,
  options?: { width?: number },
): string | null {
  const width = options?.width ?? 800;
  return resolveCityKeyCover(city, width);
}

/** 默认封面（杭州西湖） */
export function getDefaultCityCoverUrl(width = 800): string {
  return resolveCityCoverUrl('杭州', { width })!;
}

/** 坐标库中登记的所有城市是否均有封面映射 */
export function getMissingCityCoverKeys(): string[] {
  return Object.keys(CITY_COORDINATES).filter((city) => !resolveCityCoverUrl(city));
}

/** 给定城市名列表中缺少封面的条目 */
export function getMissingCityCoverNames(cityNames: readonly string[]): string[] {
  return cityNames.filter((city) => !resolveCityCoverUrl(city));
}
