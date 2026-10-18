import { buildSearchPlanDouyinScenes } from '@/lib/home/searchPlanAssetPack';
import { drawCoverImage, wrapTextLines } from '@/lib/share/posterCanvas';
import type { SearchStructuredPlan } from '@/types/domain/searchStructuredPlan';

const REEL_WIDTH = 720;
const REEL_HEIGHT = 1280;
const DEFAULT_SCENE_MS = 2200;

export type SearchPlanDouyinVideo = {
  blob: Blob;
  filename: string;
};

function pickRecorderType(): { mime: string; ext: string } {
  const candidates = [
    { mime: 'video/mp4', ext: 'mp4' },
    { mime: 'video/webm;codecs=vp9', ext: 'webm' },
    { mime: 'video/webm;codecs=vp8', ext: 'webm' },
    { mime: 'video/webm', ext: 'webm' },
  ];
  const hit = candidates.find(
    (item) => typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(item.mime),
  );
  return hit ?? { mime: '', ext: 'webm' };
}

async function drawScene(
  ctx: CanvasRenderingContext2D,
  scene: { imageUrl: string; kicker: string; title: string; caption: string },
) {
  ctx.fillStyle = '#111827';
  ctx.fillRect(0, 0, REEL_WIDTH, REEL_HEIGHT);
  await drawCoverImage(ctx, scene.imageUrl, 0, 0, REEL_WIDTH, REEL_HEIGHT, 0);

  const fade = ctx.createLinearGradient(0, REEL_HEIGHT - 320, 0, REEL_HEIGHT);
  fade.addColorStop(0, 'rgba(0,0,0,0)');
  fade.addColorStop(1, 'rgba(0,0,0,0.66)');
  ctx.fillStyle = fade;
  ctx.fillRect(0, REEL_HEIGHT - 320, REEL_WIDTH, 320);

  ctx.fillStyle = 'rgba(255,255,255,0.82)';
  ctx.font = '600 22px system-ui, sans-serif';
  ctx.fillText(scene.kicker, 36, REEL_HEIGHT - 168);

  ctx.fillStyle = '#ffffff';
  ctx.font = '700 40px system-ui, sans-serif';
  wrapTextLines(ctx, scene.title, REEL_WIDTH - 72, 1).forEach((line) => {
    ctx.fillText(line, 36, REEL_HEIGHT - 118);
  });

  ctx.fillStyle = 'rgba(255,255,255,0.92)';
  ctx.font = '400 24px system-ui, sans-serif';
  wrapTextLines(ctx, scene.caption, REEL_WIDTH - 72, 2).forEach((line, index) => {
    ctx.fillText(line, 36, REEL_HEIGHT - 74 + index * 32);
  });
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

/** 把竖版氛围卡录成可保存到相册的短视频，画面不打品牌水印、不放二维码。 */
export async function recordSearchPlanDouyinReel(
  plan: SearchStructuredPlan,
  options?: { sceneMs?: number },
): Promise<SearchPlanDouyinVideo> {
  const scenes = buildSearchPlanDouyinScenes(plan);
  if (!scenes.length) {
    throw new Error('没有可导出的画面');
  }

  const canvas = document.createElement('canvas');
  canvas.width = REEL_WIDTH;
  canvas.height = REEL_HEIGHT;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('无法创建画布');
  }
  if (typeof canvas.captureStream !== 'function' || typeof MediaRecorder === 'undefined') {
    throw new Error('这台设备不能导出视频');
  }

  const { mime, ext } = pickRecorderType();
  const stream = canvas.captureStream(30);
  const recorder = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
  const chunks: Blob[] = [];
  recorder.addEventListener('dataavailable', (event) => {
    if (event.data.size > 0) chunks.push(event.data);
  });

  const finished = new Promise<Blob>((resolve, reject) => {
    recorder.addEventListener('stop', () => {
      stream.getTracks().forEach((track) => track.stop());
      resolve(new Blob(chunks, { type: recorder.mimeType || mime || 'video/webm' }));
    });
    recorder.addEventListener('error', () => reject(new Error('视频导出失败')));
  });

  recorder.start(200);
  const sceneMs = options?.sceneMs ?? DEFAULT_SCENE_MS;
  for (const scene of scenes) {
    await drawScene(ctx, scene);
    await wait(sceneMs);
  }
  if (recorder.state === 'recording') {
    recorder.stop();
  }
  const blob = await finished;
  if (!blob.size) {
    throw new Error('视频导出失败');
  }
  return { blob, filename: `漫游.${ext}` };
}
