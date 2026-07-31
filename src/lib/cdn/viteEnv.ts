/** 供 vite.config 读取的环境变量（非 VITE_ 前缀也可在此扩展） */
export function readViteEnv(
  env: Record<string, string>,
  key: string,
): string | undefined {
  const raw = env[key];
  if (!raw?.trim()) {
    return undefined;
  }
  return raw.trim();
}
