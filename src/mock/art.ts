/**
 * Draws a clean, flat product "packshot" as SVG for the seed catalog.
 * Self-contained (no imports) so the Node script can run it directly.
 */
type Pack = 'box' | 'bottle' | 'syrup' | 'tube' | 'pump' | 'spray' | 'dropper' | 'jar' | 'sachet' | 'device' | 'effervescent';

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Mixes a hex colour with white (t=0 → colour, t=1 → white). */
function tint(hex: string, t: number): string {
  const n = parseInt(hex.slice(1), 16);
  const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => Math.round(v + (255 - v) * t));
  return `#${c.map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}
function shade(hex: string, t: number): string {
  const n = parseInt(hex.slice(1), 16);
  const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => Math.round(v * (1 - t)));
  return `#${c.map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

/** Splits a label into at most two lines of ~maxChars. */
function lines(label: string, maxChars: number): string[] {
  const words = label.split(' ');
  const out: string[] = [''];
  for (const w of words) {
    const cur = out[out.length - 1];
    if (cur && (cur + ' ' + w).length > maxChars && out.length < 2) out.push(w);
    else out[out.length - 1] = cur ? `${cur} ${w}` : w;
  }
  return out;
}

function labelText(cx: number, y: number, label: string, strength: string | undefined, brand: string, tone: string, width: number) {
  const max = Math.max(7, Math.floor(width / 17));
  const ls = lines(label, max);
  const size = Math.min(34, Math.floor((width * 1.7) / Math.max(...ls.map((l) => l.length), 6)));
  let s = `<text x="${cx}" y="${y}" text-anchor="middle" font-family="Inter,Segoe UI,Arial,sans-serif" font-size="13" font-weight="700" letter-spacing="2.5" fill="${tone}">${esc(brand.toUpperCase())}</text>`;
  ls.forEach((l, i) => {
    s += `<text x="${cx}" y="${y + 34 + i * (size + 4)}" text-anchor="middle" font-family="Inter,Segoe UI,Arial,sans-serif" font-size="${size}" font-weight="800" fill="#0B1F5C">${esc(l)}</text>`;
  });
  if (strength) {
    const sy = y + 34 + ls.length * (size + 4) + 6;
    const w = Math.max(70, strength.length * 10 + 24);
    s += `<rect x="${cx - w / 2}" y="${sy - 18}" width="${w}" height="28" rx="14" fill="${tone}"/>`;
    s += `<text x="${cx}" y="${sy + 1}" text-anchor="middle" font-family="Inter,Segoe UI,Arial,sans-serif" font-size="15" font-weight="700" fill="#fff">${esc(strength)}</text>`;
  }
  return s;
}

/** Small infinity mark used as the house logo on packs. */
const mark = (x: number, y: number, s: number) =>
  `<g transform="translate(${x} ${y}) scale(${s})" fill="none" stroke-width="5" stroke-linecap="round"><path d="M0 0c-8-10-22-10-22 0s14 10 22 0 22-10 22 0-14 10-22 0z" stroke="url(#mk)"/></g>`;

