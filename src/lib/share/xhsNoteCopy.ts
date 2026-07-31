import type { XhsNoteCopyText, XhsPosterInput } from '@/lib/share/xhsPosterTypes';

export function xhsInputToCopyText(input: XhsPosterInput): XhsNoteCopyText {
  return {
    title: input.title,
    body: input.body,
    hashtags: input.hashtags,
    shareUrl: input.shareUrl,
  };
}

export function formatXhsNoteForClipboard(text: XhsNoteCopyText): string {
  const tagLine = text.hashtags
    .map((tag) => `#${tag.replace(/^#/, '')}`)
    .join(' ');
  const parts = [text.title.trim(), '', text.body.trim()];
  if (tagLine) {
    parts.push('', tagLine);
  }
  if (text.shareUrl?.trim()) {
    parts.push('', text.shareUrl.trim());
  }
  return parts.join('\n').trim();
}

export async function copyXhsNoteToClipboard(text: XhsNoteCopyText): Promise<boolean> {
  if (typeof navigator === 'undefined' || !navigator.clipboard?.writeText) {
    return false;
  }
  try {
    await navigator.clipboard.writeText(formatXhsNoteForClipboard(text));
    return true;
  } catch {
    return false;
  }
}
