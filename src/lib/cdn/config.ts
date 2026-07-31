import { readEnv } from '../config/env';
import { isChinaPrimaryMarket } from '../config/marketScope';

function isTruthyFlag(value: string | undefined): boolean {
  if (!value) {
    return false;
  }
  const normalized = value.trim().toLowerCase();
  return normalized === '1' || normalized === 'true' || normalized === 'yes';
}

/**
 * 构建产物静态资源 CDN 根路径（Vite `base`）。
 * 示例：https://cdn.example.com/ 或 https://bucket.oss-cn-hangzhou.aliyuncs.com/app/
 */
export function getAssetCdnBase(): string | undefined {
  return readEnv('VITE_CDN_BASE');
}

/**
 * 远程图片代理 / 图床（国内图片处理、OSS 镜像等）。
 * 支持 `{url}` 占位，或自动追加 `?url=` 查询参数。
 */
export function getImageCdnTemplate(): string | undefined {
  return readEnv('VITE_IMAGE_CDN');
}

/** 中国版是否优先走 CDN 配置（默认随 VITE_MARKET=CN） */
export function preferChinaCdn(): boolean {
  const raw = readEnv('VITE_USE_CHINA_CDN')?.toLowerCase();
  if (raw === '0' || raw === 'false') {
    return false;
  }
  if (isTruthyFlag(readEnv('VITE_USE_CHINA_CDN'))) {
    return true;
  }
  return isChinaPrimaryMarket();
}

/** 允许使用境外图片代理（如 wsrv.nl），中国版默认关闭 */
export function allowForeignImageProxy(): boolean {
  return isTruthyFlag(readEnv('VITE_ALLOW_FOREIGN_IMAGE_PROXY'));
}

export function hasAssetCdn(): boolean {
  return Boolean(getAssetCdnBase());
}

export function hasImageCdn(): boolean {
  return Boolean(getImageCdnTemplate());
}
