/** 飞阅首页素材与票价。票价口径：目的地官方公开信息，页面只引用这里的数字。 */

export const flyHomeFares = {
  source: '目的地官方公开口径',
  baotuNightYuan: 20,
  damingEntryYuan: 0,
  qianfoFullYuan: 30,
  qianfoStudentYuan: 15,
  chaoranFullYuan: 40,
  chaoranStudentYuan: 20,
  walkKm: 1.2,
  metroWalkMin: 8,
} as const;

const media = '/fly-home';

export const flyHomeMedia = {
  hero: `${media}/baotuquan-fly.mp4?v=3`,
  tokyo: `${media}/tokyo-bay.jpg`,
  iceland: `${media}/iceland-ring.jpg`,
  chiangmai: `${media}/chiangmai.jpg`,
  paris: `${media}/paris-seine.jpg`,
  baotu: `${media}/baotuquan-fly.mp4?v=3`,
  daming: `${media}/daming-fly.mp4?v=3`,
  qianfo: `${media}/qianfo-fly.mp4?v=3`,
  heihu: `${media}/heihu-fly.mp4?v=3`,
  jiuru: `${media}/jiuru-fly.mp4?v=3`,
  baotuPoster: `${media}/hero-baotuquan.jpg`,
  damingPoster: `${media}/hero-daming.jpg`,
  qianfoPoster: `${media}/hero-qianfo.jpg`,
  heihuPoster: `${media}/heihu-poster.jpg`,
  jiuruPoster: `${media}/jiuru-poster.jpg`,
  heihuCover: `${media}/heihu-cover.jpg`,
  damingCover: `${media}/daming-cover.jpg`,
} as const;

export type FlyGlobalRoute = {
  id: string;
  image: string;
  alt: string;
  nameKey: 'tk1' | 'tk2' | 'tk3' | 'tk4';
  descKey: 'td1' | 'td2' | 'td3' | 'td4';
};

export const flyGlobalRoutes: FlyGlobalRoute[] = [
  {
    id: 'tokyo',
    image: flyHomeMedia.tokyo,
    alt: 'Tokyo Bay night',
    nameKey: 'tk1',
    descKey: 'td1',
  },
  {
    id: 'iceland',
    image: flyHomeMedia.iceland,
    alt: 'Iceland ring road',
    nameKey: 'tk2',
    descKey: 'td2',
  },
  {
    id: 'chiangmai',
    image: flyHomeMedia.chiangmai,
    alt: 'Chiang Mai terraces',
    nameKey: 'tk3',
    descKey: 'td3',
  },
  { id: 'paris', image: flyHomeMedia.paris, alt: 'Paris Seine', nameKey: 'tk4', descKey: 'td4' },
];

export type FlyJinanRoute = {
  id: string;
  video: string;
  poster: string;
  href: string;
  nameKey: 'jk1' | 'jk2' | 'jk3' | 'jk4' | 'jk5';
  descKey: 'jd1' | 'jd2' | 'jd3' | 'jd4' | 'jd5';
  placeKey: 'jp1' | 'jp2' | 'jp3' | 'jp4' | 'jp5';
  badge: 'ai15' | 'ai25';
};

export const flyJinanRoutes: FlyJinanRoute[] = [
  {
    id: 'baotu',
    video: flyHomeMedia.baotu,
    poster: flyHomeMedia.baotuPoster,
    href: '/fly-spots/baotu.html',
    nameKey: 'jk1',
    descKey: 'jd1',
    placeKey: 'jp1',
    badge: 'ai15',
  },
  {
    id: 'daming',
    video: flyHomeMedia.daming,
    poster: flyHomeMedia.damingPoster,
    href: '/fly-spots/daming.html',
    nameKey: 'jk2',
    descKey: 'jd2',
    placeKey: 'jp2',
    badge: 'ai15',
  },
  {
    id: 'qianfo',
    video: flyHomeMedia.qianfo,
    poster: flyHomeMedia.qianfoPoster,
    href: '/fly-spots/qianfo.html',
    nameKey: 'jk3',
    descKey: 'jd3',
    placeKey: 'jp3',
    badge: 'ai15',
  },
  {
    id: 'heihu',
    video: flyHomeMedia.heihu,
    poster: flyHomeMedia.heihuPoster,
    href: '/fly-spots/heihu.html',
    nameKey: 'jk4',
    descKey: 'jd4',
    placeKey: 'jp4',
    badge: 'ai25',
  },
  {
    id: 'jiuru',
    video: flyHomeMedia.jiuru,
    poster: flyHomeMedia.jiuruPoster,
    href: '/fly-spots/jiuru.html',
    nameKey: 'jk5',
    descKey: 'jd5',
    placeKey: 'jp5',
    badge: 'ai15',
  },
];
