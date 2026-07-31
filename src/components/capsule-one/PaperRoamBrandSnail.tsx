import { PaperRoamSnailGlyph } from '@/components/capsule-one/paperRoamSnailGlyph';

/** 品牌角标旁的单只小蜗牛 */
export default function PaperRoamBrandSnail() {
  return (
    <span className="paper-roam-brand-snail" aria-hidden>
      <span className="paper-roam-brand-snail__figure">
        <PaperRoamSnailGlyph size={26} id="brand" tone="garden" className="paper-roam-brand-snail__glyph" />
      </span>
    </span>
  );
}
