import { Navigate, useLocation } from 'react-router-dom';
import { paths } from '@/router/paths';

/** 旧 `/map` 入口 — 重定向到首页地图驾驶舱，保留 location.state（如 planQuery） */
export default function MapRedirectPage() {
  const location = useLocation();
  return <Navigate to={paths.home} replace state={location.state} />;
}
