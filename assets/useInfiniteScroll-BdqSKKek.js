import { a as reactExports } from "./vendor-react-DtfH6MSw.js";
function useInfiniteScroll({
  onLoadMore,
  hasMore,
  isLoading,
  rootMargin = "240px",
  disabled = false
}) {
  const sentinelRef = reactExports.useRef(null);
  const onLoadMoreRef = reactExports.useRef(onLoadMore);
  reactExports.useEffect(() => {
    onLoadMoreRef.current = onLoadMore;
  }, [onLoadMore]);
  reactExports.useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || disabled || !hasMore) {
      return void 0;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!(entry == null ? void 0 : entry.isIntersecting) || isLoading || !hasMore) {
          return;
        }
        void onLoadMoreRef.current();
      },
      { rootMargin }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [disabled, hasMore, isLoading, rootMargin]);
  return { sentinelRef };
}
export {
  useInfiniteScroll as u
};
