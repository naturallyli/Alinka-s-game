/* Deutsch Party – décors kawaii pour les dessins-récompenses.
   Chaque décor est dessiné en SVG (600 × 600) puis les étiquettes allemandes
   (der / die / das + mot) sont ajoutées par-dessus.
   places = les mots de words.js qui utilisent ce décor dans la phrase
   (« Der Bär schläft im Schlafzimmer. »). */
'use strict';
(() => {
const O = '#4a3b6b';
const S = (w = 3.5) => `stroke="${O}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;
const st = S();
const C = { wood: '#f6c48f', woodD: '#e3a76b', pink: '#ffb3d1', pinkD: '#ff8fc1', lav: '#d9ccff', mint: '#bff0dc', sky: '#c4e8ff', yel: '#ffe08a', peach: '#ffd6b8', white: '#fffdf8', green: '#8fdc8a', greenD: '#62c07a', blue: '#a0c4ff', red: '#ff8a8a' };

// ---------------------------------------------------------------- petites pièces
const face = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><ellipse cx="-9" cy="0" rx="3.2" ry="4.2" fill="${O}"/><ellipse cx="9" cy="0" rx="3.2" ry="4.2" fill="${O}"/><circle cx="-8" cy="-1.6" r="1.2" fill="#fff"/><circle cx="10" cy="-1.6" r="1.2" fill="#fff"/><ellipse cx="-17" cy="7" rx="4.5" ry="2.6" fill="#ff9ec7" opacity=".85"/><ellipse cx="17" cy="7" rx="4.5" ry="2.6" fill="#ff9ec7" opacity=".85"/><path d="M-4 5 q2 3 4 0 q2 3 4 0" fill="none" stroke="${O}" stroke-width="2" stroke-linecap="round"/></g>`;
const heart = (x, y, s, fill) => `<path transform="translate(${x} ${y}) scale(${s})" d="M0 6 C-10 -2 -8 -10 -3 -10 C-1 -10 0 -8 0 -7 C0 -8 1 -10 3 -10 C8 -10 10 -2 0 6 Z" fill="${fill}"/>`;
const star = (x, y, r, fill) => { let d = ''; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r; d += (i ? 'L' : 'M') + (x + rr * Math.cos(a)).toFixed(1) + ' ' + (y + rr * Math.sin(a)).toFixed(1); } return `<path d="${d}Z" fill="${fill}"/>`; };
function dots(x0, y0, x1, y1, color, gap = 46) { let s = ''; let r = 0; for (let y = y0 + gap / 2; y < y1; y += gap, r++) for (let x = (r % 2 ? gap / 2 : 0) + gap / 4; x < x1; x += gap) s += `<circle cx="${x}" cy="${y}" r="4.5" fill="${color}"/>`; return s; }
function stripes(y0, y1, color, w = 26) { let s = ''; for (let x = 0; x < 600; x += w * 2) s += `<rect x="${x}" y="${y0}" width="${w}" height="${y1 - y0}" fill="${color}"/>`; return s; }
function garland(y = 84) {
  const cols = ['#ff8fc1', '#ffd25e', '#9fe3c8', '#a0c4ff', '#c9b3ff'];
  let s = `<path d="M-10 ${y} Q300 ${y + 52} 610 ${y}" fill="none" stroke="${O}" stroke-width="2.5"/>`;
  for (let i = 0; i < 13; i++) { const x = 12 + i * 48, t = (x + 10) / 620, yy = y + 52 * t * (1 - t); s += `<path d="M${x - 13} ${yy} L${x + 13} ${yy} L${x} ${yy + 22} Z" fill="${cols[i % 5]}" ${S(2.5)}/>`; }
  return s;
}
function room(wall, deco, pattern = 'dots', floor = '#f6d2a8', plank = '#e8b98a') {
  let seams = '';
  [[440, 480], [480, 525], [525, 570], [570, 600]].forEach(([a, b], i) => { for (let x = (i % 2) * 70 + 40; x < 600; x += 140) seams += `<line x1="${x}" y1="${a}" x2="${x}" y2="${b}" stroke="${plank}" stroke-width="3"/>`; });
  return `<rect width="600" height="440" fill="${wall}"/>${pattern === 'dots' ? dots(0, 96, 600, 430, deco) : pattern === 'tiles' ? tiles(0, 0, 600, 440, deco) : stripes(0, 440, deco)}
  <rect y="440" width="600" height="160" fill="${floor}"/>${[480, 525, 570].map(y => `<line x1="0" y1="${y}" x2="600" y2="${y}" stroke="${plank}" stroke-width="3"/>`).join('')}${seams}
  <rect x="-5" y="430" width="610" height="12" fill="#fff" ${st}/>${garland()}`;
}
function tiles(x0, y0, x1, y1, col, g = 40) { let s = ''; for (let x = x0 + g; x < x1; x += g) s += `<line x1="${x}" y1="${y0}" x2="${x}" y2="${y1}" stroke="${col}" stroke-width="2.5"/>`; for (let y = y0 + g; y < y1; y += g) s += `<line x1="${x0}" y1="${y}" x2="${x1}" y2="${y}" stroke="${col}" stroke-width="2.5"/>`; return s; }
let gid = 0;
function sky(top = '#a9dbff', bot = '#e9f7ff', horizon = 600) { const id = 'sk' + (gid++); return `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/><stop offset="1" stop-color="${bot}"/></linearGradient></defs><rect width="600" height="${horizon}" fill="url(#${id})"/>`; }
const sun = (x, y, r) => { let rays = ''; for (let i = 0; i < 10; i++) { const a = i * Math.PI / 5; rays += `<line x1="${x + Math.cos(a) * (r + 8)}" y1="${y + Math.sin(a) * (r + 8)}" x2="${x + Math.cos(a) * (r + 22)}" y2="${y + Math.sin(a) * (r + 22)}" stroke="#ffc93c" stroke-width="5" stroke-linecap="round"/>`; } return rays + `<circle cx="${x}" cy="${y}" r="${r}" fill="#ffe27a" ${st}/>` + face(x, y + 4, r / 26); };
const cloud = (x, y, s = 1, f = false) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-50 20 C-70 20 -70 -8 -46 -8 C-44 -32 -10 -36 -2 -16 C8 -36 46 -30 42 -6 C66 -6 66 20 46 20 Z" fill="#fff" ${st}/>${f ? face(0, 4, 0.8) : ''}</g>`;
const grass = (y, col = '#b4e8a6') => { let t = ''; for (let x = 20; x < 600; x += 62) t += `<path d="M${x} ${y + 40 + (x % 3) * 30} l6 -12 l6 12" fill="none" stroke="#7fcf7a" stroke-width="3" stroke-linecap="round"/>`; return `<rect y="${y}" width="600" height="${600 - y}" fill="${col}"/><line x1="0" y1="${y}" x2="600" y2="${y}" ${st}/>` + t; };

function windowEl(x, y, w, h, night = false, curt = C.pink) {
  const skyc = night ? '#7076c9' : '#c4e8ff';
  const inner = night
    ? `<circle cx="${x + w * 0.68}" cy="${y + h * 0.3}" r="${w * 0.12}" fill="#fff3a8"/><circle cx="${x + w * 0.75}" cy="${y + h * 0.25}" r="${w * 0.11}" fill="${skyc}"/>${star(x + w * 0.25, y + h * 0.22, 6, '#fff3a8')}${star(x + w * 0.35, y + h * 0.7, 5, '#fff3a8')}${star(x + w * 0.78, y + h * 0.72, 4, '#fff3a8')}`
    : `<circle cx="${x + w * 0.72}" cy="${y + h * 0.28}" r="${w * 0.1}" fill="#ffe27a"/><ellipse cx="${x + w * 0.3}" cy="${y + h * 0.72}" rx="${w * 0.16}" ry="${h * 0.07}" fill="#fff"/>`;
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="${skyc}"/>${inner}<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="none" ${st}/>
  <line x1="${x + w / 2}" y1="${y}" x2="${x + w / 2}" y2="${y + h}" ${st}/><line x1="${x}" y1="${y + h / 2}" x2="${x + w}" y2="${y + h / 2}" ${st}/>
  <rect x="${x - 10}" y="${y + h}" width="${w + 20}" height="12" rx="5" fill="#fff" ${st}/>
  <line x1="${x - 28}" y1="${y - 12}" x2="${x + w + 28}" y2="${y - 12}" ${S(5)}/>
  <path d="M${x - 24} ${y - 12} L${x + 14} ${y - 12} Q${x + 2} ${y + h * 0.5} ${x + 10} ${y + h + 6} L${x - 24} ${y + h + 6} Z" fill="${curt}" ${st}/>
  <path d="M${x + w + 24} ${y - 12} L${x + w - 14} ${y - 12} Q${x + w - 2} ${y + h * 0.5} ${x + w - 10} ${y + h + 6} L${x + w + 24} ${y + h + 6} Z" fill="${curt}" ${st}/>`;
}
function door(x, yb, w, h, col = '#c9b3ff') {
  const top = yb - h;
  return `<path d="M${x} ${yb} V${top + w / 2} A${w / 2} ${w / 2} 0 0 1 ${x + w} ${top + w / 2} V${yb} Z" fill="${col}" ${st}/>
  <rect x="${x + 14}" y="${top + w / 2 + 10}" width="${w - 28}" height="${h * 0.3}" rx="8" fill="none" ${S(2.5)}/><rect x="${x + 14}" y="${top + w / 2 + h * 0.3 + 24}" width="${w - 28}" height="${h * 0.3}" rx="8" fill="none" ${S(2.5)}/>
  ${heart(x + w / 2, top + w / 2 - 6, 1.3, C.pinkD)}<circle cx="${x + w - 16}" cy="${yb - h * 0.45}" r="6" fill="${C.yel}" ${S(2.5)}/>`;
}
function bed(x, yb, w = 280, blanket = C.pink) {
  let hs = ''; for (let i = 0; i < 5; i++) hs += heart(x + 150 + i * ((w - 190) / 4), yb - 70 + (i % 2) * 14, 1.1, '#fff');
  return `<rect x="${x + 8}" y="${yb - 16}" width="14" height="16" fill="${C.woodD}" ${st}/><rect x="${x + w - 24}" y="${yb - 16}" width="14" height="16" fill="${C.woodD}" ${st}/>
  <rect x="${x}" y="${yb - 190}" width="36" height="176" rx="16" fill="${C.wood}" ${st}/>${heart(x + 18, yb - 160, 1.1, C.pinkD)}
  <rect x="${x + w - 32}" y="${yb - 120}" width="32" height="106" rx="14" fill="${C.wood}" ${st}/>
  <rect x="${x + 26}" y="${yb - 70}" width="${w - 50}" height="40" rx="10" fill="#fff" ${st}/>
  <rect x="${x + 36}" y="${yb - 116}" width="92" height="46" rx="22" fill="#fff" ${st}/>
  <path d="M${x + 125} ${yb - 104} Q${x + 125 + (w - 160) / 2} ${yb - 118} ${x + w - 30} ${yb - 100} L${x + w - 30} ${yb - 36} L${x + 125} ${yb - 36} Z" fill="${blanket}" ${st}/>
  <path d="M${x + 125} ${yb - 104} Q${x + 125 + (w - 160) / 2} ${yb - 118} ${x + w - 30} ${yb - 100} L${x + w - 30} ${yb - 86} Q${x + 125 + (w - 160) / 2} ${yb - 104} ${x + 125} ${yb - 90} Z" fill="#fff" opacity=".6"/>${hs}`;
}
function lampFloor(x, yb, h = 220, shade = C.yel) {
  const t = yb - h;
  return `<ellipse cx="${x}" cy="${yb - 6}" rx="30" ry="8" fill="${C.lav}" ${st}/><line x1="${x}" y1="${yb - 8}" x2="${x}" y2="${t + 56}" ${S(5)}/>
  <path d="M${x - 46} ${t + 60} L${x - 28} ${t} L${x + 28} ${t} L${x + 46} ${t + 60} Z" fill="${shade}" ${st}/>${face(x, t + 34, 0.9)}`;
}
function lampHang(x, y0, len, shade = C.yel) {
  const b = y0 + len;
  return `<line x1="${x}" y1="${y0}" x2="${x}" y2="${b}" ${S(3)}/><path d="M${x - 48} ${b + 44} Q${x - 46} ${b - 6} ${x} ${b - 6} Q${x + 46} ${b - 6} ${x + 48} ${b + 44} Z" fill="${shade}" ${st}/>${face(x, b + 22, 0.85)}<ellipse cx="${x}" cy="${b + 46}" rx="14" ry="6" fill="#fff3a8" ${S(2.5)}/>`;
}
function table(x, yb, w, h = 95, col = C.wood, cloth = null) {
  return `<rect x="${x + 10}" y="${yb - h + 10}" width="14" height="${h - 10}" fill="${C.woodD}" ${st}/><rect x="${x + w - 24}" y="${yb - h + 10}" width="14" height="${h - 10}" fill="${C.woodD}" ${st}/>
  <rect x="${x - 8}" y="${yb - h}" width="${w + 16}" height="18" rx="7" fill="${col}" ${st}/>` +
  (cloth ? `<path d="M${x - 8} ${yb - h + 8} H${x + w + 8} V${yb - h + 34} ${Array.from({ length: 6 }, (_, i) => `Q${x + w + 8 - (i + 0.5) * (w + 16) / 6} ${yb - h + 48} ${x + w + 8 - (i + 1) * (w + 16) / 6} ${yb - h + 34}`).join(' ')} Z" fill="${cloth}" ${st}/>` : '');
}
function chair(x, yb, flip = false, col = C.wood, seat = C.pink) {
  const bx = flip ? x + 52 : x;
  return `<rect x="${x + 4}" y="${yb - 58}" width="10" height="58" fill="${C.woodD}" ${st}/><rect x="${x + 50}" y="${yb - 58}" width="10" height="58" fill="${C.woodD}" ${st}/>
  <rect x="${bx}" y="${yb - 150}" width="14" height="96" rx="7" fill="${col}" ${st}/><rect x="${x - 2}" y="${yb - 66}" width="68" height="14" rx="6" fill="${seat}" ${st}/>${heart(bx + 7, yb - 128, 0.9, C.pinkD)}`;
}
function rug(cx, cy, rx, ry, col = C.pink, col2 = '#fff') {
  let fr = ''; for (let i = -2; i <= 2; i++) { fr += `<line x1="${cx - rx}" y1="${cy + i * ry * 0.3}" x2="${cx - rx - 12}" y2="${cy + i * ry * 0.3}" ${S(2.5)}/><line x1="${cx + rx}" y1="${cy + i * ry * 0.3}" x2="${cx + rx + 12}" y2="${cy + i * ry * 0.3}" ${S(2.5)}/>`; }
  return fr + `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${col}" ${st}/><ellipse cx="${cx}" cy="${cy}" rx="${rx * 0.78}" ry="${ry * 0.65}" fill="none" stroke="${col2}" stroke-width="4" stroke-dasharray="10 8"/>`;
}
function picture(x, y, w, h) {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="#ffd25e" ${st}/><rect x="${x + 10}" y="${y + 10}" width="${w - 20}" height="${h - 20}" fill="#dff3ff" ${S(2.5)}/>
  <path d="M${x + 10} ${y + h - 10} L${x + w * 0.35} ${y + h * 0.42} L${x + w * 0.55} ${y + h * 0.66} L${x + w * 0.7} ${y + h * 0.5} L${x + w - 10} ${y + h - 10} Z" fill="${C.greenD}" ${S(2.5)}/><circle cx="${x + w * 0.72}" cy="${y + h * 0.32}" r="${h * 0.1}" fill="#ffb3a7"/>`;
}
function shelf(x, yb, w, h) {
  const t = yb - h, sh = [t + h * 0.33, t + h * 0.66];
  const bc = [C.pinkD, C.blue, C.yel, '#9fe3c8', '#c9b3ff', C.red];
  let books = '';
  [t, sh[0], sh[1]].forEach((y0, r) => { let bx = x + 14; for (let i = 0; i < 5; i++) { const bw = 14 + ((i + r) % 3) * 4, bh = h * 0.33 - 18 - ((i * 7 + r * 5) % 14); if (bx + bw > x + w - 12) break; books += `<rect x="${bx}" y="${y0 + h * 0.33 - bh - 2}" width="${bw}" height="${bh}" rx="3" fill="${bc[(i + r * 2) % 6]}" ${S(2.5)}/>`; bx += bw + 4; } });
  return `<rect x="${x}" y="${t}" width="${w}" height="${h}" rx="6" fill="${C.wood}" ${st}/><rect x="${x + 8}" y="${t + 8}" width="${w - 16}" height="${h - 16}" fill="#fbe3c6"/>${books}
  ${sh.map(y => `<rect x="${x}" y="${y}" width="${w}" height="8" fill="${C.woodD}" ${S(2.5)}/>`).join('')}<rect x="${x}" y="${t}" width="${w}" height="${h}" rx="6" fill="none" ${st}/>`;
}
function wardrobe(x, yb, w, h, col = C.mint) {
  const t = yb - h;
  return `<rect x="${x - 6}" y="${t - 14}" width="${w + 12}" height="18" rx="6" fill="${C.wood}" ${st}/><rect x="${x}" y="${t}" width="${w}" height="${h - 12}" rx="8" fill="${col}" ${st}/>
  <line x1="${x + w / 2}" y1="${t + 8}" x2="${x + w / 2}" y2="${yb - 20}" ${st}/><circle cx="${x + w / 2 - 10}" cy="${t + h * 0.5}" r="5" fill="${C.yel}" ${S(2.5)}/><circle cx="${x + w / 2 + 10}" cy="${t + h * 0.5}" r="5" fill="${C.yel}" ${S(2.5)}/>
  ${face(x + w / 2, t + 40, 1)}<rect x="${x + 8}" y="${yb - 14}" width="14" height="14" fill="${C.woodD}" ${S(2.5)}/><rect x="${x + w - 22}" y="${yb - 14}" width="14" height="14" fill="${C.woodD}" ${S(2.5)}/>`;
}
const plant = (x, yb, s = 1) => `<g transform="translate(${x} ${yb}) scale(${s})"><ellipse cx="-16" cy="-62" rx="12" ry="26" transform="rotate(-30 -16 -62)" fill="${C.greenD}" ${st}/><ellipse cx="16" cy="-62" rx="12" ry="26" transform="rotate(30 16 -62)" fill="${C.greenD}" ${st}/><ellipse cx="0" cy="-72" rx="12" ry="30" fill="${C.green}" ${st}/><path d="M-24 -40 L24 -40 L18 0 L-18 0 Z" fill="#ffab8a" ${st}/>${face(0, -20, 0.6)}</g>`;
function sofa(x, yb, w, col = C.lav) {
  return `<rect x="${x + 16}" y="${yb - 14}" width="14" height="14" fill="${C.woodD}" ${st}/><rect x="${x + w - 30}" y="${yb - 14}" width="14" height="14" fill="${C.woodD}" ${st}/>
  <rect x="${x + 20}" y="${yb - 150}" width="${w - 40}" height="90" rx="26" fill="${col}" ${st}/><rect x="${x}" y="${yb - 80}" width="${w}" height="68" rx="20" fill="${col}" ${st}/>
  <rect x="${x - 6}" y="${yb - 110}" width="42" height="98" rx="20" fill="${col}" ${st}/><rect x="${x + w - 36}" y="${yb - 110}" width="42" height="98" rx="20" fill="${col}" ${st}/>
  <rect x="${x + 50}" y="${yb - 128}" width="56" height="48" rx="16" fill="${C.pink}" ${st}/>${heart(x + 78, yb - 104, 1.1, '#fff')}<rect x="${x + w - 106}" y="${yb - 128}" width="56" height="48" rx="16" fill="${C.yel}" ${st}/>${star(x + w - 78, yb - 104, 9, '#fff')}`;
}
function stove(x, yb) {
  return `<rect x="${x}" y="${yb - 120}" width="110" height="120" rx="8" fill="#fff" ${st}/><rect x="${x + 16}" y="${yb - 80}" width="78" height="56" rx="8" fill="#ffe0cf" ${st}/>
  ${[0, 1, 2].map(i => `<circle cx="${x + 28 + i * 27}" cy="${yb - 102}" r="7" fill="${C.lav}" ${S(2.5)}/>`).join('')}
  <path d="M${x + 22} ${yb - 120} L${x + 22} ${yb - 168} Q${x + 55} ${yb - 178} ${x + 88} ${yb - 168} L${x + 88} ${yb - 120} Z" fill="${C.pinkD}" ${st}/><line x1="${x + 12}" y1="${yb - 160}" x2="${x + 22}" y2="${yb - 160}" ${S(4)}/><line x1="${x + 88}" y1="${yb - 160}" x2="${x + 98}" y2="${yb - 160}" ${S(4)}/>${face(x + 55, yb - 144, 0.9)}
  <path d="M${x + 40} ${yb - 186} q-8 -12 0 -24 q8 -12 0 -24" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round"/><path d="M${x + 70} ${yb - 186} q-8 -12 0 -24 q8 -12 0 -24" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round"/>`;
}
function fridge(x, yb, w = 110, h = 280) {
  const t = yb - h;
  return `<rect x="${x}" y="${t}" width="${w}" height="${h}" rx="18" fill="#dff3ff" ${st}/><line x1="${x}" y1="${t + h * 0.38}" x2="${x + w}" y2="${t + h * 0.38}" ${st}/>
  <line x1="${x + 16}" y1="${t + 30}" x2="${x + 16}" y2="${t + 70}" ${S(5)}/><line x1="${x + 16}" y1="${t + h * 0.38 + 20}" x2="${x + 16}" y2="${t + h * 0.38 + 70}" ${S(5)}/>
  ${face(x + w / 2 + 6, t + 56, 1)}${heart(x + 70, t + h * 0.6, 1.4, C.pinkD)}${star(x + 50, t + h * 0.75, 9, C.yel)}`;
}
function tub(x, yb, w) {
  let bub = ''; [[0.15, -2], [0.28, -12], [0.42, -4], [0.6, -14], [0.75, -3], [0.88, -10]].forEach(([f, dy], i) => { bub += `<circle cx="${x + w * f}" cy="${yb - 128 + dy}" r="${16 + (i % 3) * 5}" fill="#fff" ${S(2.5)}/>`; });
  return `<line x1="${x + 40}" y1="${yb - 130}" x2="${x + 40}" y2="${yb - 300}" ${S(6)}/><path d="M${x + 40} ${yb - 300} Q${x + 40} ${yb - 330} ${x + 80} ${yb - 330} L${x + 110} ${yb - 330}" fill="none" ${S(6)}/>
  <path d="M${x + 90} ${yb - 330} L${x + 130} ${yb - 330} L${x + 140} ${yb - 306} L${x + 80} ${yb - 306} Z" fill="${C.lav}" ${st}/>${[0, 1, 2].map(i => `<line x1="${x + 96 + i * 14}" y1="${yb - 296}" x2="${x + 92 + i * 14}" y2="${yb - 276}" stroke="#7fc8ff" stroke-width="4" stroke-linecap="round"/>`).join('')}
  ${bub}<path d="M${x} ${yb - 130} H${x + w} V${yb - 90} Q${x + w} ${yb - 30} ${x + w - 60} ${yb - 30} H${x + 60} Q${x} ${yb - 30} ${x} ${yb - 90} Z" fill="#fff" ${st}/>
  <rect x="${x + 50}" y="${yb - 32}" width="14" height="32" rx="5" fill="${C.yel}" ${st}/><rect x="${x + w - 64}" y="${yb - 32}" width="14" height="32" rx="5" fill="${C.yel}" ${st}/>
  <g transform="translate(${x + w - 50} ${yb - 136})"><ellipse cx="0" cy="0" rx="22" ry="14" fill="#ffe27a" ${st}/><circle cx="12" cy="-16" r="12" fill="#ffe27a" ${st}/><path d="M22 -16 l10 2 l-10 4 Z" fill="#ffab5c" ${S(2)}/><circle cx="14" cy="-19" r="2.2" fill="${O}"/></g>`;
}
function tree(x, yb, s = 1, f = true) {
  return `<g transform="translate(${x} ${yb}) scale(${s})"><rect x="-14" y="-110" width="28" height="110" rx="6" fill="#c98f5e" ${st}/>
  <circle cx="-40" cy="-130" r="44" fill="${C.green}" ${st}/><circle cx="40" cy="-130" r="44" fill="${C.green}" ${st}/><circle cx="0" cy="-170" r="54" fill="${C.green}" ${st}/>
  <rect x="-60" y="-140" width="120" height="40" fill="${C.green}"/><circle cx="-38" cy="-150" r="7" fill="${C.red}" ${S(2.5)}/><circle cx="44" cy="-118" r="7" fill="${C.red}" ${S(2.5)}/><circle cx="24" cy="-190" r="7" fill="${C.red}" ${S(2.5)}/>${f ? face(0, -140, 1.1) : ''}</g>`;
}
const flower = (x, yb, col = C.pinkD) => `<line x1="${x}" y1="${yb}" x2="${x}" y2="${yb - 34}" stroke="#62c07a" stroke-width="4"/>${[0, 72, 144, 216, 288].map(a => `<circle cx="${x + 9 * Math.cos(a * Math.PI / 180)}" cy="${yb - 40 + 9 * Math.sin(a * Math.PI / 180)}" r="7" fill="${col}" ${S(2)}/>`).join('')}<circle cx="${x}" cy="${yb - 40}" r="5" fill="${C.yel}" ${S(2)}/>`;
function house(x, yb, w, h, col = '#fff3c4', roof = C.red) {
  const t = yb - h;
  return `<rect x="${x + w * 0.68}" y="${t - 70}" width="28" height="60" fill="#c98f5e" ${st}/><rect x="${x}" y="${t}" width="${w}" height="${h}" fill="${col}" ${st}/>
  <path d="M${x - 20} ${t + 6} L${x + w / 2} ${t - 90} L${x + w + 20} ${t + 6} Z" fill="${roof}" ${st}/><circle cx="${x + w / 2}" cy="${t - 34}" r="16" fill="#c4e8ff" ${st}/>
  ${door(x + w / 2 - 30, yb, 60, 100, C.pinkD)}<rect x="${x + 18}" y="${t + 26}" width="50" height="46" rx="6" fill="#c4e8ff" ${st}/><rect x="${x + w - 68}" y="${t + 26}" width="50" height="46" rx="6" fill="#c4e8ff" ${st}/>
  <line x1="${x + 43}" y1="${t + 26}" x2="${x + 43}" y2="${t + 72}" ${S(2.5)}/><line x1="${x + w - 43}" y1="${t + 26}" x2="${x + w - 43}" y2="${t + 72}" ${S(2.5)}/>`;
}
function fence(x0, x1, yb, h = 56) { let s = `<rect x="${x0}" y="${yb - h * 0.7}" width="${x1 - x0}" height="10" fill="#fff" ${S(2.5)}/>`; for (let x = x0 + 6; x < x1; x += 32) s += `<path d="M${x} ${yb} V${yb - h + 10} L${x + 10} ${yb - h} L${x + 20} ${yb - h + 10} V${yb} Z" fill="#fff" ${S(2.5)}/>`; return s; }
function building(x, yb, w, h, col, win = '#fff3a8') {
  const t = yb - h; let wins = '';
  for (let y = t + 22; y < yb - 40; y += 46) for (let xx = x + 14; xx < x + w - 30; xx += 36) wins += `<rect x="${xx}" y="${y}" width="22" height="28" rx="4" fill="${win}" ${S(2.5)}/>`;
  return `<rect x="${x}" y="${t}" width="${w}" height="${h}" fill="${col}" ${st}/><rect x="${x - 6}" y="${t - 10}" width="${w + 12}" height="14" rx="4" fill="#fff" ${S(2.5)}/>${wins}`;
}
const bench = (x, yb) => `<rect x="${x}" y="${yb - 70}" width="130" height="14" rx="5" fill="${C.wood}" ${st}/><rect x="${x}" y="${yb - 48}" width="130" height="14" rx="5" fill="${C.wood}" ${st}/><rect x="${x + 12}" y="${yb - 34}" width="10" height="34" fill="#9aa0b5" ${st}/><rect x="${x + 108}" y="${yb - 34}" width="10" height="34" fill="#9aa0b5" ${st}/>`;
function street(y) { let d = ''; for (let x = 10; x < 600; x += 70) d += `<rect x="${x}" y="${y + 28}" width="38" height="6" rx="3" fill="#fff"/>`; return `<rect y="${y}" width="600" height="${600 - y}" fill="#b8b4c9"/><line x1="0" y1="${y}" x2="600" y2="${y}" ${st}/>` + d; }
function fountain(cx, yb) {
  return `<path d="M${cx} ${yb - 80} Q${cx - 50} ${yb - 150} ${cx - 80} ${yb - 60}" fill="none" stroke="#7fc8ff" stroke-width="6" stroke-linecap="round"/><path d="M${cx} ${yb - 80} Q${cx + 50} ${yb - 150} ${cx + 80} ${yb - 60}" fill="none" stroke="#7fc8ff" stroke-width="6" stroke-linecap="round"/>
  <rect x="${cx - 12}" y="${yb - 90}" width="24" height="50" fill="#e2e8ff" ${st}/><ellipse cx="${cx}" cy="${yb - 90}" rx="30" ry="8" fill="#bfe6ff" ${st}/>
  <path d="M${cx - 110} ${yb - 50} H${cx + 110} V${yb - 10} Q${cx + 110} ${yb} ${cx + 100} ${yb} H${cx - 100} Q${cx - 110} ${yb} ${cx - 110} ${yb - 10} Z" fill="#e2e8ff" ${st}/><rect x="${cx - 98}" y="${yb - 46}" width="196" height="12" fill="#7fc8ff"/>`;
}

// ---------------------------------------------------------------- décors
const SVG = {
  schlafzimmer: () => room('#e4dbff', '#f3eeff') + windowEl(380, 150, 140, 125, true) + picture(78, 158, 116, 82) + rug(445, 552, 100, 28, '#a0c4ff') + bed(36, 560, 300) + lampFloor(555, 560, 230) + star(260, 200, 12, '#fff3a8') + star(300, 240, 8, '#fff3a8'),
  kinderzimmer: () => room('#d9f5ea', '#c5eedd', 'stripes') + windowEl(250, 150, 130, 118, false, '#a0c4ff') + shelf(36, 560, 160, 290) + rug(250, 565, 85, 24, '#ffd6a5') + bed(320, 560, 250, '#a0c4ff') + star(470, 190, 14, '#ffd25e') + star(520, 240, 9, '#ff8fc1') + `<circle cx="225" cy="530" r="20" fill="${C.red}" ${st}/><path d="M205 530 Q225 520 245 530" fill="none" stroke="#fff" stroke-width="4"/>`,
  wohnzimmer: () => room('#ffe3d1', '#ffd2b8') + windowEl(430, 150, 130, 120, false, C.lav) + picture(205, 160, 140, 90) + rug(300, 560, 190, 30, C.pink) + sofa(150, 540, 300) + lampFloor(80, 545, 260) + plant(560, 555, 0.9),
  esszimmer: () => room('#fff3c4', '#ffe9a0', 'stripes') + wardrobe(26, 545, 130, 250) + door(500, 545, 88, 220) + lampHang(330, 100, 70, C.pink) + table(225, 545, 210, 100, C.wood, '#c9b3ff') + chair(160, 545, false) + chair(440, 545, true) + `<circle cx="300" cy="438" r="16" fill="#fff" ${st}/><circle cx="360" cy="438" r="16" fill="#fff" ${st}/>`,
  kueche: () => room('#d6f3ff', '#bfe6f7', 'tiles') +
    `<rect x="26" y="150" width="230" height="100" rx="8" fill="${C.mint}" ${st}/><line x1="103" y1="150" x2="103" y2="250" ${st}/><line x1="180" y1="150" x2="180" y2="250" ${st}/>${[64, 141, 218].map(x => `<line x1="${x}" y1="225" x2="${x}" y2="238" ${S(5)}/>`).join('')}` +
    windowEl(320, 150, 130, 115, false, C.yel) + `<rect x="26" y="430" width="170" height="115" rx="6" fill="${C.mint}" ${st}/><rect x="20" y="420" width="182" height="14" rx="5" fill="${C.wood}" ${st}/><line x1="111" y1="434" x2="111" y2="545" ${st}/>` + stove(196, 545) + fridge(468, 545),
  bad: () => room('#e2f6ff', '#bfe0f0', 'tiles') + windowEl(250, 140, 100, 95, false, '#9fe3c8') + door(486, 548, 90, 225, C.pink) +
    `<ellipse cx="400" cy="300" rx="44" ry="54" fill="#dff3ff" ${st}/><path d="M380 275 L392 263" stroke="#fff" stroke-width="5" stroke-linecap="round"/><path d="M350 380 H450 Q450 420 400 420 Q350 420 350 380 Z" fill="#fff" ${st}/><rect x="388" y="418" width="24" height="128" fill="#fff" ${st}/>` + tub(28, 552, 290) + rug(410, 572, 60, 16, '#9fe3c8'),
  garten: () => sky() + sun(520, 165, 34) + cloud(140, 160, 1, true) + cloud(330, 190, 0.8) + grass(390) + house(30, 430, 220, 160) + fence(260, 600, 430) + tree(480, 430, 0.9) + table(300, 560, 150, 82, C.wood, '#fff') + chair(480, 560, true, C.wood, C.yel) + flower(40, 590) + flower(80, 575, C.yel) + flower(560, 595, '#c9b3ff') + flower(250, 590, C.red),
  balkon: () => sky() + cloud(470, 150, 0.8, true) + building(240, 360, 90, 200, '#ffd6b8') + building(340, 360, 110, 160, '#d9ccff') + building(460, 360, 140, 220, '#bff0dc') +
    `<rect x="0" y="0" width="190" height="440" fill="#ffc8b0"/>${tiles(0, 0, 190, 440, '#f5b49a', 34)}<line x1="190" y1="0" x2="190" y2="440" ${st}/>` + door(48, 440, 100, 230, '#a0c4ff') +
    `<rect x="0" y="440" width="600" height="160" fill="#efe6ff"/>${tiles(0, 440, 600, 600, '#ddd0f7', 50)}<line x1="0" y1="440" x2="600" y2="440" ${st}/>` +
    `<rect x="190" y="350" width="410" height="12" rx="5" fill="#fff" ${st}/>${Array.from({ length: 13 }, (_, i) => `<rect x="${200 + i * 31}" y="362" width="8" height="78" fill="#fff" ${S(2.5)}/>`).join('')}` +
    plant(230, 470, 0.9) + table(420, 565, 110, 70, C.wood) + chair(330, 565, false, C.wood, '#9fe3c8') + plant(565, 560, 0.8),
  park: () => sky() + sun(80, 170, 30) + cloud(300, 150, 1, true) + cloud(490, 200, 0.7) + grass(360) + `<path d="M250 600 Q320 480 300 360 L340 360 Q370 480 400 600 Z" fill="#f6e2c0" ${st}/>` +
    tree(70, 420, 0.95) + tree(540, 410, 0.8, false) + `<ellipse cx="480" cy="510" rx="90" ry="34" fill="#9fd8ff" ${st}/>` +
    `<g transform="translate(470 498)"><ellipse cx="0" cy="0" rx="18" ry="11" fill="#fff" ${st}/><circle cx="12" cy="-12" r="9" fill="#fff" ${st}/><path d="M20 -12 l8 2 l-8 3Z" fill="#ffab5c"/><circle cx="14" cy="-14" r="1.8" fill="${O}"/></g>` +
    bench(90, 540) + flower(30, 590) + flower(200, 585, C.yel) + flower(560, 590, '#c9b3ff'),
  zoo: () => sky() + sun(530, 160, 28) + cloud(140, 170, 0.9, true) + grass(400) +
    `<rect x="40" y="200" width="44" height="240" rx="8" fill="#c98f5e" ${st}/><rect x="516" y="200" width="44" height="240" rx="8" fill="#c98f5e" ${st}/><path d="M30 210 Q300 120 570 210 L570 260 Q300 170 30 260 Z" fill="${C.green}" ${st}/>` +
    `${Array.from({ length: 8 }, (_, i) => `<circle cx="${70 + i * 66}" cy="${226 - Math.sin((i + 0.5) / 8 * Math.PI) * 45}" r="${7}" fill="${['#ff8fc1', '#ffd25e', '#a0c4ff', '#c9b3ff'][i % 4]}" ${S(2)}/>`).join('')}` +
    `<path d="M120 440 V380 M160 440 V380 M440 440 V380 M480 440 V380" ${S(6)}/><rect x="96" y="386" width="90" height="10" fill="#c98f5e" ${S(2.5)}/><rect x="416" y="386" width="90" height="10" fill="#c98f5e" ${S(2.5)}/>` +
    `<g transform="translate(150 360)"><path d="M0 0 C-20 -60 -10 -90 10 -110" fill="none" stroke="#c98f5e" stroke-width="14" stroke-linecap="round"/><path d="M10 -110 q-40 -10 -60 10 M10 -110 q40 -14 60 6 M10 -110 q-10 -40 -40 -40 M10 -110 q20 -36 44 -34" fill="none" stroke="#62c07a" stroke-width="12" stroke-linecap="round"/></g>` +
    `<path d="M300 600 Q290 500 300 420 L330 420 Q340 500 370 600 Z" fill="#f6e2c0" ${st}/>` + `<g opacity=".55">${[0, 1, 2, 3].map(i => `<g transform="translate(${470 + (i % 2) * 30} ${470 + i * 32})"><circle r="8" fill="#c98f5e"/><circle cx="-8" cy="-10" r="4" fill="#c98f5e"/><circle cx="0" cy="-13" r="4" fill="#c98f5e"/><circle cx="8" cy="-10" r="4" fill="#c98f5e"/></g>`).join('')}</g>` + flower(60, 590) + flower(220, 585, C.yel),
  schwimmbad: () => `<rect width="600" height="380" fill="#e2f6ff"/>${tiles(0, 90, 600, 380, '#c4e4f5')}${garland()}` +
    `<line x1="60" y1="370" x2="60" y2="170" ${S(6)}/><path d="M60 170 Q60 150 90 150 L110 150" fill="none" ${S(6)}/><path d="M92 150 L132 150 L140 172 L84 172 Z" fill="${C.lav}" ${st}/>${[0, 1, 2].map(i => `<line x1="98" y1="${182 + i * 0}" x2="${94 + i * 14}" y2="210" stroke="#7fc8ff" stroke-width="4" stroke-linecap="round"/>`).join('')}` +
    `<rect y="370" width="600" height="230" fill="#f3eee4"/><line x1="0" y1="370" x2="600" y2="370" ${st}/><rect x="30" y="395" width="540" height="190" rx="14" fill="#7fd0ff" ${st}/>` +
    [430, 480, 530].map(y => `<path d="M50 ${y} q20 -10 40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0" fill="none" stroke="#c4ecff" stroke-width="4" stroke-linecap="round"/>`).join('') +
    Array.from({ length: 26 }, (_, i) => `<circle cx="${46 + i * 20.5}" cy="490" r="6" fill="${i % 2 ? '#fff' : '#ff8fc1'}" ${S(2)}/>`).join('') +
    `<path d="M520 395 V330 M555 395 V330" ${S(6)}/>${[345, 365, 385].map(y => `<line x1="520" y1="${y}" x2="555" y2="${y}" ${S(5)}/>`).join('')}` +
    `<circle cx="180" cy="545" r="30" fill="${C.pinkD}" ${st}/><circle cx="180" cy="545" r="13" fill="#7fd0ff" ${st}/>${[0, 1, 2, 3].map(i => `<rect x="${176}" y="${511}" width="8" height="12" fill="#fff" transform="rotate(${i * 90} 180 545)"/>`).join('')}` +
    `<rect x="380" y="330" width="120" height="16" rx="6" fill="${C.yel}" ${st}/><rect x="470" y="346" width="16" height="24" fill="#c4c0d6" ${st}/>`,
  platz: () => sky() + cloud(150, 150, 0.9, true) + cloud(450, 140, 0.7) +
    building(0, 460, 110, 260, '#ff9a9a') + building(110, 460, 100, 220, '#ffd25e') + building(210, 460, 120, 290, '#a0c4ff') + building(330, 460, 100, 230, '#9fe3c8') + building(430, 460, 90, 270, '#ffb3d1') + building(520, 460, 90, 210, '#c9b3ff') +
    `<rect y="460" width="600" height="80" fill="#efe2cf"/><line x1="0" y1="460" x2="600" y2="460" ${st}/>${Array.from({ length: 30 }, (_, i) => `<circle cx="${(i * 47) % 600 + 10}" cy="${474 + (i * 13) % 56}" r="5" fill="#e0cfb5"/>`).join('')}` +
    fountain(300, 535) + tree(530, 535, 0.55) + street(540),
  schule: () => sky() + sun(530, 160, 28) + cloud(110, 150, 0.8, true) + `<rect y="440" width="600" height="160" fill="#e6dccc"/><line x1="0" y1="440" x2="600" y2="440" ${st}/>` +
    `<rect x="40" y="230" width="330" height="210" fill="#fff3c4" ${st}/><path d="M24 236 L205 150 L386 236 Z" fill="${C.red}" ${st}/><circle cx="205" cy="200" r="24" fill="#fff" ${st}/><line x1="205" y1="200" x2="205" y2="186" ${S(3)}/><line x1="205" y1="200" x2="216" y2="204" ${S(3)}/>` +
    [70, 130, 250, 310].map(x => `<rect x="${x}" y="262" width="40" height="44" rx="5" fill="#c4e8ff" ${st}/><rect x="${x}" y="336" width="40" height="44" rx="5" fill="#c4e8ff" ${st}/>`).join('') + door(175, 440, 60, 110, C.pinkD) +
    `<line x1="400" y1="440" x2="400" y2="240" ${S(4)}/><path d="M400 244 L450 258 L400 272 Z" fill="${C.pinkD}" ${S(2.5)}/>` +
    [[440, 560], [440, 520], [440, 480], [490, 500], [490, 540]].map(([x, y], i) => `<rect x="${x}" y="${y - 30}" width="46" height="38" fill="none" stroke="#fff" stroke-width="4"/>`).join('') +
    tree(540, 450, 0.6) + `<circle cx="120" cy="560" r="20" fill="${C.blue}" ${st}/>`,
  sporthalle: () => room('#ffeedd', '#ffe1c7', 'stripes', '#f2c993', '#dfac6e') +
    `<rect x="30" y="140" width="12" height="295" fill="${C.wood}" ${st}/><rect x="140" y="140" width="12" height="295" fill="${C.wood}" ${st}/>${Array.from({ length: 9 }, (_, i) => `<rect x="42" y="${160 + i * 31}" width="98" height="7" rx="3" fill="${C.wood}" ${S(2.5)}/>`).join('')}` +
    `<line x1="270" y1="110" x2="260" y2="250" ${S(3)}/><line x1="330" y1="110" x2="340" y2="250" ${S(3)}/><circle cx="260" cy="268" r="18" fill="none" stroke="${C.wood}" stroke-width="8"/><circle cx="340" cy="268" r="18" fill="none" stroke="${C.wood}" stroke-width="8"/>` +
    `<rect x="455" y="150" width="120" height="85" rx="6" fill="#fff" ${st}/><rect x="490" y="185" width="50" height="35" fill="none" stroke="${C.red}" stroke-width="4"/><ellipse cx="515" cy="240" rx="30" ry="7" fill="none" stroke="#ff8a3c" stroke-width="5"/><path d="M490 242 L500 285 L530 285 L540 242" fill="none" stroke="#fff" stroke-width="3"/>` +
    `<path d="M0 520 Q300 470 600 520" fill="none" stroke="#fff" stroke-width="5"/><rect x="60" y="500" width="200" height="60" rx="10" fill="#7fb3ff" ${st}/><line x1="126" y1="500" x2="126" y2="560" ${S(2.5)}/><line x1="193" y1="500" x2="193" y2="560" ${S(2.5)}/>` +
    `<circle cx="470" cy="555" r="24" fill="#ff9a4d" ${st}/><path d="M446 555 H494 M470 531 V579" ${S(2.5)}/>`,
  stadion: () => sky('#a9dbff', '#e9f7ff', 160) + cloud(470, 90, 0.7, true) +
    [0, 1, 2, 3].map(i => `<rect y="${150 + i * 45}" width="600" height="45" fill="${['#c9b3ff', '#ffb3d1', '#a0c4ff', '#ffd25e'][i]}" ${S(2.5)}/>`).join('') +
    Array.from({ length: 64 }, (_, i) => `<circle cx="${(i % 16) * 38 + 16 + (Math.floor(i / 16) % 2) * 18}" cy="${172 + Math.floor(i / 16) * 45}" r="9" fill="${['#ff8a8a', '#fff', '#ffe27a', '#9fe3c8', '#ffab8a'][i % 5]}" ${S(2)}/>`).join('') +
    `<rect y="330" width="600" height="270" fill="${C.green}"/>${[0, 1, 2, 3, 4, 5].map(i => `<rect x="${i * 100}" y="330" width="50" height="270" fill="#a3e59d"/>`).join('')}<line x1="0" y1="330" x2="600" y2="330" ${st}/>` +
    `<path d="M0 360 H600 M300 360 V600" stroke="#fff" stroke-width="5" fill="none"/><ellipse cx="300" cy="480" rx="90" ry="50" fill="none" stroke="#fff" stroke-width="5"/>` +
    `<rect x="480" y="360" width="110" height="80" fill="none" stroke="#fff" stroke-width="7"/>${tiles(483, 363, 587, 437, '#ffffffaa', 13)}<circle cx="420" cy="560" r="18" fill="#fff" ${st}/><circle cx="420" cy="560" r="6" fill="${O}"/>`,
  vehicule: (kind) => {
    const wall = { bus: '#fff3c4', tram: '#ffe0e6', ubahn: '#e2e8ff' }[kind];
    const seat = { bus: '#7fb3ff', tram: '#ff9a9a', ubahn: '#9fe3c8' }[kind];
    const out = kind === 'ubahn'
      ? `<rect x="40" y="150" width="520" height="150" fill="#4f4a78"/>${[0, 1, 2, 3, 4].map(i => `<rect x="${60 + i * 110}" y="${200 + (i % 2) * 40}" width="70" height="8" rx="4" fill="#ffe27a"/>`).join('')}`
      : `<rect x="40" y="150" width="520" height="150" fill="#c4e8ff"/>${building(60, 300, 80, 90, '#ffd6b8').replace(/stroke-width="3.5"/g, 'stroke-width="2"')}${building(180, 300, 70, 120, '#d9ccff')}${building(300, 300, 90, 80, '#bff0dc')}${tree(450, 300, 0.45, false)}${cloud(330, 185, 0.5)}`;
    return `<rect width="600" height="600" fill="${wall}"/>${garland()}${out}` +
      [40, 220, 400].map(x => `<rect x="${x}" y="150" width="160" height="150" rx="16" fill="none" ${st}/>`).join('') +
      `<path d="M0 140 H40 V310 H0 Z M200 140 H220 V310 H200 Z M380 140 H400 V310 H380 Z M560 140 H600 V310 H560 Z" fill="${wall}"/>` +
      [40, 220, 400].map(x => `<rect x="${x}" y="150" width="160" height="150" rx="16" fill="none" ${st}/>`).join('') +
      `<line x1="0" y1="118" x2="600" y2="118" ${S(6)}/>${[120, 300, 480].map(x => `<line x1="${x}" y1="118" x2="${x}" y2="140" ${S(3)}/><path d="M${x - 12} 140 L${x + 12} 140 L${x + 6} 162 L${x - 6} 162 Z" fill="${C.yel}" ${S(2.5)}/>`).join('')}` +
      [30, 330].map(x => `<rect x="${x}" y="320" width="240" height="80" rx="18" fill="${seat}" ${st}/><rect x="${x}" y="395" width="240" height="40" rx="12" fill="${seat}" ${st}/><line x1="${x + 120}" y1="322" x2="${x + 120}" y2="433" ${S(2.5)}/>`).join('') +
      `<rect y="440" width="600" height="160" fill="#c9c4da"/><line x1="0" y1="440" x2="600" y2="440" ${st}/>${dots(0, 440, 600, 600, '#b5afca', 40)}` +
      `<rect x="292" y="118" width="16" height="482" rx="8" fill="#ffd25e" ${st}/>`;
  }
};

// Décor, titre, mots qui l'utilisent, étiquettes [texte, x, y]
const SCENES = {
  schlafzimmer: { title: 'das Schlafzimmer', places: ['Schlafzimmer', 'Bett'], svg: SVG.schlafzimmer, labels: [['das Bett', 186, 586], ['das Fenster', 450, 312], ['das Bild', 136, 260], ['die Lampe', 552, 420], ['der Teppich', 450, 588]] },
  kinderzimmer: { title: 'das Kinderzimmer', places: ['Kinderzimmer'], svg: SVG.kinderzimmer, labels: [['das Regal', 116, 250], ['das Fenster', 315, 300], ['das Bett', 445, 588], ['der Teppich', 252, 592]] },
  wohnzimmer: { title: 'das Wohnzimmer', places: ['Wohnzimmer', 'Teppich'], svg: SVG.wohnzimmer, labels: [['das Bild', 275, 270], ['das Fenster', 495, 300], ['die Lampe', 80, 360], ['der Teppich', 300, 592]] },
  esszimmer: { title: 'das Esszimmer', places: ['Esszimmer', 'Stuhl'], svg: SVG.esszimmer, labels: [['der Schrank', 91, 268], ['die Lampe', 330, 236], ['der Tisch', 330, 505], ['der Stuhl', 192, 586], ['die Tür', 544, 300]] },
  kueche: { title: 'die Küche', places: ['Küche'], svg: SVG.kueche, labels: [['der Schrank', 141, 268], ['das Fenster', 385, 292]] },
  bad: { title: 'das Bad', places: ['Bad'], svg: SVG.bad, labels: [['das Fenster', 300, 262], ['die Tür', 531, 300]] },
  garten: { title: 'der Garten', places: ['Garten'], svg: SVG.garten, labels: [['das Haus', 140, 450], ['der Tisch', 375, 590], ['der Stuhl', 515, 590]] },
  balkon: { title: 'der Balkon', places: ['Balkon'], svg: SVG.balkon, labels: [['die Tür', 98, 186], ['der Stuhl', 362, 588], ['der Tisch', 475, 588]] },
  park: { title: 'der Park', places: ['Park'], svg: SVG.park, labels: [] },
  zoo: { title: 'der Zoo', places: ['Zoo'], svg: SVG.zoo, labels: [['ZOO', 300, 196]] },
  schwimmbad: { title: 'das Schwimmbad', places: ['Schwimmbad'], svg: SVG.schwimmbad, labels: [] },
  platz: { title: 'der Platz', places: ['Platz'], svg: SVG.platz, labels: [['das Haus', 160, 300], ['die Strasse', 470, 572]] },
  stadt: { title: 'die Stadt', places: ['Stadt'], svg: SVG.platz, labels: [['das Haus', 160, 300], ['der Platz', 120, 505], ['die Strasse', 470, 572]] },
  schule: { title: 'die Schule', places: ['Schule'], svg: SVG.schule, labels: [['der Hof', 500, 590]] },
  hof: { title: 'der Hof', places: ['Hof'], svg: SVG.schule, labels: [['die Schule', 300, 420]] },
  sporthalle: { title: 'die Sporthalle', places: ['Sporthalle'], svg: SVG.sporthalle, labels: [] },
  stadion: { title: 'das Stadion', places: ['Stadion'], svg: SVG.stadion, labels: [] },
  bus: { title: 'der Bus', places: ['Bus'], svg: () => SVG.vehicule('bus'), labels: [['das Fenster', 120, 316]] },
  tram: { title: 'die Strassenbahn', places: ['Strassenbahn'], svg: () => SVG.vehicule('tram'), labels: [['das Fenster', 120, 316]] },
  ubahn: { title: 'die U-Bahn', places: ['U-Bahn'], svg: () => SVG.vehicule('ubahn'), labels: [['das Fenster', 120, 316]] }
};

// ---------------------------------------------------------------- dessin sur un canvas
const ART = { der: '#3b6fd8', die: '#d8434f', das: '#2f9a5c' };
const FONT = '"Baloo 2", "Arial Rounded MT Bold", "Trebuchet MS", sans-serif';
function rr(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
function pill(ctx, text, cx, cy, k, size, title) {
  const parts = text.split(' '), art = ART[parts[0]] ? parts[0] : null;
  const a = art ? art + ' ' : '', rest = art ? parts.slice(1).join(' ') : text;
  ctx.font = `800 ${size * k}px ${FONT}`;
  const wa = ctx.measureText(a).width, wr = ctx.measureText(rest).width, pad = (title ? 26 : 12) * k;
  const w = wa + wr + pad * 2, h = size * k * 1.45;
  const x = Math.max(6 * k, Math.min(594 * k - w, cx - w / 2)), y = cy - h / 2;
  ctx.save();
  ctx.fillStyle = 'rgba(74,59,107,.18)'; rr(ctx, x, y + 4 * k, w, h, h / 2); ctx.fill();
  ctx.fillStyle = '#fff'; rr(ctx, x, y, w, h, h / 2); ctx.fill();
  ctx.lineWidth = (title ? 4 : 3) * k; ctx.strokeStyle = art ? ART[art] : '#8f78f0'; ctx.stroke();
  ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
  const ty = cy + size * k * 0.06;
  if (art) { ctx.fillStyle = ART[art]; ctx.fillText(a, x + pad, ty); }
  ctx.fillStyle = '#3a2d5c'; ctx.fillText(rest, x + pad + wa, ty);
  ctx.restore();
}
function loadImg(src) { return new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; }); }
async function paint(id, ctx, size) {
  const sc = SCENES[id] || SCENES.schlafzimmer;
  gid = 0;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 600 600">${sc.svg()}</svg>`;
  try { if (document.fonts && document.fonts.load) await Promise.race([document.fonts.load(`800 30px "Baloo 2"`), new Promise(r => setTimeout(r, 800))]); } catch (e) { /* police système */ }
  const img = await loadImg('data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg));
  ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, size, size);
  ctx.drawImage(img, 0, 0, size, size);
  const k = size / 600;
  sc.labels.forEach(([t, x, y]) => pill(ctx, t, x * k, y * k, k, 21, false));
  pill(ctx, sc.title, 300 * k, 42 * k, k, 34, true);
}
function forPlace(place) { return Object.keys(SCENES).filter(id => SCENES[id].places.includes(place)); }

window.DP_SCENES = { SCENES, paint, forPlace };
})();
