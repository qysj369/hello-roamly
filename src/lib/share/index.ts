export { buildShareUrl } from '@/lib/share/shareUrl';
export { isWechatInAppBrowser, getWechatShareHint } from '@/lib/share/wechat';
export { getXhsShareHint } from '@/lib/share/xhs';
export { downloadBlob, downloadBlobsSequential } from '@/lib/share/download';
export { renderSharePoster, renderTravelPlanPoster } from '@/lib/share/renderSharePoster';
export { renderXhsPoster } from '@/lib/share/renderXhsPoster';
export { renderXhsPosterSlides } from '@/lib/share/renderXhsPosterSlides';
export { createChinaPosterVariants, xhsSlideDownloadFilename } from '@/lib/share/chinaPosterVariants';
export { mapShareInputToXhs, hashtagsFromTags } from '@/lib/share/mapToXhsPoster';
export {
  formatXhsNoteForClipboard,
  copyXhsNoteToClipboard,
  xhsInputToCopyText,
} from '@/lib/share/xhsNoteCopy';
export type { SharePosterInput, TravelPlanPosterInput } from '@/lib/share/posterTypes';
export type { XhsPosterInput, SharePosterVariant, XhsNoteCopyText } from '@/lib/share/xhsPosterTypes';
