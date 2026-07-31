export const WECHAT_POSTER_WIDTH = 540;
export const WECHAT_POSTER_HEIGHT = 960;

/** 小红书笔记常用 3:4 */
export const XHS_POSTER_WIDTH = 540;
export const XHS_POSTER_HEIGHT = 720;

export function loadPosterImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('图片加载失败'));
    img.src = src;
  });
}

export function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
): void {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

export function wrapTextLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number,
): string[] {
  const chars = [...text];
  const lines: string[] = [];
  let current = '';

  chars.forEach((char) => {
    const next = current + char;
    if (ctx.measureText(next).width > maxWidth && current) {
      lines.push(current);
      current = char;
    } else {
      current = next;
    }
  });

  if (current) {
    lines.push(current);
  }

  return lines.slice(0, maxLines);
}

export async function drawCoverImage(
  ctx: CanvasRenderingContext2D,
  coverUrl: string | undefined,
  x: number,
  y: number,
  width: number,
  height: number,
  radius = 0,
): Promise<void> {
  if (!coverUrl) {
    return;
  }

  try {
    const img = await loadPosterImage(coverUrl);
    const scale = Math.max(width / img.width, height / img.height);
    const drawW = img.width * scale;
    const drawH = img.height * scale;
    const offsetX = x + (width - drawW) / 2;
    const offsetY = y + (height - drawH) / 2;
    ctx.save();
    if (radius > 0) {
      roundRect(ctx, x, y, width, height, radius);
      ctx.clip();
    }
    ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
    ctx.restore();
  } catch {
    // 封面加载失败时保留背景
  }
}

export function canvasToPngBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('海报导出失败'));
        return;
      }
      resolve(blob);
    }, 'image/png');
  });
}
