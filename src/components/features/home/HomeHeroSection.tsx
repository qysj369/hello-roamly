import { useFilteredGuides } from '@/hooks';
import { HomeHero } from '@/components/features/home';

export default function HomeHeroSection() {
  const { guides, total } = useFilteredGuides();
  const structuredCount = guides.filter((guide) => guide.kind === 'structured').length;

  return (
    <HomeHero guideCount={total || guides.length} structuredCount={structuredCount} />
  );
}
