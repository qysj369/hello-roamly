import { useMemo } from 'react';

import AmapMap from '@/components/features/map/AmapMap';

import DevDemoMap from '@/components/features/map/DevDemoMap';

import MapboxMap from '@/components/features/map/MapboxMap';

import MapServicePlaceholder from '@/components/features/map/MapServicePlaceholder';

import { canShowDevDemoMap, hasMapService, resolveMapProvider } from '@/lib/map/provider';

import type { MapClickEvent, MapViewState } from '@/lib/map/types';

import { cn } from '@/utils/cn';



export type TravelMapProps = {

  className?: string;

  initialView?: MapViewState;

  onMapClick?: (event: MapClickEvent) => void;

};



/** 按配置自动选择高德（优先）或 Mapbox */

export default function TravelMap({ className, initialView, onMapClick }: TravelMapProps) {

  const provider = useMemo(() => resolveMapProvider(), []);

  const showDevDemo = useMemo(() => canShowDevDemoMap() && !provider, [provider]);



  if (showDevDemo) {

    return <DevDemoMap className={className} onMapClick={onMapClick} />;

  }



  if (!hasMapService() || !provider) {

    return <MapServicePlaceholder className={className} />;

  }



  if (provider === 'amap') {

    return <AmapMap className={className} initialView={initialView} onMapClick={onMapClick} />;

  }



  return <MapboxMap className={cn(className)} onMapClick={onMapClick} />;

}


