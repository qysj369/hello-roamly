import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('dist-new-build');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const jsMatch = html.match(/assets\/(index-[^"']+\.js)/);
const cssMatch = html.match(/assets\/(style-[^"']+\.css)/);
console.log('index.html js =', jsMatch?.[1] ?? 'missing');
console.log('index.html css =', cssMatch?.[1] ?? 'missing');

if (!jsMatch) process.exit(1);
const js = fs.readFileSync(path.join(root, 'assets', jsMatch[1]), 'utf8');
const needles = [
  '极简于心，慢行致远',
  '缓步山河',
  '山野慢行',
  '秘境漫游',
  '路慢，方能读懂山河',
  '把旅行慢下来',
  '小众路线',
];
for (const s of needles) {
  console.log(js.includes(s) ? 'HIT' : 'MISS', s);
}
