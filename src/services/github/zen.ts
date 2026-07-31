import { http } from '@/lib/api/http';

export async function fetchGithubZen(): Promise<string> {
  const { data } = await http.get<string>('https://api.github.com/zen', {
    headers: { Accept: 'text/plain' },
    responseType: 'text',
  });
  const text = typeof data === 'string' ? data.trim() : '';
  if (!text) {
    throw new Error('GitHub Zen API 返回为空');
  }
  return text;
}
