import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { HomeHotCities } from '@/components/features/home';
import { HOME_MAP_TRAIL_SECTION_ID } from '@/lib/config/homeMapTrail';
import { paths } from '@/router/paths';
import { useHomeMapPlanningBarStore } from '@/stores/homeMapPlanningBar/store';

export default function HomeHotCitiesSection() {
  const navigate = useNavigate();
  const searchQuery = useHomeMapPlanningBarStore((state) => state.bar?.searchQuery ?? '');
  const onSearchChange = useHomeMapPlanningBarStore((state) => state.bar?.onSearchChange);
  const handleSelect = useCallback(
    (value: string) => {
      onSearchChange?.(value);
      navigate(paths.home, { replace: true, state: { seedQuery: value } });
      document.getElementById(HOME_MAP_TRAIL_SECTION_ID)?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    },
    [navigate, onSearchChange],
  );

  return <HomeHotCities activeQuery={searchQuery} onSelect={handleSelect} />;
}
