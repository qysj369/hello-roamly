import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Maximize2, Sparkles, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AIPlanningModal from '@/components/features/map/AIPlanningModal';
import MapComponent from '@/components/features/map/MapComponent';
import MapProviderBadge from '@/components/features/map/MapProviderBadge';
import { useMapPlanningAssistant } from '@/hooks/map/useMapPlanningAssistant';
import { hasDisplayableMap } from '@/lib/map/provider';
import {
  modalPanelVariants,
  motionTransition,
  overlayVariants,
  scaleInVariants,
} from '@/lib/motion';

type MapExpandPanelProps = {
  className?: string;
};

type MapPageState = {
  planQuery?: string;
};

type MapPlanningLayerProps = {
  className?: string;
  planning: ReturnType<typeof useMapPlanningAssistant>;
  showHint?: boolean;
};

function MapPlanningLayer({ className, planning, showHint = true }: MapPlanningLayerProps) {
  return (
    <div className={['relative h-full min-h-[12rem]', className].filter(Boolean).join(' ')} data-map-planning-root>
      <MapComponent className="h-full w-full" onMapClick={planning.handleMapClick} />
      {showHint && (
        <div className="pointer-events-none absolute left-3 top-3 z-20">
          <span className="inline-flex items-center gap-1 rounded-lg border border-brand-200/80 bg-white/95 px-2.5 py-1 text-[11px] font-medium text-brand-800 shadow-sm backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            点击地图，AI 规划漫行方案
          </span>
        </div>
      )}
      <AIPlanningModal
        open={planning.modalOpen}
        anchor={planning.anchor}
        locationLabel={planning.locationLabel}
        query={planning.query}
        loading={planning.loading}
        error={planning.error}
        onQueryChange={planning.setQuery}
        onGenerate={() => void planning.generatePlan()}
        onCancel={planning.closeModal}
      />
    </div>
  );
}

export default function MapExpandPanel({ className = '' }: MapExpandPanelProps) {
  const reduceMotion = useReducedMotion();
  const location = useLocation();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const mapReady = hasDisplayableMap();
  const planning = useMapPlanningAssistant();
  const consumedHomeQuery = useRef(false);

  useEffect(() => {
    const planQuery = (location.state as MapPageState | null)?.planQuery?.trim();
    if (!planQuery || consumedHomeQuery.current) {
      return;
    }
    consumedHomeQuery.current = true;
    navigate(location.pathname, { replace: true, state: null });
    setExpanded(true);
    void planning.generateFromSearchQuery(planQuery);
  }, [location.pathname, location.state, navigate, planning]);

  useEffect(() => {
    if (!expanded) {
      return undefined;
    }
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setExpanded(false);
      }
    };
    window.addEventListener('keydown', onKeyDown, true);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown, true);
    };
  }, [expanded]);

  return (
    <>
      <motion.div
        className={[
          'relative overflow-hidden rounded-2xl border border-slate-200 shadow-sm',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        variants={scaleInVariants}
        initial="hidden"
        animate="visible"
        transition={motionTransition(reduceMotion)}
      >
        <MapPlanningLayer className="min-h-64" planning={planning} />
        {mapReady && (
          <motion.button
            type="button"
            onClick={() => setExpanded(true)}
            whileHover={reduceMotion ? undefined : { scale: 1.03 }}
            whileTap={reduceMotion ? undefined : { scale: 0.97 }}
            className="absolute right-3 top-3 z-20 inline-flex items-center gap-1 rounded-lg border border-white/80 bg-white/95 px-2.5 py-1.5 text-xs font-semibold text-slate-800 shadow-md backdrop-blur-sm"
            aria-label="全屏查看地图"
          >
            <Maximize2 className="h-3.5 w-3.5" aria-hidden />
            全屏
          </motion.button>
        )}
      </motion.div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            className="fixed inset-0 z-[70] flex flex-col bg-slate-900/50 p-3 backdrop-blur-sm sm:p-5"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={motionTransition(reduceMotion)}
            role="dialog"
            aria-modal="true"
            aria-label="全屏地图"
            onClick={() => setExpanded(false)}
          >
            <motion.div
              className="relative min-h-0 flex-1 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
              variants={modalPanelVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(event) => event.stopPropagation()}
            >
              <MapPlanningLayer className="h-full min-h-64 w-full" planning={planning} showHint={false} />
              <div className="pointer-events-none absolute left-3 top-14 z-20 sm:top-3">
                <MapProviderBadge />
              </div>
              <motion.button
                type="button"
                onClick={() => setExpanded(false)}
                whileTap={reduceMotion ? undefined : { scale: 0.95 }}
                className="pointer-events-auto absolute left-3 top-3 z-[100] inline-flex items-center gap-1 rounded-lg bg-slate-900/90 px-3 py-2 text-xs font-semibold text-white shadow-lg ring-2 ring-white/80"
                aria-label="关闭全屏地图"
              >
                <X className="h-4 w-4" aria-hidden />
                关闭
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
