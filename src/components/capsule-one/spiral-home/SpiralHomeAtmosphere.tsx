const STAR_SRC = `${import.meta.env.BASE_URL}assets/spiral-home-stars.svg`;

/** 东方意境氛围层：星空底图 + 明月清辉 + 星尘 + 两条错开的流星 */
export default function SpiralHomeAtmosphere() {
  return (
    <div className="spiral-home__atmosphere" aria-hidden>
      <div className="spiral-home__stars" style={{ backgroundImage: `url(${STAR_SRC})` }} />
      <div className="spiral-home__bright-stars">
        <i style={{ top: '7%', left: '6%' }} />
        <i className="is-lg" style={{ top: '16%', left: '18%' }} />
        <i style={{ top: '28%', left: '4%' }} />
        <i className="is-lg" style={{ top: '62%', left: '8%' }} />
        <i style={{ top: '84%', left: '22%' }} />
        <i style={{ top: '90%', left: '46%' }} />
        <i className="is-lg" style={{ top: '8%', left: '48%' }} />
        <i style={{ top: '18%', left: '58%' }} />
        <i style={{ top: '5%', left: '72%' }} />
        <i className="is-lg" style={{ top: '78%', left: '64%' }} />
      </div>
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
