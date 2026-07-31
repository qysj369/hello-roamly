import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { generateSeoStaticFiles } from '../src/lib/seo/generateSeoStaticFiles';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

generateSeoStaticFiles(projectRoot);
console.log(`[seo] wrote public/sitemap.xml and public/robots.txt (origin: ${process.env.VITE_SITE_URL ?? 'default'})`);