export function productArt(opts: { pack: Pack; label: string; strength?: string; brand: string; tone: string }): string {
  const { pack, label, strength, brand, tone } = opts;
  const bg1 = tint(tone, 0.86);
  const bg2 = tint(tone, 0.94);
  const dark = shade(tone, 0.25);
  let body = '';

  switch (pack) {
    case 'box': {
      body = `
        <path d="M150 170 L190 140 L490 140 L450 170 Z" fill="${tint(tone, 0.55)}"/>
        <path d="M450 170 L490 140 L490 460 L450 490 Z" fill="${dark}"/>
        <rect x="150" y="170" width="300" height="320" rx="6" fill="#fff"/>
        <rect x="150" y="170" width="300" height="56" fill="${tone}"/>
        <rect x="150" y="450" width="300" height="40" fill="${tint(tone, 0.7)}"/>
        ${mark(300, 198, 0.9)}
        ${labelText(300, 262, label, strength, brand, tone, 270)}`;
      break;
    }
    case 'sachet': {
      body = `
        <path d="M140 160 h320 l-8 20 l8 20 l-8 20 v240 l8 20 h-320 l8 -20 v-240 l-8 -20 l8 -20 z" fill="#fff"/>
        <rect x="140" y="160" width="320" height="50" fill="${tone}"/>
        <path d="M140 470 h320 v10 h-320z" fill="${tint(tone, 0.6)}"/>
        ${mark(300, 186, 0.9)}
        ${labelText(300, 250, label, strength, brand, tone, 280)}`;
      break;
    }
    case 'bottle':
    case 'effervescent': {
      const capH = pack === 'effervescent' ? 50 : 70;
      const x = pack === 'effervescent' ? 225 : 180;
      const w = pack === 'effervescent' ? 150 : 240;
      body = `
        <rect x="${x + 18}" y="${140}" width="${w - 36}" height="${capH}" rx="10" fill="${dark}"/>
        <rect x="${x + 18}" y="${140 + capH - 14}" width="${w - 36}" height="10" fill="${shade(tone, 0.4)}" opacity=".5"/>
        <rect x="${x}" y="${140 + capH}" width="${w}" height="${490 - 140 - capH}" rx="${pack === 'effervescent' ? 18 : 34}" fill="#fff"/>
        <rect x="${x}" y="${230}" width="${w}" height="210" fill="${tint(tone, 0.9)}"/>
        <rect x="${x}" y="${230}" width="${w}" height="8" fill="${tone}"/>
        <rect x="${x}" y="${432}" width="${w}" height="8" fill="${tone}"/>
        ${labelText(300, 270, label, strength, brand, tone, w - 30)}`;
      break;
    }
    case 'syrup': {
      body = `
        <rect x="255" y="120" width="90" height="56" rx="8" fill="${dark}"/>
        <path d="M265 176 h70 v24 q60 14 60 70 v190 q0 30 -30 30 h-130 q-30 0 -30 -30 v-190 q0 -56 60 -70 z" fill="${tint('#C27A1F', 0.15)}"/>
        <rect x="205" y="270" width="190" height="170" rx="8" fill="#fff"/>
        <rect x="205" y="270" width="190" height="10" fill="${tone}"/>
        ${labelText(300, 306, label, strength, brand, tone, 170)}`;
      break;
    }
    case 'tube': {
      body = `
        <rect x="262" y="440" width="76" height="60" rx="8" fill="${dark}"/>
        <path d="M200 130 h200 l-8 18 v262 q0 30 -30 30 h-124 q-30 0 -30 -30 v-262 z" fill="#fff"/>
        <rect x="200" y="122" width="200" height="16" rx="3" fill="${tint(tone, 0.5)}"/>
        <rect x="208" y="160" width="184" height="12" fill="${tone}"/>
        ${labelText(300, 210, label, strength, brand, tone, 175)}`;
      break;
    }
    case 'pump': {
      body = `
        <rect x="285" y="96" width="30" height="60" fill="${dark}"/>
        <rect x="285" y="100" width="90" height="22" rx="6" fill="${dark}"/>
        <rect x="262" y="150" width="76" height="34" rx="8" fill="${dark}"/>
        <rect x="200" y="184" width="200" height="316" rx="36" fill="#fff"/>
        <rect x="200" y="250" width="200" height="190" fill="${tint(tone, 0.9)}"/>
        <rect x="200" y="250" width="200" height="8" fill="${tone}"/>
        ${labelText(300, 290, label, strength, brand, tone, 180)}`;
      break;
    }
    case 'spray': {
      body = `
        <rect x="262" y="110" width="76" height="80" rx="14" fill="${tint(tone, 0.4)}" opacity=".85"/>
        <rect x="280" y="190" width="40" height="20" fill="${dark}"/>
        <rect x="215" y="210" width="170" height="290" rx="40" fill="#fff"/>
        <rect x="215" y="270" width="170" height="180" fill="${tint(tone, 0.9)}"/>
        <rect x="215" y="270" width="170" height="8" fill="${tone}"/>
        ${labelText(300, 306, label, strength, brand, tone, 160)}`;
      break;
    }
    case 'dropper': {
      body = `
        <ellipse cx="300" cy="140" rx="26" ry="34" fill="${dark}"/>
        <rect x="262" y="168" width="76" height="62" rx="8" fill="#1d1d2b"/>
        <rect x="215" y="230" width="170" height="270" rx="26" fill="${tint('#C27A1F', 0.2)}"/>
        <rect x="225" y="280" width="150" height="170" rx="6" fill="#fff"/>
        <rect x="225" y="280" width="150" height="8" fill="${tone}"/>
        ${labelText(300, 314, label, strength, brand, tone, 140)}`;
      break;
    }
    case 'jar': {
      body = `
        <rect x="170" y="210" width="260" height="70" rx="14" fill="${dark}"/>
        <rect x="160" y="270" width="280" height="220" rx="30" fill="#fff"/>
        <rect x="160" y="300" width="280" height="160" fill="${tint(tone, 0.9)}"/>
        <rect x="160" y="300" width="280" height="8" fill="${tone}"/>
        ${labelText(300, 334, label, strength, brand, tone, 250)}`;
      break;
    }
    case 'device': {
      body = `
        <rect x="150" y="150" width="300" height="340" rx="48" fill="#fff"/>
        <rect x="185" y="190" width="230" height="130" rx="16" fill="#0B1F5C"/>
        <text x="300" y="275" text-anchor="middle" font-family="Consolas,Menlo,monospace" font-size="62" font-weight="700" fill="${tint(tone, 0.3)}">${pack === 'device' && /therm/i.test(label) ? '36.8°' : /oxim/i.test(label) ? '98%' : /gluco/i.test(label) ? '5.4' : '120/80'}</text>
        <circle cx="300" cy="460" r="0" />
        ${labelText(300, 350, label, strength, brand, tone, 250)}`;
      break;
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600">
  <defs>
    <radialGradient id="bg" cx="50%" cy="40%" r="75%"><stop offset="0" stop-color="${bg2}"/><stop offset="1" stop-color="${bg1}"/></radialGradient>
    <linearGradient id="mk" x1="0" x2="1"><stop offset="0" stop-color="#7A1FB8"/><stop offset="1" stop-color="#0672DF"/></linearGradient>
    <filter id="sh" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="16" stdDeviation="16" flood-color="#0B1F5C" flood-opacity=".18"/></filter>
  </defs>
  <rect width="600" height="600" fill="url(#bg)"/>
  <ellipse cx="300" cy="512" rx="190" ry="20" fill="#0B1F5C" opacity=".08"/>
  <g filter="url(#sh)">${body}</g>
</svg>`;
}

/** Category / brand tile: soft gradient with the name. */
export function tileArt(opts: { title: string; tone: string; icon?: string }): string {
  const { title, tone } = opts;
  void title;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${tint(tone, 0.75)}"/><stop offset="1" stop-color="${tint(tone, 0.92)}"/></linearGradient></defs>
  <rect width="600" height="600" fill="url(#g)"/>
  <circle cx="300" cy="300" r="150" fill="#fff" opacity=".85"/>
  <g transform="translate(300 300) scale(4)" fill="none" stroke-width="5" stroke-linecap="round"><path d="M0 0c-8-10-22-10-22 0s14 10 22 0 22-10 22 0-14 10-22 0z" stroke="${tone}"/></g>
</svg>`;
}
