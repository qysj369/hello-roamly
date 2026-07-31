/**
 * 首页 Hero 插画 — 蜗牛拖拽地球
 * 已锁定用户原图裁切版，禁止再改线条/重绘。
 * 仅允许调整外层容器尺寸、位置、外边距与 CSS 动画。
 */
import snailDragEarth from '@/assets/snail-drag-earth.png';

export default function HeroSnailGraphic({ className = '' }: { className?: string }) {
  return (
    <div className={`holo-home__snail-deco ${className}`.trim()} aria-hidden>
      <img
        src={snailDragEarth}
        alt=""
        className="holo-home__snail-img"
        width={837}
        height={377}
        draggable={false}
      />
    </div>
  );
}
