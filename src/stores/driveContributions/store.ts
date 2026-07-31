import { create } from 'zustand';
import { idbDeleteContribution, idbGetBlob, idbListMeta, idbPutContribution } from './idb';
import type { DriveContributionMeta, DriveContributionRecord } from './types';

type DriveContributionsState = {
  hydrated: boolean;
  items: DriveContributionRecord[];
  hydrate: () => Promise<void>;
  addContribution: (input: {
    cityLabel: string;
    title: string;
    file: File;
  }) => Promise<DriveContributionRecord>;
  removeContribution: (id: string) => Promise<void>;
  listForCity: (cityLabel: string) => DriveContributionRecord[];
  latestForCity: (cityLabel: string) => DriveContributionRecord | undefined;
};

const objectUrls = new Map<string, string>();

function rememberUrl(id: string, url: string) {
  const prev = objectUrls.get(id);
  if (prev) {
    URL.revokeObjectURL(prev);
  }
  objectUrls.set(id, url);
}

export const useDriveContributionsStore = create<DriveContributionsState>((set, get) => ({
  hydrated: false,
  items: [],

  async hydrate() {
    if (typeof indexedDB === 'undefined') {
      set({ hydrated: true, items: [] });
      return;
    }
    const metas = await idbListMeta();
    const items: DriveContributionRecord[] = [];
    for (const meta of metas) {
      const blob = await idbGetBlob(meta.id);
      if (!blob) {
        continue;
      }
      const objectUrl = URL.createObjectURL(blob);
      rememberUrl(meta.id, objectUrl);
      items.push({ ...meta, objectUrl });
    }
    set({ hydrated: true, items });
  },

  async addContribution({ cityLabel, title, file }) {
    const id = `drive-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const meta: DriveContributionMeta = {
      id,
      cityLabel: cityLabel.trim(),
      title: title.trim() || `${cityLabel} 漫游投稿`,
      createdAt: Date.now(),
      byteSize: file.size,
      mimeType: file.type || 'video/mp4',
    };
    await idbPutContribution(meta, file);
    const objectUrl = URL.createObjectURL(file);
    rememberUrl(id, objectUrl);
    const record: DriveContributionRecord = { ...meta, objectUrl };
    set((state) => ({ items: [record, ...state.items] }));
    return record;
  },

  async removeContribution(id) {
    await idbDeleteContribution(id);
    const url = objectUrls.get(id);
    if (url) {
      URL.revokeObjectURL(url);
      objectUrls.delete(id);
    }
    set((state) => ({ items: state.items.filter((item) => item.id !== id) }));
  },

  listForCity(cityLabel) {
    return get().items.filter((item) => item.cityLabel === cityLabel);
  },

  latestForCity(cityLabel) {
    return get().listForCity(cityLabel)[0];
  },
}));
