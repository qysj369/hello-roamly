import { useEffect, useState } from 'react';
import type { HoloPreviewGalleryItem } from '@/data/holoCityPreviewMedia';
import {
  buildPlaceholderGallery,
  resolveCityPreviewGallery,
  type CityGalleryTier,
} from '@/data/holoCityPreviewGalleryResolve';

/**
 * 三级图源：实拍 → AI 配套 → 国风 SVG 占位。
 * 图栏始终有内容（至少占位），禁止整栏隐藏 / 裂图。
 */
export function useCityPreviewGalleryRail(city: string | null): {
  gallery: HoloPreviewGalleryItem[];
  tier: CityGalleryTier;
  ready: boolean;
} {
  const [gallery, setGallery] = useState<HoloPreviewGalleryItem[]>(() =>
    city ? buildPlaceholderGallery(city) : [],
  );
  const [tier, setTier] = useState<CityGalleryTier>('placeholder');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    if (!city) {
      setGallery([]);
      setTier('placeholder');
      setReady(true);
      return () => {
        cancelled = true;
      };
    }

    setReady(false);
    setGallery(buildPlaceholderGallery(city));
    setTier('placeholder');

    void resolveCityPreviewGallery(city).then((resolved) => {
      if (cancelled) return;
      setGallery(resolved.items);
      setTier(resolved.tier);
      setReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, [city]);

  return { gallery, tier, ready };
}
