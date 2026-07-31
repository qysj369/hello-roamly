import { useFutureTravelMotion } from '@/hooks/browser/useFutureTravelMotion';
import { useLocation } from 'react-router-dom';

/** 挂载全站滚动渐入与 Hero 视差（路由变化时自动重扫板块） */
export default function FutureTravelMotion() {
  const location = useLocation();
  useFutureTravelMotion(true, location.pathname);
  return null;
}
