import { useMemo } from 'react';

import Map, { NavigationControl } from 'react-map-gl/maplibre';

import 'maplibre-gl/dist/maplibre-gl.css';

import { DEFAULT_MAP_VIEW } from '@/lib/map/mapbox';

import type { MapClickEvent } from '@/lib/map/types';

import { cn } from '@/utils/cn';



const DEMO_MAP_STYLE = 'https://demotiles.maplibre.org/style.json';



export type DevDemoMapProps = {

  className?: string;

  onMapClick?: (event: MapClickEvent) => void;

};



/** 本地开发演示底图（无需 Key）；生产构建不会启用 */

export default function DevDemoMap({ className, onMapClick }: DevDemoMapProps) {

  const initialView = useMemo(() => ({ ...DEFAULT_MAP_VIEW }), []);



  return (

    <div className={cn('relative h-full w-full min-h-[12rem]', className)}>

      <p className="pointer-events-none absolute left-3 top-3 z-10 rounded-lg border border-amber-200/90 bg-amber-50/95 px-2 py-1 text-[10px] font-medium text-amber-900 shadow-sm backdrop-blur-sm">

        开发演示地图（配置 .env.local 后自动切换高德/Mapbox）

      </p>

      <Map

        mapStyle={DEMO_MAP_STYLE}

        initialViewState={initialView}

        style={{ width: '100%', height: '100%' }}

        reuseMaps

        onClick={

          onMapClick

            ? (event) => {

                onMapClick({

                  lng: event.lngLat.lng,

                  lat: event.lngLat.lat,

                  x: event.point.x,

                  y: event.point.y,

                });

              }

            : undefined

        }

      >

        <NavigationControl position="top-right" showCompass showZoom />

      </Map>

    </div>

  );

}


