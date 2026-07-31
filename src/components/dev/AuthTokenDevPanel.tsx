import { useEffect, useState } from 'react';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui';
import {
  clearStoredAccessToken,
  getEnvAccessToken,
  getStoredAccessToken,
  hasAccessToken,
  setStoredAccessToken,
} from '@/lib/api/auth';

/** 开发环境：本地 Bearer Token，供 axios 拦截器使用 */
export default function AuthTokenDevPanel() {
  const [value, setValue] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setValue(getStoredAccessToken() ?? '');
    setSaved(hasAccessToken());
  }, []);

  if (!import.meta.env.DEV) {
    return null;
  }

  const envToken = getEnvAccessToken();

  return (
    <Card className="mt-6 border-dashed border-amber-300 bg-amber-50/80 shadow-none">
      <CardHeader className="border-amber-200/80">
        <CardTitle className="text-amber-900">开发 · API Token</CardTitle>
        <CardDescription className="text-amber-800/90">
          保存后由 <code className="rounded bg-white/80 px-1">http</code> 自动附加{' '}
          <code className="rounded bg-white/80 px-1">Authorization: Bearer …</code>
          {envToken ? '（.env 中 VITE_API_TOKEN 已配置）' : ''}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <label htmlFor="dev-api-token" className="mb-1 block text-xs font-medium text-amber-900">
          Bearer Token
        </label>
        <input
          id="dev-api-token"
          type="password"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="粘贴 Bearer Token，仅存于本机 localStorage"
          autoComplete="off"
          className="block w-full rounded-lg border-amber-200 text-sm shadow-sm focus:border-amber-500 focus:ring-amber-500"
        />
        <div className="mt-3 flex flex-wrap gap-2">
          <Button
            size="sm"
            className="bg-amber-700 hover:bg-amber-800 focus-visible:ring-amber-600"
            onClick={() => {
              setStoredAccessToken(value);
              setSaved(hasAccessToken());
            }}
          >
            保存 Token
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              clearStoredAccessToken();
              setValue('');
              setSaved(false);
            }}
          >
            清除
          </Button>
        </div>
        <p className="mt-2 text-xs text-amber-700/90">
          状态：{saved ? '已配置 Token' : '未配置'} · 请勿将真实密钥提交到 Git
        </p>
      </CardContent>
    </Card>
  );
}
