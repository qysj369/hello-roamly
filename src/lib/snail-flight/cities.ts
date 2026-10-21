/** 国内观光点位（WGS84，本阶段仅中国境内） */
export type SnailFlightCity = {
  id: string;
  label: string;
  aliases?: readonly string[];
  lon: number;
  lat: number;
  blurb: string;
};

export const SNAIL_FLIGHT_CITIES: readonly SnailFlightCity[] = [
  {
    id: 'baotu',
    label: '趵突泉',
    aliases: ['趵突泉公园', '天下第一泉'],
    lon: 117.028,
    lat: 36.662,
    blurb: '泉城济南的中心泉群，三股泉水昼夜翻涌，是济南人的心头泉眼。',
  },
  {
    id: 'daming',
    label: '大明湖',
    aliases: ['大明湖畔'],
    lon: 117.018,
    lat: 36.671,
    blurb: '济南老城北面的阔水湖面，柳堤荷影，超然楼灯火映水，湖山一色。',
  },
  {
    id: 'qianfo',
    label: '千佛山',
    aliases: ['千佛山公园'],
    lon: 117.03,
    lat: 36.636,
    blurb: '济南城南的山体，舜耕历山传说与隋唐造像叠在山间，登顶可望齐烟九点。',
  },
  {
    id: 'heihu',
    label: '黑虎泉',
    aliases: ['黑虎泉畔'],
    lon: 117.028,
    lat: 36.654,
    blurb: '护城河畔的奔涌泉群，清晨打水人络绎，水声如虎啸，直通解放阁。',
  },
  {
    id: 'jiuru',
    label: '九如山',
    aliases: ['九如山瀑布群'],
    lon: 117.196,
    lat: 36.53,
    blurb: '济南南部山区的溪谷群，瀑布连潭，秋红冬冰，是离城最近的山野深呼吸。',
  },
  {
    id: 'jinan-lixia',
    label: '济南历下',
    aliases: ['历下', '济南', '泉城'],
    lon: 117.1297,
    lat: 36.6665,
    blurb: '济南城区东侧，护城河与泉群附近的街巷叠在一起，夏天湿热，早晚沿河更松。',
  },
  {
    id: 'zhangqiu',
    label: '章丘',
    lon: 117.5262,
    lat: 36.681,
    blurb: '济南东边的平原区县，田野和村落铺得开，是出城向东的过渡带。',
  },
  {
    id: 'zibo',
    label: '淄博',
    lon: 118.0549,
    lat: 36.8131,
    blurb: '鲁中工矿与老城并存的城市，烟火气重，街巷里烧烤和市井叠在一起。',
  },
  {
    id: 'weifang',
    label: '潍坊',
    lon: 119.1619,
    lat: 36.7069,
    blurb: '胶东平原上的风筝之乡，原野开阔，向东逐渐嗅到海风。',
  },
  {
    id: 'qingdao',
    label: '青岛',
    aliases: ['青岛沿海', '青岛近海'],
    lon: 120.3229,
    lat: 36.0598,
    blurb:
      '黄海之滨的港口城市，红瓦坡顶和沿海老街区叠在一起，风里带盐，夏天人多，海边步道早晚更松。',
  },
  {
    id: 'beijing',
    label: '北京',
    lon: 116.4074,
    lat: 39.9042,
    blurb: '北方政治文化中心，胡同与中轴线叠层，人多、风硬，老城和新建区差得很开。',
  },
  {
    id: 'shanghai',
    label: '上海',
    lon: 121.4737,
    lat: 31.2304,
    blurb: '江海交汇的港口大都会，里弄、滨江与办公楼挤在同一条天际线里，潮、风、人声都密。',
  },
  {
    id: 'hangzhou',
    label: '杭州',
    lon: 120.1551,
    lat: 30.2741,
    blurb: '西湖和城里街巷连在一起，湿气重，茶香和车声并排，不必当成山水画。',
  },
  {
    id: 'suzhou',
    label: '苏州',
    lon: 120.6196,
    lat: 31.299,
    blurb: '水巷与园林嵌在居住区里，潮湿、人流随节假日起伏，更适合慢慢走。',
  },
  {
    id: 'nanjing',
    label: '南京',
    lon: 118.7969,
    lat: 32.0603,
    blurb: '长江边的古都，城墙、民国街巷和日常市井叠层，夏天闷热。',
  },
  {
    id: 'jinan',
    label: '济南市区',
    lon: 117.0009,
    lat: 36.6758,
    blurb: '泉群与护城河串起老城，夏天湿热，沿河比山路更松。',
  },
  {
    id: 'guangzhou',
    label: '广州',
    lon: 113.2644,
    lat: 23.1291,
    blurb: '珠江口的湿热商埠，早茶和街巷密度高，雨热同季。',
  },
  {
    id: 'chengdu',
    label: '成都',
    lon: 104.0665,
    lat: 30.5723,
    blurb: '盆地里的慢节奏省会，茶馆和街巷多，阴天常见，不必赶场。',
  },
  {
    id: 'xian',
    label: '西安',
    lon: 108.9402,
    lat: 34.3416,
    blurb: '关中平原上的古都，城墙内外生活差得开，风干、人密。',
  },
  {
    id: 'xiamen',
    label: '厦门',
    lon: 118.0894,
    lat: 24.4798,
    blurb: '海岛与老城并排，风里带盐，鼓浪屿人多，滨海步道早晚更松。',
  },
  {
    id: 'shenzhen',
    label: '深圳',
    lon: 114.0579,
    lat: 22.5431,
    blurb: '口岸边的新城市，海岸与城中村并置，节奏快，海风和工地声并存。',
  },
  {
    id: 'tianjin',
    label: '天津',
    lon: 117.2008,
    lat: 39.0842,
    blurb: '海河串起的港口城市，洋楼区和市井街巷叠层，风硬、人密。',
  },
  {
    id: 'qingdao-laoshan',
    label: '青岛崂山',
    lon: 120.619,
    lat: 36.17,
    blurb: '青岛东侧沿海山体，海风大，山路和岸线叠在一起。',
  },
] as const;

export const SNAIL_FLIGHT_DEFAULT_ORIGIN_ID = 'baotu';
export const SNAIL_FLIGHT_DEFAULT_DEST_ID = 'jiuru';

export function getSnailFlightCity(id: string): SnailFlightCity | undefined {
  return SNAIL_FLIGHT_CITIES.find((city) => city.id === id);
}

export function findSnailFlightCityByLabel(raw: string): SnailFlightCity | undefined {
  const label = raw.trim();
  if (!label) return undefined;
  return SNAIL_FLIGHT_CITIES.find(
    (city) => city.id === label || city.label === label || city.aliases?.includes(label),
  );
}

export function isDomesticSnailFlightCityId(id: string): boolean {
  return Boolean(getSnailFlightCity(id));
}
