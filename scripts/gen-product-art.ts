/**
 * Regenerates the drawn product/category/brand images from src/mock/catalog.ts.
 * Run: node scripts/gen-product-art.ts   (Node 22.6+ with type stripping)
 * Output: public/images/products/<slug>.svg (fallback drawings, no brand logos) and public/images/categories/*.svg.
 * Real photos go next to them as public/images/products/<slug>.jpg and take priority.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CATEGORIES, PRODUCTS } from '../src/mock/catalog.ts';
import { productArt, tileArt } from '../src/mock/art.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'images');
for (const d of ['products', 'categories']) mkdirSync(join(root, d), { recursive: true });

const catName = (k: string) => CATEGORIES.find((c) => c.key === k)!.name;
const catTone = (k: string) => CATEGORIES.find((c) => c.key === k)!.tone;

for (const p of PRODUCTS) {
  writeFileSync(join(root, 'products', `${p.slug}.svg`), productArt({ pack: p.pack, label: p.label, strength: p.strength, brand: catName(p.category), tone: catTone(p.category) }));
}
for (const c of CATEGORIES) writeFileSync(join(root, 'categories', `${c.key}.svg`), tileArt({ title: c.name, tone: c.tone }));
console.log(`Wrote ${PRODUCTS.length} product drawings and ${CATEGORIES.length} category tiles.`);
