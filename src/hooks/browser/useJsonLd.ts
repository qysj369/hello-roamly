import { useEffect } from 'react';
import { applyJsonLd } from '@/lib/seo/jsonLd/applyJsonLd';

/**
 * 在 <head> 注入 JSON-LD；data 为 null 时清除。
 * graph 对象建议在 useMemo 中稳定引用。
 */
export function useJsonLd(id: string, data: Record<string, unknown> | null) {
  useEffect(() => {
    return applyJsonLd(id, data);
  }, [id, data]);
}
