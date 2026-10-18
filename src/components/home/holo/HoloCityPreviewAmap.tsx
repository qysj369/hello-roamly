import { useEffect, useId, useRef, useState } from 'react';
import type { HoloPreviewSpotItem } from '@/data/holoCityPreviewPanel';
import { loadAmap } from '@/lib/map/amapLoader';

type HoloCityPreviewAmapProps = {
  cityName: string;
  cityLat: number;
  cityLng: number;
  spots: readonly HoloPreviewSpotItem[];
  /** 文字侧高亮索引；变化时地图居中 + Marker 弹跳 */
  activeIndex: number;
  onSelectSpot: (index: number) => void;
};

function buildMarkerNode(
  label: string,
  active: boolean,
  index: number,
  onSelect: (index: number) => void,
): HTMLDivElement {
  const bg = active ? '#5b7c5a' : '#7a8f6e';
  const ring = active ? '0 0 0 3px rgba(91,124,90,0.28)' : '0 1px 4px rgba(40,50,30,0.18)';
  const wrap = document.createElement('div');
  wrap.dataset.spotIndex = String(index);
  wrap.style.cssText =
    'display:flex;flex-direction:column;align-items:center;gap:4px;transform:translateY(-2px);cursor:pointer;pointer-events:auto;';

  const badge = document.createElement('span');
  badge.textContent = label.slice(0, 1);
  badge.style.cssText = `min-width:22px;height:22px;padding:0 6px;border-radius:999px;background:${bg};color:#fffef8;font:600 11px/22px system-ui,sans-serif;text-align:center;box-shadow:${ring};pointer-events:none;`;

  const caption = document.createElement('span');
  caption.textContent = label;
  caption.style.cssText =
    'max-width:88px;padding:2px 6px;border-radius:8px;background:rgba(255,254,248,0.92);color:#3d4638;font:600 11px/1.3 system-ui,sans-serif;box-shadow:0 1px 3px rgba(40,50,30,0.12);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;pointer-events:none;';

  wrap.append(badge, caption);
  wrap.addEventListener('click', (event) => {
    event.stopPropagation();
    onSelect(index);
  });
  return wrap;
}

/**
 * 城市弹窗高德平面图：定位城市视野、批量地标 Marker、点击联动文字、选中弹跳。
 * 复用项目 loadAmap / 现有 Key，不新增密钥。
 */
export default function HoloCityPreviewAmap({
  cityName,
  cityLat,
  cityLng,
  spots,
  activeIndex,
  onSelectSpot,
}: HoloCityPreviewAmapProps) {
  const reactId = useId().replace(/:/g, '');
  const containerId = `holo-city-amap-${reactId}`;
  const mapRef = useRef<AMapMapInstance | null>(null);
  const markersRef = useRef<AMapMarkerInstance[]>([]);
  const bounceTimerRef = useRef<number | null>(null);
  const onSelectRef = useRef(onSelectSpot);
  onSelectRef.current = onSelectSpot;
  const skipBounceRef = useRef(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let disposed = false;
    skipBounceRef.current = true;
    setLoadError(false);

    void loadAmap()
      .then((AMapNS) => {
        if (disposed) return;

        const map = new AMapNS.Map(containerId, {
          zoom: 12,
          center: [cityLng, cityLat],
          viewMode: '2D',
        });

        try {
          map.addControl(new AMapNS.ToolBar({ position: { top: '10px', right: '10px' } }));
        } catch {
          /* 缩放控件可选 */
        }

        const selectSpot = (index: number) => onSelectRef.current(index);

        const markers: AMapMarkerInstance[] = spots.map((spot, index) => {
          const marker = new AMapNS.Marker({
            position: [spot.lng, spot.lat],
            anchor: 'bottom-center',
            zIndex: 100 + index,
            title: spot.name,
            content: buildMarkerNode(spot.name, index === 0, index, selectSpot),
          });
          marker.on('click', () => {
            selectSpot(index);
          });
          marker.setMap(map);
          return marker;
        });

        markersRef.current = markers;
        mapRef.current = map;

        const nearbyMarkers = markers.filter((_, index) => {
          const spot = spots[index];
          if (!spot) return false;
          return Math.abs(spot.lat - cityLat) < 0.28 && Math.abs(spot.lng - cityLng) < 0.35;
        });
        const fitTargets = nearbyMarkers.length > 0 ? nearbyMarkers : markers;

        if (fitTargets.length > 1) {
          map.setFitView(fitTargets, false, [48, 48, 48, 48], 14);
        } else if (fitTargets.length === 1) {
          const only = spots[markers.indexOf(fitTargets[0])] ?? spots[0];
          map.setZoomAndCenter(13, [only.lng, only.lat]);
        } else {
          map.setZoomAndCenter(11, [cityLng, cityLat]);
        }
      })
      .catch(() => {
        if (!disposed) setLoadError(true);
      });

    return () => {
      disposed = true;
      if (bounceTimerRef.current != null) {
        window.clearTimeout(bounceTimerRef.current);
        bounceTimerRef.current = null;
      }
      markersRef.current.forEach((m) => {
        try {
          m.setAnimation?.('AMAP_ANIMATION_NONE');
          m.setMap(null);
        } catch {
          /* ignore */
        }
      });
      markersRef.current = [];
      try {
        mapRef.current?.destroy();
      } catch {
        /* ignore */
      }
      mapRef.current = null;
    };
  }, [containerId, cityName, cityLat, cityLng, spots]);

  useEffect(() => {
    const map = mapRef.current;
    const markers = markersRef.current;
    if (!map || markers.length === 0) return;

    const spot = spots[activeIndex];
    if (!spot) return;

    const selectSpot = (index: number) => onSelectRef.current(index);

    markers.forEach((marker, index) => {
      marker.setContent(
        buildMarkerNode(spots[index]?.name ?? '', index === activeIndex, index, selectSpot),
      );
      try {
        marker.setAnimation?.('AMAP_ANIMATION_NONE');
      } catch {
        /* ignore */
      }
    });

    const targetZoom = Math.max(map.getZoom(), 13);
    try {
      if (typeof map.panTo === 'function') {
        map.panTo([spot.lng, spot.lat]);
        if (map.getZoom() < 13 && typeof map.setZoom === 'function') {
          map.setZoom(13);
        }
      } else {
        map.setZoomAndCenter(targetZoom, [spot.lng, spot.lat]);
      }
    } catch {
      map.setZoomAndCenter(targetZoom, [spot.lng, spot.lat]);
    }

    if (skipBounceRef.current) {
      skipBounceRef.current = false;
      return;
    }

    const activeMarker = markers[activeIndex];
    if (!activeMarker) return;

    try {
      activeMarker.setAnimation?.('AMAP_ANIMATION_BOUNCE');
    } catch {
      /* ignore */
    }

    if (bounceTimerRef.current != null) {
      window.clearTimeout(bounceTimerRef.current);
    }
    bounceTimerRef.current = window.setTimeout(() => {
      try {
        activeMarker.setAnimation?.('AMAP_ANIMATION_NONE');
      } catch {
        /* ignore */
      }
      bounceTimerRef.current = null;
    }, 1400);
  }, [activeIndex, spots]);

  if (loadError) {
    return (
      <p className="holo-home__preview-map-fallback">
        地图加载失败，仍可浏览右侧慢行信息。
      </p>
    );
  }

  return (
    <div className="holo-home__preview-amap" aria-label={`${cityName}地图`}>
      <div id={containerId} className="holo-home__preview-amap-canvas" />
    </div>
  );
}
