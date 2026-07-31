import { mkdir, readFile, writeFile, access } from 'node:fs/promises';
import path from 'node:path';
import type { DriveVideoMeta } from '@/types/api/driveVideos';

export type DriveVideosDb = {
  items: DriveVideoMeta[];
};

const DEFAULT_DB: DriveVideosDb = { items: [] };

function rootDataDir(rootDir: string): string {
  return path.join(rootDir, 'server', '.data', 'drive-videos');
}

function metaPath(rootDir: string): string {
  return path.join(rootDataDir(rootDir), 'meta.json');
}

export function driveVideoFilePath(rootDir: string, fileName: string): string {
  return path.join(rootDataDir(rootDir), 'files', fileName);
}

export async function ensureDriveVideoDirs(rootDir: string): Promise<void> {
  await mkdir(path.join(rootDataDir(rootDir), 'files'), { recursive: true });
}

export async function readDriveVideosDb(rootDir: string): Promise<DriveVideosDb> {
  try {
    const raw = await readFile(metaPath(rootDir), 'utf8');
    const parsed = JSON.parse(raw) as Partial<DriveVideosDb>;
    return { items: Array.isArray(parsed.items) ? parsed.items : [] };
  } catch {
    return { ...DEFAULT_DB, items: [] };
  }
}

export async function writeDriveVideosDb(rootDir: string, db: DriveVideosDb): Promise<void> {
  await ensureDriveVideoDirs(rootDir);
  await writeFile(metaPath(rootDir), JSON.stringify(db, null, 2), 'utf8');
}

export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

export function newDriveVideoId(): string {
  return `dv-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function extFromMime(mimeType: string, fallbackName: string): string {
  if (mimeType.includes('webm')) {
    return '.webm';
  }
  if (mimeType.includes('quicktime') || fallbackName.toLowerCase().endsWith('.mov')) {
    return '.mov';
  }
  return '.mp4';
}
