export {
  getAssetCdnBase,
  getImageCdnTemplate,
  preferChinaCdn,
  allowForeignImageProxy,
  hasAssetCdn,
  hasImageCdn,
} from '@/lib/cdn/config';
export {
  normalizeViteBase,
  applyImageCdnProxy,
  resolveRemoteImageUrl,
  resolvePublicAssetUrl,
  shouldUseForeignImageProxy,
} from '@/lib/cdn/urls';
export { buildCdnPreconnectTags } from '@/lib/cdn/preconnect';
