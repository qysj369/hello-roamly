import { execSync } from 'node:child_process';

process.env.VITE_APP_MODE = 'production';
process.env.VITE_SITE_URL = process.env.VITE_SITE_URL ?? 'https://helloroamly.com';
process.env.VITE_MAP_DEV_DEMO = '0';
process.env.VITE_HOME_LAYOUT = 'holo';
// Never ship DeepSeek keys in the browser bundle; use server DEEPSEEK_API_KEY only.
delete process.env.VITE_DEEPSEEK_API_KEY;

console.info('[holo-deploy-build] VITE_HOME_LAYOUT=holo');
execSync('node scripts/capsule-deploy-build.mjs', { stdio: 'inherit' });
