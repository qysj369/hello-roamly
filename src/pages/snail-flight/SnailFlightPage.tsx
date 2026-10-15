import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import TravelAgentHost from '@/components/agent/TravelAgentHost';
import SnailFlightBookingDialog from '@/components/snail-flight/SnailFlightBookingDialog';
import SnailFlightLandingPanel from '@/components/snail-flight/SnailFlightLandingPanel';
import {
  SNAIL_FLIGHT_DEFAULT_DEST_ID,
  SNAIL_FLIGHT_DEFAULT_ORIGIN_ID,
} from '@/lib/snail-flight/cities';
import { buildSnailFlightRoute } from '@/lib/snail-flight/routes';
import { paths } from '@/router/paths';
import '@/styles/snail-flight.css';

const SnailFlightViewer = lazy(() => import('@/components/snail-flight/SnailFlightViewer'));

export default function SnailFlightPage() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const fromId = params.get('from') || SNAIL_FLIGHT_DEFAULT_ORIGIN_ID;
  const toId = params.get('to') || SNAIL_FLIGHT_DEFAULT_DEST_ID;
  const fast = params.get('fast') === '1';
  const route = useMemo(() => buildSnailFlightRoute(fromId, toId), [fromId, toId]);
  const [landed, setLanded] = useState(false);
  const [needForm, setNeedForm] = useState(!route);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add('snail-flight-active');
    return () => root.classList.remove('snail-flight-active');
  }, []);

  const exitHome = useCallback(() => {
    navigate(paths.home);
  }, [navigate]);

  const onLanded = useCallback(() => {
    setLanded(true);
  }, []);

  return (
    <div className="snail-flight">
      {needForm || !route ? (
        <SnailFlightBookingDialog
          onCancel={exitHome}
          onConfirm={(nextFrom, nextTo) => {
            setNeedForm(false);
            setLanded(false);
            setParams({ from: nextFrom, to: nextTo }, { replace: true });
          }}
        />
      ) : (
        <Suspense fallback={<p className="snail-flight__status">正在登机…</p>}>
          <SnailFlightViewer route={route} fast={fast} onExit={exitHome} onLanded={onLanded} />
        </Suspense>
      )}
      {landed && route ? <SnailFlightLandingPanel route={route} /> : null}
      {landed ? <TravelAgentHost /> : null}
    </div>
  );
}
