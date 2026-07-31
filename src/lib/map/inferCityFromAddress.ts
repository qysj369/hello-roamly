/** 从地址文案推断高德 city 参数，提高小区/POI 搜索命中率 */
export function inferCityFromAddress(address: string): string | undefined {
  const trimmed = address.trim();
  if (!trimmed) {
    return undefined;
  }

  const direct = trimmed.match(
    /(北京|上海|天津|重庆|广州|深圳|杭州|南京|武汉|成都|西安|苏州|青岛|济南|福州|厦门|长沙|郑州|沈阳|哈尔滨|昆明|南宁|合肥|宁波|无锡|东莞|佛山|温州|泉州|莆田|聊城|临清|烟台|淄博|潍坊|临沂|济宁|泰安|威海|日照|菏泽|德州|滨州|枣庄|东营)(?:市)?/,
  );
  if (direct?.[1]) {
    const name = direct[1];
    return /^(北京|上海|天津|重庆)$/.test(name) ? name : `${name}市`;
  }

  if (/历下|市中|槐荫|天桥|历城|章丘|长清|莱芜/.test(trimmed)) {
    return '济南市';
  }

  if (/武侯|锦江|高新|青羊|金牛|成华|龙泉驿|双流|郫都|温江|天府|大源|春熙|宽窄|锦里|太古里/.test(trimmed)) {
    return '成都市';
  }

  return undefined;
}

/** 更像小区/POI 而非纯道路门牌 */
export function isPoiLikeOriginQuery(address: string): boolean {
  return /小区|花园|苑|园|广场|大厦|中心|宿舍|公寓|城|里|村|社区|家园|府|居|庭|湾|谷|小镇/.test(
    address,
  );
}

/** 生成地址解析候选（去掉 A区/B区 等后缀，提取小区名） */
export function buildOriginAddressVariants(address: string): string[] {
  const trimmed = address.trim();
  if (!trimmed) {
    return [];
  }

  const variants = new Set<string>([trimmed]);

  const withoutLetterZone = trimmed.replace(/[A-Za-z]区$/u, '').trim();
  if (withoutLetterZone) {
    variants.add(withoutLetterZone);
  }

  const gardenMatch = trimmed.match(/([\u4e00-\u9fa5]{2,}(?:花园|小区|苑|家园|府|庭|湾|城))/);
  if (gardenMatch?.[1]) {
    variants.add(gardenMatch[1]);
    const city = inferCityFromAddress(trimmed);
    if (city) {
      variants.add(`${city.replace(/市$/, '')}${gardenMatch[1]}`);
    }
  }

  return [...variants];
}
