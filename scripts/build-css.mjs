import postcss from 'postcss';
import tailwindPostcss from '@tailwindcss/postcss';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const inputPath = path.join(root, 'src', 'index.css');
const outDir = path.join(root, 'dist-good', 'assets');
const outPath = path.join(outDir, 'app.css');

fs.mkdirSync(outDir, { recursive: true });

const input = fs.readFileSync(inputPath, 'utf8');
const result = await postcss([tailwindPostcss()]).process(input, { from: inputPath });

fs.writeFileSync(outPath, result.css);

const cssOk =
  result.css.includes('.sr-only') ||
  result.css.includes('sr-only{') ||
  (result.css.includes('.flex') && result.css.includes('flex-direction'));

console.info('[build-css] done', {
  outPath,
  length: result.css.length,
  cssOk,
});

if (!cssOk) {
  process.exit(1);
}
