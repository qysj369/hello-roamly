import { a as reactExports } from "./vendor-react-DtfH6MSw.js";
import { eU as useLocation, dv as isShareAnalyticsEnabled, dO as parseShareAttribution, eB as trackShareLandingView } from "./index-DwV1qlqh.js";
function useShareLandingTracking({
  contentKind,
  contentId
}) {
  const location = useLocation();
  reactExports.useEffect(() => {
    if (!isShareAnalyticsEnabled() || !contentId) {
      return;
    }
    const attribution = parseShareAttribution(location.search);
    if (!attribution) {
      return;
    }
    if (attribution.contentKind !== contentKind || attribution.contentId !== contentId) {
      return;
    }
    trackShareLandingView({
      contentKind: attribution.contentKind,
      contentId: attribution.contentId,
      channel: attribution.channel,
      shareUrl: typeof window !== "undefined" ? window.location.href : void 0
    });
  }, [contentKind, contentId, location.search]);
}
export {
  useShareLandingTracking as u
};
