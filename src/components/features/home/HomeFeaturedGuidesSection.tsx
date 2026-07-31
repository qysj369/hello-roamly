import { useMemo } from 'react';
import { HomeFeaturedGuides } from '@/components/features/home';
import { useFilteredGuides } from '@/hooks';

export default function HomeFeaturedGuidesSection() {
  const { guides } = useFilteredGuides();
  const featured = useMemo(() => guides.slice(0, 6), [guides]);

  return <HomeFeaturedGuides guides={featured} />;
}
