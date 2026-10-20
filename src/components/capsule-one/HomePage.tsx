import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CapsuleOneScene from '@/components/capsule-one/CapsuleOneScene';
import { EarthFlyToProvider } from '@/components/capsule-one/EarthFlyToContext';
import { EarthRoamProvider } from '@/components/capsule-one/EarthRoamContext';
import SpiralHomeAtmosphere from '@/components/capsule-one/spiral-home/SpiralHomeAtmosphere';
import SpiralHomeButler from '@/components/capsule-one/spiral-home/SpiralHomeButler';
import SpiralHomeChrome from '@/components/capsule-one/spiral-home/SpiralHomeChrome';
import SpiralOrbitOverlay from '@/components/capsule-one/spiral-home/SpiralOrbitOverlay';
import SnailFlightBookingDialog from '@/components/snail-flight/SnailFlightBookingDialog';
import { usePageSeo } from '@/hooks/browser/usePageSeo';
import { homePageSeo } from '@/lib/seo';
import { useTravelAgentStore } from '@/stores/travelAgent/store';
import { paths } from '@/router/paths';
import '@/styles/capsule-one.css';
import '@/styles/spiral-home.css';
import '@/styles/snail-flight.css';

/** 螺旋蜗牛地球首页：3D 地球底层保留，UI 叠在画布上层 */
export default function CapsuleOneHomePage() {
  usePageSeo(homePageSeo());
  const navigate = useNavigate();
  const [booking, setBooking] = useState(false);
  const butlerOpen = useTravelAgentStore((state) => state.open);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add('capsule-one-active', 'spiral-home-active');
    return () => {
      root.classList.remove(
        'capsule-one-active',
        'spiral-home-active',
        'spiral-butler-open',
        'spiral-booking-open',
      );
    };
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('spiral-butler-open', butlerOpen && !booking);
  }, [butlerOpen, booking]);

  useEffect(() => {
    document.documentElement.classList.toggle('spiral-booking-open', booking);
  }, [booking]);

  const openBooking = () => {
    if (!window.matchMedia('(min-width: 1024px)').matches) {
      useTravelAgentStore.getState().closeChat();
    }
    setBooking(true);
  };
  const openButler = () => useTravelAgentStore.getState().openChat();

  return (
    <EarthRoamProvider>
      <EarthFlyToProvider>
        <div className="capsule-one-home capsule-one-home--cockpit spiral-home">
          <h1 className="sr-only">蜗牛旅行 HelloRoamly — 身未动，心已远</h1>
          <CapsuleOneScene onCitySelect={() => undefined} backdrop="#081428" autoRotate lowMemory />
          <SpiralHomeAtmosphere />
          <SpiralOrbitOverlay />
          <SpiralHomeChrome
            onLaunch={openBooking}
            onSearch={openButler}
            onExploreRoutes={openBooking}
          />
          <SpiralHomeButler onLaunch={openBooking} />
          {booking ? (
            <SnailFlightBookingDialog
              onCancel={() => setBooking(false)}
              onConfirm={(fromId, toId) => {
                setBooking(false);
                navigate(
                  `${paths.snailFlight}?from=${encodeURIComponent(fromId)}&to=${encodeURIComponent(toId)}`,
                );
              }}
            />
          ) : null}
        </div>
      </EarthFlyToProvider>
    </EarthRoamProvider>
  );
}
