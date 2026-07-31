import type { DriveContributionMeta } from './types';

const DB_NAME = 'hello-roamly-drive-contributions';
const DB_VERSION = 1;
const META_STORE = 'meta';
const BLOB_STORE = 'blobs';

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error ?? new Error('IndexedDB 打开失败'));
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(META_STORE)) {
        const store = db.createObjectStore(META_STORE, { keyPath: 'id' });
        store.createIndex('byCity', 'cityLabel', { unique: false });
      }
      if (!db.objectStoreNames.contains(BLOB_STORE)) {
        db.createObjectStore(BLOB_STORE);
      }
    };
  });
}

function reqToPromise<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('IndexedDB 操作失败'));
  });
}

export async function idbListMeta(): Promise<DriveContributionMeta[]> {
  const db = await openDb();
  try {
    const tx = db.transaction(META_STORE, 'readonly');
    const rows = await reqToPromise(tx.objectStore(META_STORE).getAll());
    return (rows as DriveContributionMeta[]).sort((a, b) => b.createdAt - a.createdAt);
  } finally {
    db.close();
  }
}

export async function idbGetBlob(id: string): Promise<Blob | null> {
  const db = await openDb();
  try {
    const tx = db.transaction(BLOB_STORE, 'readonly');
    const blob = await reqToPromise(tx.objectStore(BLOB_STORE).get(id));
    return (blob as Blob | undefined) ?? null;
  } finally {
    db.close();
  }
}

export async function idbPutContribution(meta: DriveContributionMeta, blob: Blob): Promise<void> {
  const db = await openDb();
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction([META_STORE, BLOB_STORE], 'readwrite');
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error ?? new Error('保存投稿失败'));
      tx.objectStore(META_STORE).put(meta);
      tx.objectStore(BLOB_STORE).put(blob, meta.id);
    });
  } finally {
    db.close();
  }
}

export async function idbDeleteContribution(id: string): Promise<void> {
  const db = await openDb();
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction([META_STORE, BLOB_STORE], 'readwrite');
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error ?? new Error('删除投稿失败'));
      tx.objectStore(META_STORE).delete(id);
      tx.objectStore(BLOB_STORE).delete(id);
    });
  } finally {
    db.close();
  }
}
