import { readEnv } from '@/lib/config/env';
import { normalizeMapCredential } from '@/lib/map/credentials';

/** 百度地图浏览器端 AK — https://lbsyun.baidu.com/apiconsole/key */
export function getBaiduMapAk(): string | undefined {
  return normalizeMapCredential(readEnv('VITE_BAIDU_MAP_AK'));
}
