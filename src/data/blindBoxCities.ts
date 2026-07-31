/** 盲盒稀有度：1=传说，2=精选，3=经典 */
export type BlindBoxRarity = 1 | 2 | 3;

export type BlindBoxCity = {
  name: string;
  tagline: string;
  lat: number;
  lng: number;
  rarity: BlindBoxRarity;
};

/** 城市盲盒数据库 */
export const blindBoxCities: readonly BlindBoxCity[] = [
  // 传说款（紫色流光，概率 1%）
  { name: '漠河', tagline: '中国最北，追极光的童话', lat: 53.5, lng: 122.3, rarity: 1 },
  { name: '西沙群岛', tagline: '玻璃海，祖国最南端的蓝', lat: 16.8, lng: 111.4, rarity: 1 },
  { name: '稻城亚丁', tagline: '消失的地平线，蓝色星球最后一片净土', lat: 28.4, lng: 100.3, rarity: 1 },
  { name: '南极洛', tagline: '天神遗落在人间的眼泪', lat: 27.8, lng: 99.2, rarity: 1 },
  { name: '雨崩', tagline: '与世隔绝的桃源，徒步者的天堂', lat: 28.1, lng: 98.8, rarity: 1 },

  // 精选款（金色边框，概率 20%）
  { name: '喀什', tagline: '西域回响，活着的千年古城', lat: 39.5, lng: 75.9, rarity: 2 },
  { name: '敦煌', tagline: '大漠孤烟，敦煌的风沙会记得', lat: 40.1, lng: 94.6, rarity: 2 },
  { name: '长白山', tagline: '天池水怪的传说，一眼万年', lat: 42.0, lng: 128.0, rarity: 2 },
  { name: '张家界', tagline: '悬浮山现实版，阿凡达的故乡', lat: 29.3, lng: 110.4, rarity: 2 },
  { name: '香格里拉', tagline: '心中的日月，离天堂最近的地方', lat: 27.8, lng: 99.7, rarity: 2 },
  { name: '莫干山', tagline: '竹林深处有人家，避世隐居', lat: 30.6, lng: 119.9, rarity: 2 },
  { name: '涠洲岛', tagline: '中国最美火山岛，玻璃海的夏天', lat: 21.0, lng: 109.1, rarity: 2 },

  // 经典款（青色霓虹，概率 79%）
  { name: '西安', tagline: '长安归故里，故里有长安', lat: 34.3, lng: 108.9, rarity: 3 },
  { name: '成都', tagline: '巴适得很，把时光泡在茶馆里', lat: 30.6, lng: 104.0, rarity: 3 },
  { name: '大理', tagline: '风花雪月的慢镜头', lat: 25.7, lng: 100.1, rarity: 3 },
  { name: '三亚', tagline: '椰林树影，承包这片玻璃海', lat: 18.2, lng: 109.5, rarity: 3 },
  { name: '拉萨', tagline: '日光之城，离天空最近的城市', lat: 29.6, lng: 91.1, rarity: 3 },
  { name: '重庆', tagline: '8D魔幻山城，赛博朋克的现实版', lat: 29.5, lng: 106.5, rarity: 3 },
  { name: '丽江', tagline: '柔软时光，艳遇一场风花雪月', lat: 26.8, lng: 100.2, rarity: 3 },
  { name: '厦门', tagline: '文艺小资，面朝大海的鼓浪屿', lat: 24.4, lng: 118.0, rarity: 3 },
  { name: '杭州', tagline: '西湖美景，三月天的江南', lat: 30.2, lng: 120.1, rarity: 3 },
  { name: '苏州', tagline: '园林甲天下，江南水乡的魂', lat: 31.3, lng: 120.5, rarity: 3 },
  { name: '桂林', tagline: '山水甲天下，漓江的山水画廊', lat: 25.2, lng: 110.2, rarity: 3 },
  { name: '黄山', tagline: '五岳归来不看山，黄山归来不看岳', lat: 30.1, lng: 118.1, rarity: 3 },
  { name: '凤凰', tagline: '等一城烟雨，渡一世情缘', lat: 27.9, lng: 109.6, rarity: 3 },
  { name: '威海', tagline: '山东荣成，干净的蓝海与童话小镇', lat: 37.5, lng: 122.1, rarity: 3 },
  { name: '洛阳', tagline: '十三朝古都，神都洛阳的牡丹花', lat: 34.6, lng: 112.4, rarity: 3 },
  { name: '济南', tagline: '泉城天下，趵突泉边的烟火人间', lat: 36.65, lng: 117.12, rarity: 3 },
  { name: '武汉', tagline: '江城樱花，热干面的过早烟火气', lat: 30.5, lng: 114.3, rarity: 3 },
  { name: '昆明', tagline: '春城无处不飞花，四季如春的温柔', lat: 25.0, lng: 102.7, rarity: 3 },
  { name: '贵阳', tagline: '爽爽的贵阳，避暑之都的酸辣味', lat: 26.5, lng: 106.7, rarity: 3 },
  { name: '哈尔滨', tagline: '冰城夏都，索菲亚教堂的雪', lat: 45.8, lng: 126.5, rarity: 3 },
  { name: '青岛', tagline: '红瓦绿树，碧海蓝天的啤酒香', lat: 36.1, lng: 120.4, rarity: 3 },
  { name: '大连', tagline: '北方明珠，滨海路的浪漫', lat: 38.9, lng: 121.6, rarity: 3 },
  { name: '南京', tagline: '六朝古都，梧桐树的民国风情', lat: 32.1, lng: 118.8, rarity: 3 },
  { name: '长沙', tagline: '不夜城，辣椒与芒果的快乐', lat: 28.2, lng: 113.0, rarity: 3 },
  { name: '广州', tagline: '食在广州，早茶与骑楼的烟火', lat: 23.1, lng: 113.3, rarity: 3 },
  { name: '深圳', tagline: '改革前沿，山海之间的奇迹', lat: 22.5, lng: 114.1, rarity: 3 },
  { name: '北京', tagline: '皇城根下，红墙黄瓦的厚重', lat: 39.9, lng: 116.4, rarity: 3 },
  { name: '上海', tagline: '魔都之夜，外滩的百年风华', lat: 31.2, lng: 121.5, rarity: 3 },
  { name: '乌鲁木齐', tagline: '亚心之都，天山脚下的异域', lat: 43.8, lng: 87.6, rarity: 3 },
  { name: '呼和浩特', tagline: '草原明珠，风吹草低见牛羊', lat: 40.8, lng: 111.7, rarity: 3 },
  { name: '兰州', tagline: '黄河穿城，一碗牛肉面的清晨', lat: 36.1, lng: 103.8, rarity: 3 },
  { name: '西宁', tagline: '夏都清凉，青藏高原的门户', lat: 36.6, lng: 101.8, rarity: 3 },
  { name: '银川', tagline: '塞上江南，西夏王陵的落日', lat: 38.5, lng: 106.2, rarity: 3 },
  { name: '腾冲', tagline: '极边第一城，银杏村的秋天', lat: 25.0, lng: 97.5, rarity: 3 },
  { name: '婺源', tagline: '中国最美乡村，油菜花的诗', lat: 29.3, lng: 117.8, rarity: 3 },
  { name: '霞浦', tagline: '光影交错，滩涂上的水墨画', lat: 26.9, lng: 120.0, rarity: 3 },
  { name: '恩施', tagline: '湖北仙境，悬浮船上的山水', lat: 30.3, lng: 107.5, rarity: 3 },
  { name: '甘南', tagline: '九色香巴拉，梵音缭绕的净土', lat: 33.9, lng: 102.9, rarity: 3 },
  { name: '伊犁', tagline: '塞外江南，薰衣草的紫色海洋', lat: 44.0, lng: 81.3, rarity: 3 },
  { name: '呼伦贝尔', tagline: '草原的尽头，是自由的方向', lat: 49.2, lng: 125.7, rarity: 3 },
] as const;
