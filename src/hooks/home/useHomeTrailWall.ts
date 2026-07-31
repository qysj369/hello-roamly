import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { fetchGuideList } from '@/services/guides/list';
import { guidesToTrailWallItems } from '@/lib/map/trailWall/guideAdapter';
import {
  buildCrawlerPoint,
  buildTrailWallLineCollection,
  findTrailGuideById,
} from '@/lib/map/trailWall/geoJson';
import { HOME_MAP_TRAIL_VIEW } from '@/lib/config/homeMapTrail';
import { filterTrailGuidesByDestination } from '@/utils/filterGuidesByDestination';
import type { TrailWallFilter, TrailWallGuide } from '@/types/domain/trailWall';

export type HomeMapTrailViewState = {
  longitude: number;
  latitude: number;
  zoom: number;
  pitch: number;
  bearing: number;
};

export function useHomeTrailWall() {
  const [viewState, setViewState] = useState<HomeMapTrailViewState>({
    ...HOME_MAP_TRAIL_VIEW,
  });
  const [guides, setGuides] = useState<TrailWallGuide[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<TrailWallFilter>('all');
  const [highlightedTrailId, setHighlightedTrailId] = useState<string | null>(null);
  const [hoveredTrailId, setHoveredTrailId] = useState<string | null>(null);
  const [pulseOpacity, setPulseOpacity] = useState(0.85);
  const [pulseBrightness, setPulseBrightness] = useState(1);
  const [crawlerProgress, setCrawlerProgress] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadGuides() {
      setLoading(true);
      try {
        const response = await fetchGuideList({ limit: 50 });
        if (cancelled) {
          return;
        }
        const items = guidesToTrailWallItems(response.items);
        setGuides(items);
        setHighlightedTrailId((current) => current ?? items[0]?.id ?? null);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadGuides();
    return () => {
      cancelled = true;
    };
  }, []);

  const visibleGuides = useMemo(() => {
    const byTag = guides.filter((guide) => filter === 'all' || guide.tag === filter);
    return filterTrailGuidesByDestination(byTag, searchQuery);
  }, [guides, filter, searchQuery]);

  /** 地图下方横向卡片条：始终展示全部轨迹，不随搜索筛选 */
  const stripGuides = useMemo(() => {
    return guides.filter((guide) => filter === 'all' || guide.tag === filter);
  }, [guides, filter]);

  const activeTrailId = highlightedTrailId ?? hoveredTrailId;

  const lineCollection = useMemo(
    () => buildTrailWallLineCollection(visibleGuides),
    [visibleGuides],
  );

  const highlightedGuide = useMemo(
    () => findTrailGuideById(visibleGuides, activeTrailId),
    [visibleGuides, activeTrailId],
  );

  const crawlerGuide = useMemo(
    () => findTrailGuideById(guides, highlightedTrailId) ?? visibleGuides[0],
    [guides, highlightedTrailId, visibleGuides],
  );

  const crawlerCollection = useMemo(() => {
    if (!crawlerGuide) {
      return buildCrawlerPoint(
        {
          id: 'fallback',
          title: '',
          start_city: '北京',
          end_city: '北京',
          start_coords: [116.4074, 39.9042],
          end_coords: [116.4074, 39.9042],
          days: 1,
          budget: '',
          summary: '',
          tag: 'budget',
          colorStart: '#34d399',
          colorEnd: '#10b981',
        },
        0,
      );
    }
    return buildCrawlerPoint(crawlerGuide, crawlerProgress);
  }, [crawlerGuide, crawlerProgress]);

  const handleViewStateChange = useCallback((next: HomeMapTrailViewState) => {
    setViewState(next);
  }, []);

  const selectTrail = useCallback((guide: TrailWallGuide) => {
    setHighlightedTrailId(guide.id);
    setCrawlerProgress(0);
    startRef.current = null;
  }, []);

  useEffect(() => {
    if (!highlightedTrailId) {
      return;
    }
    const node = document.querySelector<HTMLElement>(
      `[data-trail-id="${highlightedTrailId}"]`,
    );
    node?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
  }, [highlightedTrailId, visibleGuides]);

  useEffect(() => {
    if (!highlightedTrailId && visibleGuides[0]) {
      setHighlightedTrailId(visibleGuides[0].id);
    }
  }, [highlightedTrailId, visibleGuides]);

  useEffect(() => {
    const tick = (timestamp: number) => {
      if (startRef.current === null) {
        startRef.current = timestamp;
      }
      const elapsed = timestamp - startRef.current;
      const pulse = 0.55 + 0.35 * Math.sin(elapsed / 520);
      setPulseOpacity(pulse);
      setPulseBrightness(0.92 + 0.12 * Math.sin(elapsed / 520));
      setCrawlerProgress((elapsed % 12000) / 12000);
      rafRef.current = window.requestAnimationFrame(tick);
    };

    rafRef.current = window.requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
      }
    };
  }, [highlightedTrailId]);

  return {
    viewState,
    guides,
    visibleGuides,
    stripGuides,
    loading,
    searchQuery,
    filter,
    highlightedTrailId,
    hoveredTrailId,
    activeTrailId,
    highlightedGuide,
    pulseOpacity,
    pulseBrightness,
    lineCollection,
    crawlerCollection,
    setSearchQuery,
    setFilter,
    selectTrail,
    setHighlightedTrailId,
    setHoveredTrailId,
    handleViewStateChange,
  };
}
