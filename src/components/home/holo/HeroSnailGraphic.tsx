/**
 * 首页 Hero 插画 — 锁定 PNG 定稿（勿再改图形）
 * 本期固化：外层轻柔浮动；触角摆动 / 地球本体自转 → 二期（需分层素材）。
 * 低端机由 softMotion=false 降级为静态。
 */
import snailDragEarth from '@/assets/snail-drag-earth.png';

type HeroSnailGraphicProps = {
  className?: string;
  /** false 时关闭浮动，展示静态线稿 */
  softMotion?: boolean;
};

export default function HeroSnailGraphic({
  className = '',
  softMotion = true,
}: HeroSnailGraphicProps) {
  return (
    <div
      className={`holo-home__snail-deco snail-earth-container${softMotion ? '' : ' is-static'} ${className}`.trim()}
      aria-hidden
    >
      <img
        src={snailDragEarth}
        alt="蜗牛旅行"
        className="holo-home__snail-img"
        width={837}
        height={377}
        draggable={false}
      />
    </div>
  );
}
