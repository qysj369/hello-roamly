import { Link } from 'react-router-dom';
import { homeHotCities } from '@/data/homeHotCities';
import { resolveCityCoverUrl } from '@/data/cityCoverImages';
import { CityCoverImage } from '@/components/features/home/CityCoverImage';
import { extractSearchDestination } from '@/lib/map/parseTrailSearchQuery';
import { paths } from '@/router/paths';
import { cn } from '@/utils/cn';

type HomeHotCitiesProps = {
  activeQuery: string;
  onSelect: (query: string) => void;
};

export default function HomeHotCities({ activeQuery, onSelect }: HomeHotCitiesProps) {
  const activeDestination = extractSearchDestination(activeQuery.trim());

  return (
    <section
      className="home-tech-panel rounded-2xl border border-slate-200/80 bg-white/95 p-4 shadow-sm sm:p-5"
      aria-labelledby="home-hot-cities-title"
    >
      <p className="font-mono text-xs uppercase tracking-[0.15em] text-emerald-700">快捷出发</p>
      <h2 id="home-hot-cities-title" className="mt-0.5 text-base font-bold text-slate-900 sm:text-lg">
        热门漫行目的地
      </h2>
      <p className="mt-1 text-xs text-slate-500">点城市填入搜索，地图自动定位并规划同类轨迹</p>

      <ul className="home-hot-city-grid mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        {homeHotCities.map((city) => {
          const isActive =
            activeQuery.trim() === city.query ||
            activeDestination === city.label ||
            activeQuery.includes(city.label);
          const coverUrl = resolveCityCoverUrl(city.label);

          return (
            <li key={city.id}>
              <button
                type="button"
                onClick={() => onSelect(city.query)}
                className={cn(
                  'home-hot-city-card group w-full overflow-hidden rounded-xl border text-left transition',
                  isActive
                    ? 'border-emerald-400/70 shadow-[0_0_20px_rgba(16,185,129,0.18)]'
                    : 'border-slate-200 hover:border-emerald-300/60 hover:shadow-md',
                )}
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                  <CityCoverImage
                    city={city.label}
                    src={coverUrl}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    fallbackTextClassName="text-lg"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/10 to-transparent" />
                  <p className="absolute bottom-2 left-2 text-sm font-bold text-white">{city.label}</p>
                </div>
                <div className="space-y-1.5 px-2.5 py-2">
                  <p className="text-[11px] font-semibold text-slate-700">
                    {city.days} · {city.budget}
                  </p>
                  <p className="line-clamp-1 text-[10px] text-slate-500">{city.tags.join(' · ')}</p>
                </div>
              </button>
            </li>
          );
        })}
      </ul>

      <p className="mt-3 text-center text-xs text-slate-500">
        更多目的地与标签在
        <Link to={paths.discover} className="mx-1 font-semibold text-violet-700 hover:underline">
          发现页
        </Link>
        浏览
      </p>
    </section>
  );
}
