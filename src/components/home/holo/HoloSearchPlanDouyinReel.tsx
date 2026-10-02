import { buildSearchPlanDouyinScenes } from '@/lib/home/searchPlanAssetPack';
import type { CityShareDouyinScript } from '@/data/cityShareSeedKit';
import type { SearchStructuredPlan } from '@/types/domain/searchStructuredPlan';

type HoloSearchPlanDouyinReelProps = {
  plan: SearchStructuredPlan;
  script?: CityShareDouyinScript | null;
  fullscreen?: boolean;
  onToggleFullscreen?: () => void;
};

export default function HoloSearchPlanDouyinReel({
  plan,
  script = null,
  fullscreen = false,
  onToggleFullscreen,
}: HoloSearchPlanDouyinReelProps) {
  const scenes = buildSearchPlanDouyinScenes(plan, script);
  const count = Math.max(scenes.length, 1);
  const label = script ? `抖音竖版卡片：${script.title}，可全屏后用系统录屏` : '抖音竖版动态游玩卡片，可全屏后用系统录屏';

  return (
    <div className={fullscreen ? 'holo-home__douyin-reel-layer is-full' : 'holo-home__douyin-reel-layer'}>
      <div
        className="holo-home__douyin-reel"
        role="img"
        aria-label={label}
        style={{ ['--reel-count' as string]: String(count) }}
      >
        <div className="holo-home__douyin-reel-track">
          {scenes.map((scene) => (
            <article key={`${scene.kicker}-${scene.title}`} className="holo-home__douyin-reel-scene">
              <img src={scene.imageUrl} alt="" />
              <div className="holo-home__douyin-reel-copy">
                <p className="holo-home__douyin-reel-kicker">{scene.kicker}</p>
                <p className="holo-home__douyin-reel-title">{scene.title}</p>
                <p className="holo-home__douyin-reel-caption">{scene.caption}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
      {fullscreen && onToggleFullscreen ? (
        <button type="button" className="holo-home__plan-ghost" onClick={onToggleFullscreen}>
          退出全屏
        </button>
      ) : null}
    </div>
  );
}
