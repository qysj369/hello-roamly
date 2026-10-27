import { execSync } from 'node:child_process';

process.env.VITE_APP_MODE = 'production';
process.env.VITE_SITE_URL = process.env.VITE_SITE_URL ?? 'https://helloroamly.com';
process.env.VITE_MAP_DEV_DEMO = '0';
// Empty string keeps the flight cockpit as the homepage.
// A leftover "holo" or "launch" value would publish the old light page instead.
process.env.VITE_HOME_LAYOUT = '';
process.env.VITE_HOME_LEGACY = '';
// Never ship DeepSeek keys in the browser bundle; use server DEEPSEEK_API_KEY only.
// Empty string blocks .env.local from injecting the real key into Vite.
process.env.VITE_DEEPSEEK_API_KEY = '';

console.info('[holo-deploy-build] VITE_HOME_LAYOUT=(default fly-view homepage)');
execSync('node scripts/capsule-deploy-build.mjs', { stdio: 'inherit' });
