const STAR_SRC = `${import.meta.env.BASE_URL}assets/spiral-home-stars.svg`;

/** 东方意境氛围层：星空底图 + 明月清辉 + 星尘 + 两条错开的流星 */
export default function SpiralHomeAtmosphere() {
  return (
    <div className="spiral-home__atmosphere" aria-hidden>
      <div className="spiral-home__stars" style={{ backgroundImage: `url(${STAR_SRC})` }} />
      <div className="spiral-home__galaxy" />
      <div className="spiral-home__stardust" />
      <div className="spiral-home__moon-halo" />
      <div className="spiral-home__moon" />
      <div className="spiral-home__moon-spill" />
      <div className="spiral-home__star-flow" aria-hidden>
        <i />
        <i />
        <i />
        <i />
        <i />
        <i />
        <i />
        <i />
        <i />
        <i />
        <i />
        <i />
      </div>
      <div className="spiral-home__glow" />
      <div className="spiral-home__mist" />
      <div className="spiral-home__clouds" />
      <div className="spiral-home__meteor spiral-home__meteor--a" />
      <div className="spiral-home__meteor spiral-home__meteor--b" />
      <div className="spiral-home__vignette" />
    </div>
  );
}
