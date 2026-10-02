export type ShanghaiSharePhotoKind = 'spot' | 'food' | 'vibe';

export type ShanghaiSharePhotoFrame = 'xhs' | 'douyin' | 'wechat';

export type ShanghaiSharePhotoAsset = {
  id: string;
  city: '上海';
  name: string;
  kind: ShanghaiSharePhotoKind;
  photoPath: string;
  keys: string[];
  frames: readonly ShanghaiSharePhotoFrame[];
};

const FRAMES: readonly ShanghaiSharePhotoFrame[] = ['xhs', 'douyin', 'wechat'];

/**
 * 上海试点图库：只用仓库已入库实拍（18 张独立文件），不外引无版权来源图。
 * 每张绑定城市 / 点位 / 分类，并声明适配 3:4 小红书、9:16 抖音、1:1 微信。
 */
export const SHANGHAI_SHARE_PHOTO_KIT: readonly ShanghaiSharePhotoAsset[] = [
  {
    id: 'sh-museum',
    city: '上海',
    name: '上海博物馆',
    kind: 'spot',
    photoPath: '/plan-scenes/shanghai/spot-natural-museum.jpg',
    keys: ['上海博物馆', '上博'],
    frames: FRAMES,
  },
  {
    id: 'sh-bund',
    city: '上海',
    name: '外滩滨江',
    kind: 'spot',
    photoPath: '/city-kit/shanghai/spot-bund.jpg',
    keys: ['外滩滨江', '外滩', '外滩源'],
    frames: FRAMES,
  },
  {
    id: 'sh-wukang',
    city: '上海',
    name: '武康路',
    kind: 'spot',
    photoPath: '/plan-scenes/shanghai/spot-wukang.jpg',
    keys: ['武康路', '武康'],
    frames: FRAMES,
  },
  {
    id: 'sh-yuyuan',
    city: '上海',
    name: '豫园',
    kind: 'spot',
    photoPath: '/city-kit/shanghai/spot-yuyuan.jpg',
    keys: ['豫园', '豫园老街', '城隍庙'],
    frames: FRAMES,
  },
  {
    id: 'sh-xintiandi',
    city: '上海',
    name: '新天地',
    kind: 'spot',
    photoPath: '/plan-scenes/shanghai/spot-xintiandi.jpg',
    keys: ['新天地', '石库门', '新天地石库门'],
    frames: FRAMES,
  },
  {
    id: 'sh-peoples-square',
    city: '上海',
    name: '人民广场',
    kind: 'spot',
    photoPath: '/plan-scenes/shanghai/spot-peoples-square.jpg',
    keys: ['人民广场'],
    frames: FRAMES,
  },
  {
    id: 'sh-science',
    city: '上海',
    name: '上海科技馆',
    kind: 'spot',
    photoPath: '/plan-scenes/shanghai/spot-science-museum.jpg',
    keys: ['科技馆'],
    frames: FRAMES,
  },
  {
    id: 'sh-century-park',
    city: '上海',
    name: '世纪公园',
    kind: 'spot',
    photoPath: '/plan-scenes/shanghai/spot-century-park.jpg',
    keys: ['世纪公园', '绿地'],
    frames: FRAMES,
  },
  {
    id: 'sh-xuhui',
    city: '上海',
    name: '徐汇滨江',
    kind: 'spot',
    photoPath: '/plan-scenes/shanghai/spot-xuhui-river.jpg',
    keys: ['徐汇滨江', '龙美术馆'],
    frames: FRAMES,
  },
  {
    id: 'sh-shendacheng',
    city: '上海',
    name: '沈大成点心',
    kind: 'food',
    photoPath: '/plan-scenes/shanghai/spot-food-shendacheng.jpg',
    keys: ['沈大成', '条头糕', '点心'],
    frames: FRAMES,
  },
  {
    id: 'sh-xiaolong',
    city: '上海',
    name: '南翔小笼',
    kind: 'food',
    photoPath: '/plan-scenes/shanghai/spot-food-xiaolong.jpg',
    keys: ['南翔', '小笼', '馒头店'],
    frames: FRAMES,
  },
  {
    id: 'sh-shengjian',
    city: '上海',
    name: '生煎',
    kind: 'food',
    photoPath: '/plan-scenes/shanghai/spot-food-shengjian.jpg',
    keys: ['生煎', '小杨生煎', '街边小吃'],
    frames: FRAMES,
  },
  {
    id: 'sh-benbang',
    city: '上海',
    name: '本帮菜馆',
    kind: 'food',
    photoPath: '/plan-scenes/shanghai/spot-food-benbang.jpg',
    keys: ['本帮', '红烧肉', '老吉士'],
    frames: FRAMES,
  },
  {
    id: 'sh-cafe',
    city: '上海',
    name: '咖啡馆',
    kind: 'food',
    photoPath: '/plan-scenes/shanghai/spot-food-cafe.jpg',
    keys: ['咖啡', '老麦', '毕尔巴鄂', '咖啡馆'],
    frames: FRAMES,
  },
  {
    id: 'sh-cover-river',
    city: '上海',
    name: '黄浦江畔',
    kind: 'vibe',
    photoPath: '/city-kit/shanghai/cover.jpg',
    keys: ['黄浦江', '江畔'],
    frames: FRAMES,
  },
  {
    id: 'sh-bund-night',
    city: '上海',
    name: '江边日落',
    kind: 'vibe',
    photoPath: '/city-kit/shanghai/spot-bund-night.jpg',
    keys: ['日落', '夜景', '灯火'],
    frames: FRAMES,
  },
  {
    id: 'sh-north-bund',
    city: '上海',
    name: '北外滩日落',
    kind: 'vibe',
    photoPath: '/plan-scenes/shanghai/spot-north-bund.jpg',
    keys: ['北外滩', '日落'],
    frames: FRAMES,
  },
  {
    id: 'sh-wutong',
    city: '上海',
    name: '梧桐老街',
    kind: 'vibe',
    photoPath: '/plan-scenes/shanghai/spot-wukang.jpg',
    keys: ['梧桐老街', '梧桐'],
    frames: FRAMES,
  },
  {
    id: 'sh-old-lane',
    city: '上海',
    name: '老弄堂街巷',
    kind: 'vibe',
    photoPath: '/plan-scenes/shanghai/spot-old-street.jpg',
    keys: ['老街', '街巷', '弄堂', '市集'],
    frames: FRAMES,
  },
];
