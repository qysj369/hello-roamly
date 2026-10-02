/**
 * 热门城市弹窗「种草图」严格白名单。
 * 每城只允许本城目录下的已审核路径；禁止混入他城 / 全局池。
 * 杭州仅允许西湖系主题（西湖 / 苏堤等已核实画面）；错城文件不进表。
 */

export type HoloPreviewGalleryItem = {
  src: string;
  label: string;
  featured?: boolean;
};

/** 城市 → 允许的路径前缀（本城专属目录） */
const CITY_MEDIA_PREFIXES: Record<string, readonly string[]> = {
  北京: ['/city-kit/beijing/'],
  上海: ['/city-kit/shanghai/'],
  杭州: ['/city-kit/hangzhou/'],
  苏州: ['/city-kit/suzhou/'],
  济南: ['/city-kit/jinan/'],
  南京: ['/city-kit/nanjing/'],
  广州: ['/city-kit/guangzhou/'],
  深圳: ['/plan-scenes/shenzhen/'],
  成都: ['/city-kit/chengdu/'],
  西安: ['/city-kit/xian/'],
  厦门: ['/city-kit/xiamen/'],
  黄山: ['/city-kit/huangshan/'],
  泉州: ['/city-kit/quanzhou/'],
};

/**
 * 已人工核对画面属本城的图。
 * 空数组 = 该城暂无可信实拍 → 图栏走 AI / 占位，不自动吞未审核 kit 图。
 */
const CITY_GALLERY_WHITELIST: Record<string, readonly HoloPreviewGalleryItem[]> = {
  北京: [
    { src: '/city-kit/beijing/cover.jpg', label: '颐和园·佛香阁', featured: true },
    { src: '/city-kit/beijing/spot-yiheyuan.jpg', label: '颐和园·石舫' },
    { src: '/city-kit/beijing/spot-shichahai.jpg', label: '什刹海夜色' },
  ],
  上海: [
    { src: '/city-kit/shanghai/spot-bund.jpg', label: '外滩对岸天际', featured: true },
    { src: '/city-kit/shanghai/spot-bund-night.jpg', label: '陆家嘴夜色' },
    { src: '/city-kit/shanghai/spot-yuyuan.jpg', label: '豫园亭廊' },
    { src: '/city-kit/shanghai/cover.jpg', label: '黄浦江畔' },
  ],
  /* 杭州：8 城优先实拍（西湖 / 灵隐 / 运河） */
  杭州: [
    { src: '/city-kit/hangzhou/spot-westlake.jpg', label: '西湖岸线', featured: true },
    { src: '/city-kit/hangzhou/spot-lingyin.jpg', label: '灵隐外缘' },
    { src: '/city-kit/hangzhou/spot-canal.jpg', label: '运河水岸' },
  ],
  苏州: [
    { src: '/city-kit/suzhou/spot-pingjiang.jpg', label: '平江水巷灯影', featured: true },
    { src: '/city-kit/suzhou/spot-zhuozheng.jpg', label: '拙政园秋色' },
    { src: '/city-kit/suzhou/spot-tongli.jpg', label: '同里游船码头' },
  ],
  济南: [
    { src: '/city-kit/jinan/cover.jpg', label: '大明湖全景', featured: true },
    { src: '/city-kit/jinan/spot-daming.jpg', label: '大明湖水岸' },
    { src: '/city-kit/jinan/spot-baotu.jpg', label: '趵突泉' },
    { src: '/city-kit/jinan/spot-furong.jpg', label: '芙蓉街侧巷' },
  ],
  南京: [
    { src: '/city-kit/nanjing/cover.jpg', label: '玄武湖城影', featured: true },
    { src: '/city-kit/nanjing/spot-zhongshan.jpg', label: '中山陵' },
  ],
  /* 广州：珠江塔景 / 沙面 / 早茶已核实；错城欧洲河岸不进表 */
  广州: [
    { src: '/city-kit/guangzhou/cover.jpg', label: '珠江·广州塔', featured: true },
    { src: '/city-kit/guangzhou/spot-tower-night.jpg', label: '广州塔夜景' },
    { src: '/city-kit/guangzhou/spot-river-skyline.jpg', label: '珠江天际' },
    { src: '/city-kit/guangzhou/spot-shamian.jpg', label: '沙面铜像' },
    { src: '/city-kit/guangzhou/spot-dimsum-local.jpg', label: '粤式早茶' },
  ],
  深圳: [
    { src: '/plan-scenes/shenzhen/cover-sz.jpg', label: '深圳湾落日', featured: true },
    { src: '/plan-scenes/shenzhen/bay-park.jpg', label: '深圳湾栈道' },
    { src: '/plan-scenes/shenzhen/bay-sunset.jpg', label: '湾区余晖' },
    { src: '/plan-scenes/shenzhen/coast-city.jpg', label: '海岸城' },
  ],
  /* 成都：8 城优先实拍；AI 配套仅作加载失败回退 */
  成都: [
    { src: '/city-kit/chengdu/spot-kuanzhai.jpg', label: '宽窄巷子', featured: true },
    { src: '/city-kit/chengdu/spot-jinli.jpg', label: '锦里灯影' },
    { src: '/city-kit/chengdu/spot-panda.jpg', label: '熊猫慢行' },
    { src: '/city-kit/chengdu/spot-qingcheng.jpg', label: '青城山外缘' },
  ],
  西安: [
    { src: '/city-kit/xian/cover.jpg', label: '西安城墙', featured: true },
    { src: '/city-kit/xian/spot-wall.jpg', label: '城墙骑行段' },
    { src: '/city-kit/xian/spot-dayan.jpg', label: '大雁塔' },
  ],
  厦门: [
    { src: '/city-kit/xiamen/cover.jpg', label: '海岛对岸红瓦', featured: true },
    { src: '/city-kit/xiamen/spot-huandao.jpg', label: '环湾海岸' },
    { src: '/city-kit/xiamen/spot-gulangyu.jpg', label: '闽南红瓦屋脊' },
  ],
  黄山: [
    { src: '/city-kit/huangshan/cover.jpg', label: '黄山云海奇峰', featured: true },
    { src: '/city-kit/huangshan/spot-main.jpg', label: '山间奇松' },
  ],
  泉州: [
    { src: '/city-kit/quanzhou/cover.jpg', label: '开元寺石塔', featured: true },
    { src: '/city-kit/quanzhou/spot-main.jpg', label: '寺塔近景' },
  ],
};

function isUnderCityPrefix(src: string, city: string): boolean {
  const prefixes = CITY_MEDIA_PREFIXES[city];
  if (!prefixes?.length) return false;
  return prefixes.some((prefix) => src.startsWith(prefix));
}

/** 取当前城市专属种草图；空则返回 [] */
export function getCityPreviewGallery(city: string): HoloPreviewGalleryItem[] {
  const raw = CITY_GALLERY_WHITELIST[city];
  if (!raw?.length) return [];
  return raw.filter((item) => isUnderCityPrefix(item.src, city)).slice(0, 6);
}

/** 是否在白名单表中登记过（含空表）：空表表示明确暂无可信实拍 */
export function hasCityGalleryWhitelistEntry(city: string): boolean {
  return Object.prototype.hasOwnProperty.call(CITY_GALLERY_WHITELIST, city);
}

/** 测试/校验：图是否落在该城允许目录 */
export function assertCityPreviewMediaBound(city: string, src: string): boolean {
  return isUnderCityPrefix(src, city);
}

export function listHotCitiesWithPreviewMedia(): string[] {
  return Object.keys(CITY_GALLERY_WHITELIST);
}
