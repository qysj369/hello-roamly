import HomeHeroBrandHeader from '@/components/features/home/HomeHeroBrandHeader';

/** 首页品牌头区（提示词1） */
export default function HomeBrandSection() {
  return (
    <section className="flex justify-center py-2">
      <HomeHeroBrandHeader className="brand-header--plain max-w-lg" />
    </section>
  );
}
