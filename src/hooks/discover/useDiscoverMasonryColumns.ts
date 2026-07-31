import { useEffect, useState } from 'react';
import { getDiscoverMasonryColumnCount } from '@/utils/discoverMasonry';

export function useDiscoverMasonryColumns() {
  const [columnCount, setColumnCount] = useState<number>(() =>
    typeof window !== 'undefined' ? getDiscoverMasonryColumnCount(window.innerWidth) : 2,
  );

  useEffect(() => {
    const update = () => {
      setColumnCount(getDiscoverMasonryColumnCount(window.innerWidth));
    };

    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return columnCount;
}
