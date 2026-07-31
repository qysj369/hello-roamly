import { useEffect, useState } from 'react';
import {
  STRUCTURED_GUIDE_SECTIONS,
  type StructuredGuideSectionId,
} from '@/lib/guides/structuredGuideSections';

/** 展示器板块导航 — 根据滚动位置高亮当前板块 */
export function useStructuredGuideSectionSpy(enabled = true) {
  const [activeSectionId, setActiveSectionId] = useState<StructuredGuideSectionId | null>(
    STRUCTURED_GUIDE_SECTIONS[0]?.id ?? null,
  );

  useEffect(() => {
    if (!enabled || typeof IntersectionObserver === 'undefined') {
      return undefined;
    }

    const sectionIds = STRUCTURED_GUIDE_SECTIONS.map((section) => section.id);
    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => element !== null);

    if (elements.length === 0) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        const nextId = visible[0]?.target.id;
        if (nextId && sectionIds.includes(nextId as StructuredGuideSectionId)) {
          setActiveSectionId(nextId as StructuredGuideSectionId);
        }
      },
      { rootMargin: '-15% 0px -55% 0px', threshold: [0, 0.2, 0.5, 0.8] },
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [enabled]);

  return activeSectionId;
}
