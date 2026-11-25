/** Writes PRODUCT_PHOTOS.md: the photo file name expected for each product. Run: node scripts/list-photos.ts */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CATEGORIES, PRODUCTS } from '../src/mock/catalog.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const srcPath = join(root, 'photo-sources.json');
const sources: Record<string, { source: string }> = existsSync(srcPath) ? JSON.parse(readFileSync(srcPath, 'utf8')) : {};
const rows = PRODUCTS.map((p) => {
  const has = existsSync(join(root, 'public/images/products', `${p.slug}.jpg`));
  const cat = CATEGORIES.find((c) => c.key === p.category)!.name;
  const src = sources[p.slug]?.source ? new URL(sources[p.slug].source).hostname : '—';
  return `| ${has ? '✅' : '⬜'} | ${p.title} | ${cat} | AED ${p.sale ?? p.price} | \`${p.slug}.jpg\` | ${src} |`;
});
writeFileSync(
  join(root, 'PRODUCT_PHOTOS.md'),
  `# Product photos — Apex Aora Pharmacy

Product photos were collected from public pharmacy and retail websites (sources
listed below and in \`photo-sources.json\`). They belong to their brands. Before
launching publicly, replace them with official photos from your suppliers.
To change a photo, save a new image in
\`public/images/products/\` using the exact file name below. Square JPG images,
about 800×800 px on a white background, work best. Until a photo is there, the
site shows a neutral drawing instead.

Prices are estimates: review them in \`src/mock/catalog.ts\`, or in the
dashboard under Products.

| Photo | Product | Category | Price | File name | Photo source |
|---|---|---|---|---|---|
${rows.join('\n')}
`
);
console.log(`${rows.length} products listed in PRODUCT_PHOTOS.md`);
