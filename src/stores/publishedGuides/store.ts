import { create } from 'zustand';
import { ensureCuratedPublishedGuidesSeeded } from '@/services/guides/seedCuratedGuides';
import { writePublishedGuidesToStorage } from '@/stores/publishedGuides/storage';
import type { PublishedGuideRecord } from '@/types/domain/guidePublish';
import type { Guide } from '@/types/domain/guide';

type PublishedGuidesState = {
  items: PublishedGuideRecord[];
  hydrated: boolean;
  hydrate: () => void;
  addGuide: (record: PublishedGuideRecord) => void;
  getGuideById: (id: string) => PublishedGuideRecord | undefined;
  listMeta: () => Guide[];
};

export const usePublishedGuidesStore = create<PublishedGuidesState>((set, get) => ({
  items: [],
  hydrated: false,

  hydrate: () => {
    if (get().hydrated) {
      return;
    }
    const items = ensureCuratedPublishedGuidesSeeded();
    set({ items, hydrated: true });
  },
  addGuide: (record) => {
    set((state) => {
      const items = [record, ...state.items.filter((item) => item.id !== record.id)];
      writePublishedGuidesToStorage(items);
      return { items };
    });
  },

  getGuideById: (id) => get().items.find((item) => item.id === id),

  listMeta: () => get().items.map((item) => item.listMeta),
}));
