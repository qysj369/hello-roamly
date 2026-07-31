import { normalizeViteBase } from './urls';

function originFromBase(base: string): string | null {
  try {
    if (!base.startsWith('http')) {
      return null;
    }
    return new URL(normalizeViteBase(base)).origin;
  } catch {
    return null;
  }
}

function originFromTemplate(template: string): string | null {
  try {
    const sample = template.includes('{url}')
      ? template.replace(/\{url\}/g, 'https://example.com/img.jpg')
      : template;
    return new URL(sample).origin;
  } catch {
    return null;
  }
}

export type CdnPreconnectInput = {
  assetCdnBase?: string;
  imageCdnTemplate?: string;
  includeAmap?: boolean;
};

/** 生成 index.html 用的 dns-prefetch / preconnect 标签 */
export function buildCdnPreconnectTags(input: CdnPreconnectInput = {}): string {
  const origins = new Set<string>();

  if (input.assetCdnBase) {
    const origin = originFromBase(input.assetCdnBase);
    if (origin) {
      origins.add(origin);
    }
  }

  if (input.imageCdnTemplate) {
    const origin = originFromTemplate(input.imageCdnTemplate);
    if (origin) {
      origins.add(origin);
    }
  }

  const lines: string[] = [];

  origins.forEach((origin) => {
    lines.push(`<link rel="dns-prefetch" href="${origin}" />`);
    lines.push(`<link rel="preconnect" href="${origin}" crossorigin />`);
  });

  if (input.includeAmap) {
    lines.push('<link rel="dns-prefetch" href="https://webapi.amap.com" />');
  }

  if (lines.length === 0) {
    return '';
  }

  return `\n    ${lines.join('\n    ')}\n  `;
}
