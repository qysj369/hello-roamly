const STAR_SRC = `${import.meta.env.BASE_URL}assets/spiral-home-stars.svg`;

/** 静态星空底图。无粒子、无云海流动、无入场动画 */
export default function SpiralHomeAtmosphere() {
  return (
    <div className="spiral-home__atmosphere" aria-hidden>
      <div
        className="spiral-home__stars"
        style={{ backgroundImage: `url(${STAR_SRC})` }}
      />
      <div className="spiral-home__vignette" />
    </div>
  );
}
