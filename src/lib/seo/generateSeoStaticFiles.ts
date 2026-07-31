import { writeFileSync } from 'node:fs';
import path from 'node:path';
import {
  collectSitemapEntries,
  getSiteOriginForBuild,
  renderRobotsTxt,
  renderSitemapXml,
} from './sitemap';

/** 将 sitemap.xml / robots.txt 写入 public/（dev 启动与 build 时调用） */
export function generateSeoStaticFiles(projectRoot: string): void {
  const origin = getSiteOriginForBuild();
  const publicDir = path.join(projectRoot, 'public');
  const entries = collectSitemapEntries();

  writeFileSync(path.join(publicDir, 'sitemap.xml'), renderSitemapXml(origin, entries), 'utf-8');
  writeFileSync(path.join(publicDir, 'robots.txt'), renderRobotsTxt(origin), 'utf-8');
}
