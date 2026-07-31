import { a as reactExports } from "./vendor-react-DtfH6MSw.js";
import { eY as useParams, eO as useDemoUserProfileStore, f4 as useTravelMomentsStore, L as DEMO_CURRENT_USER_ID, ca as getCurrentDemoUser, bU as findUserById, dJ as normalizeTravelMoment } from "./index-DwV1qlqh.js";
const EMPTY_PUBLISHED_MOMENTS = [];
function useUserProfile(routeUserId) {
  const params = useParams();
  const resolvedId = params.userId;
  const profilePatch = useDemoUserProfileStore((state) => state.patch);
  const hydrateMoments = useTravelMomentsStore((state) => state.hydrate);
  const publishedMoments = useTravelMomentsStore(
    (state) => state.byUser[DEMO_CURRENT_USER_ID] ?? EMPTY_PUBLISHED_MOMENTS
  );
  reactExports.useEffect(() => {
    hydrateMoments();
  }, [hydrateMoments]);
  const user = reactExports.useMemo(() => {
    const base = !resolvedId || resolvedId === "me" ? getCurrentDemoUser() : findUserById(resolvedId);
    if (!base) {
      return void 0;
    }
    let merged = base;
    if (base.id === DEMO_CURRENT_USER_ID) {
      const seen = /* @__PURE__ */ new Set();
      const travelMoments = [...publishedMoments, ...base.travelMoments].map((moment) => normalizeTravelMoment(moment)).filter((moment) => {
        if (seen.has(moment.id)) {
          return false;
        }
        seen.add(moment.id);
        return true;
      }).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      merged = {
        ...base,
        ...profilePatch,
        travelMoments,
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
    }
    return merged;
  }, [resolvedId, profilePatch, publishedMoments]);
  const isOwnProfile = (user == null ? void 0 : user.id) === DEMO_CURRENT_USER_ID;
  return {
    user,
    isOwnProfile,
    isLoading: false
  };
}
export {
  useUserProfile as u
};
