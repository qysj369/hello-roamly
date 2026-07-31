import { useEffect, useId, useRef, useState } from 'react';

import { DEFAULT_AMAP_VIEW, getAmapKey } from '@/lib/map/amap';
import { bindAmapMapClick } from '@/lib/map/bindAmapMapClick';
import { loadAmap } from '@/lib/map/amapLoader';

import type { MapClickEvent, MapViewState } from '@/lib/map/types';

import { cn } from '@/utils/cn';



export type AmapMapProps = {

  className?: string;

  initialView?: MapViewState;

  onMapClick?: (event: MapClickEvent) => void;

};



export default function AmapMap({

  className,

  initialView = DEFAULT_AMAP_VIEW,

  onMapClick,

}: AmapMapProps) {

  const containerId = useId().replace(/:/g, '');

  const mapRef = useRef<AMapMapInstance | null>(null);

  const onMapClickRef = useRef(onMapClick);

  const [error, setError] = useState<string | null>(null);



  onMapClickRef.current = onMapClick;



  useEffect(() => {

    if (!getAmapKey()) {

      return undefined;

    }



    let disposed = false;



    loadAmap()

      .then((AMap) => {

        if (disposed) {

          return;

        }

        const map = new AMap.Map(containerId, {

          zoom: initialView.zoom,

          center: [initialView.longitude, initialView.latitude],

          viewMode: '2D',

        });

        map.addControl(new AMap.Scale());
        map.addControl(new AMap.ToolBar({ position: { top: '10px', right: '10px' } }));

        bindAmapMapClick(map, (event) => {
          onMapClickRef.current?.(event);
        });

        mapRef.current = map;

      })

      .catch((reason: unknown) => {

        setError(reason instanceof Error ? reason.message : '高德地图加载失败');

      });



    return () => {

      disposed = true;

      mapRef.current?.destroy();

      mapRef.current = null;

    };

  }, [containerId, initialView.latitude, initialView.longitude, initialView.zoom]);



  if (error) {

    return (

      <div className={cn('flex h-full items-center justify-center text-sm text-rose-600', className)}>

        {error}

      </div>

    );

  }



  return <div id={containerId} className={cn('h-full w-full min-h-[12rem]', className)} />;

}


