import { useCallback } from 'react';
import { HomeSearch } from '@/components/features/home';
import { useUiStore } from '@/stores';

/**
 * 首页搜索区：提交后写入全局筛选词并跳转攻略库。
 */
export default function HomeSearchSection() {
  const setSearchQuery = useUiStore((state) => state.setSearchQuery);
  const handleCommit = useCallback((value: string) => setSearchQuery(value), [setSearchQuery]);

  return <HomeSearch onCommit={handleCommit} />;
}
