/* Deutsch Party – un quiz façon Kahoot pour pratiquer l'allemand.
   Les mots sont dans words.js. Tout est sauvegardé sur l'appareil. */
'use strict';
(() => {
const DATA = window.DE_DATA;
const app = document.getElementById('app');

// ---------------------------------------------------------------- outils
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const rnd = a => a[Math.floor(Math.random() * a.length)];
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
const plural = (n, one, many) => n + ' ' + (n === 1 ? one : many);

// ---------------------------------------------------------------- sauvegarde
const KEY = 'deutschParty.v1';
const DEFAULTS = () => ({
  player: { name: 'Alinka', avatar: '🐱' },
  settings: { sound: true, music: true, speak: true, qCount: 10, time: 20, level: 'auto', typing: true },
  stats: {}, persons: {}, history: [], stars: 0, games: 0, wins: 0, drawings: 0, pending: []
});
let S = load();
function load() {
  const d = DEFAULTS();
  try {
    const s = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (s) { Object.assign(d, s); d.player = Object.assign(DEFAULTS().player, s.player); d.settings = Object.assign(DEFAULTS().settings, s.settings); }
  } catch (e) { /* rien */ }
  return d;
}
function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* plein ou bloqué */ } }
try { navigator.storage && navigator.storage.persist && navigator.storage.persist(); } catch (e) { /* rien */ }

// ---------------------------------------------------------------- données
const NOUNS = DATA.nouns.map(n => Object.assign({}, n, { type: 'n', id: 'n:' + n.de, disp: n.art + ' ' + n.de }));
const VERBS = DATA.verbs.map(v => Object.assign({}, v, { type: 'v', id: 'v:' + v.inf, de: v.inf, disp: v.inf }));
const WORDS = DATA.words.map(w => Object.assign({}, w, { type: 'w', id: 'w:' + w.de, disp: w.de }));
const VOCAB = [...NOUNS, ...VERBS, ...WORDS];
const RULES = DATA.grammar;
const MAXW = Math.max(0, ...VOCAB.map(x => x.week || 0), ...RULES.map(r => r.week || 0));
const isNew = x => MAXW > 0 && (x.week || 0) === MAXW;
const VERB = Object.fromEntries(VERBS.map(v => [v.inf, v]));
const SEIN = ['bin', 'bist', 'ist', 'sind', 'seid', 'sind'];
const formsOf = inf => inf === 'sein' ? SEIN : VERB[inf].forms;
const ARTCLS = { der: 'der', die: 'die', das: 'das' };

// ---------------------------------------------------------------- fréquence
// Les mots de la semaine la plus récente reviennent plus souvent,
// et les mots ratés reviennent plus vite (petites « boîtes » comme Leitner).
function weekFactor(w) { w = w || 0; if (!MAXW) return 1; if (w === MAXW) return 3.5; if (w === MAXW - 1) return 1.6; return 1; }
function boxFactor(key) { const st = S.stats[key]; if (!st) return 2; return [3, 2.2, 1.5, 1.1, 0.8, 0.6][clamp(st.box, 0, 5)]; }
function pickW(list, wfn, kf) {
  let pool = list;
  if (kf && G) { const f = list.filter(x => !G.used.has(kf(x))); if (f.length) pool = f; }
  let tot = 0; const ws = pool.map(x => { const w = wfn(x); tot += w; return w; });
  let r = Math.random() * tot, out = pool[pool.length - 1];
  for (let i = 0; i < pool.length; i++) { r -= ws[i]; if (r <= 0) { out = pool[i]; break; } }
  if (kf && G) G.used.add(kf(out));
  return out;
}
function record(key, res) {
  const st = S.stats[key] || (S.stats[key] = { box: 1, seen: 0, ok: 0, last: 0 });
  st.seen++; st.last = Date.now();
  if (res === true) { st.ok++; st.box = Math.min(5, st.box + 1); } else if (res === false) st.box = 0;
}

// ---------------------------------------------------------------- son & voix
const Snd = {
  ctx: null,
  init() {
    try {
      if (!this.ctx) { const AC = window.AudioContext || window.webkitAudioContext; if (AC) this.ctx = new AC(); }
      if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
    } catch (e) { /* pas de son */ }
  },
  tone(freq, dur, type = 'sine', vol = 0.15, when = 0) {
    if (!S.settings.sound || !this.ctx) return;
    const t = this.ctx.currentTime + Math.max(0, when);
    const o = this.ctx.createOscillator(), g = this.ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(this.ctx.destination); o.start(t); o.stop(t + dur + 0.05);
  },
  good() { [523, 659, 784, 1047].forEach((f, i) => this.tone(f, 0.2, 'triangle', 0.18, i * 0.07)); },
  almost() { [523, 659].forEach((f, i) => this.tone(f, 0.2, 'triangle', 0.15, i * 0.09)); },
  bad() { this.tone(240, 0.25, 'sawtooth', 0.07); this.tone(180, 0.4, 'sawtooth', 0.07, 0.14); },
  tick() { this.tone(1300, 0.05, 'square', 0.035); },
  pop() { this.tone(880, 0.07, 'sine', 0.07); },
  tap() { this.tone(600, 0.05, 'triangle', 0.08); },
  count(last) { this.tone(last ? 1046 : 523, last ? 0.4 : 0.15, 'triangle', 0.2); },
  fanfare() { [523, 659, 784, 1047, 784, 1047, 1319].forEach((f, i) => this.tone(f, i === 6 ? 0.6 : 0.16, 'triangle', 0.2, i * 0.12)); }
};
const MEL = [784, 0, 659, 0, 784, 880, 784, 0, 659, 0, 587, 0, 523, 0, 587, 659, 784, 0, 659, 0, 784, 880, 1047, 0, 880, 0, 784, 0, 659, 587, 523, 0];
const BASS = [131, 131, 175, 175, 196, 196, 131, 196];
const Music = {
  timer: null, next: 0, step: 0,
  start() {
    if (!S.settings.music || !S.settings.sound || !Snd.ctx || this.timer) return;
    this.next = Snd.ctx.currentTime + 0.05; this.step = 0;
    this.timer = setInterval(() => {
      const c = Snd.ctx;
      while (this.next < c.currentTime + 0.25) {
        const s = this.step % 32, w = this.next - c.currentTime;
        if (MEL[s]) Snd.tone(MEL[s], 0.14, 'triangle', 0.03, w);
        if (s % 4 === 0) Snd.tone(BASS[(s / 4) % 8], 0.22, 'sine', 0.05, w);
        this.next += 0.16; this.step++;
      }
    }, 60);
  },
  stop() { clearInterval(this.timer); this.timer = null; }
};
function speak(text) {
  if (!S.settings.speak || !('speechSynthesis' in window) || !text) return;
  try {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text.replace(/_+/g, ''));
    u.lang = 'de-DE';
    const vs = speechSynthesis.getVoices();
    const v = vs.find(x => /^de[-_]DE/i.test(x.lang)) || vs.find(x => /^de/i.test(x.lang));
    if (v) u.voice = v;
    u.rate = 0.88;
    speechSynthesis.speak(u);
  } catch (e) { /* pas de voix */ }
}

// ---------------------------------------------------------------- personnages
const BOT_POOL = [
  { name: 'Mochi', em: '🐰', bg: '#ffe3ef' }, { name: 'Pandou', em: '🐼', bg: '#eceff5' }, { name: 'Lulu', em: '🦄', bg: '#f2e6ff' },
  { name: 'Tofu', em: '🐱', bg: '#fff1d6' }, { name: 'Kiki', em: '🐸', bg: '#e1f7e6' }, { name: 'Nugget', em: '🐥', bg: '#fff6c9' },
  { name: 'Moka', em: '🐻', bg: '#f6e6da' }, { name: 'Pipou', em: '🐧', bg: '#e2f0ff' }, { name: 'Choupi', em: '🦊', bg: '#ffe6d6' },
  { name: 'Bao', em: '🐹', bg: '#fff0e0' }, { name: 'Koala', em: '🐨', bg: '#edf0f2' }, { name: 'Praline', em: '🐷', bg: '#ffe4ea' }
];
const AVATARS = ['🐱', '🐰', '🐼', '🦄', '🦊', '🐻', '🐨', '🐹', '🐧', '🐸', '🐥', '🐶', '🐯', '🐮', '🐷', '🐙', '🦋', '🌸', '🍓', '🧁'];
const NAMES_F = ['Lea', 'Mia', 'Laura', 'Emma', 'Nina', 'Sofia'];
const NAMES_M = ['Tom', 'Luca', 'Max', 'Noah', 'Leo', 'Elias'];
const CITIES = [{ de: 'Genf', fr: 'Genève' }, { de: 'Zürich', fr: 'Zurich' }, { de: 'Bern', fr: 'Berne' }, { de: 'Basel', fr: 'Bâle' }, { de: 'Luzern', fr: 'Lucerne' }, { de: 'München', fr: 'Munich' }];
const ROOMS = [{ de: 'Im Wohnzimmer', fr: 'Dans le salon' }, { de: 'Im Schlafzimmer', fr: 'Dans la chambre' }, { de: 'Im Kinderzimmer', fr: 'Dans la chambre des enfants' }];

function mascot() {
  return `<svg viewBox="0 0 120 120" aria-hidden="true">
<ellipse cx="60" cy="113" rx="34" ry="5" fill="#3a2d5c" opacity=".08"/>
<path d="M22 54 L27 16 L52 36 Z" fill="#fff" stroke="#3a2d5c" stroke-width="4" stroke-linejoin="round"/>
<path d="M98 54 L93 16 L68 36 Z" fill="#fff" stroke="#3a2d5c" stroke-width="4" stroke-linejoin="round"/>
<path d="M29 40 L31 25 L42 34 Z" fill="#ffb3d1"/><path d="M91 40 L89 25 L78 34 Z" fill="#ffb3d1"/>
<ellipse cx="60" cy="68" rx="45" ry="39" fill="#fff" stroke="#3a2d5c" stroke-width="4"/>
<ellipse cx="43" cy="66" rx="6.5" ry="8.5" fill="#3a2d5c"/><circle cx="45.5" cy="62.5" r="2.6" fill="#fff"/>
<ellipse cx="77" cy="66" rx="6.5" ry="8.5" fill="#3a2d5c"/><circle cx="79.5" cy="62.5" r="2.6" fill="#fff"/>
<ellipse cx="31" cy="80" rx="8" ry="4.5" fill="#ffb3d1"/><ellipse cx="89" cy="80" rx="8" ry="4.5" fill="#ffb3d1"/>
<path d="M53 78 q3.5 4.5 7 0 q3.5 4.5 7 0" fill="none" stroke="#3a2d5c" stroke-width="3" stroke-linecap="round"/>
<g transform="translate(84 30) rotate(18)"><path d="M0 0 L-13 -8 L-13 8 Z" fill="#ff8fc1" stroke="#3a2d5c" stroke-width="2.5" stroke-linejoin="round"/><path d="M0 0 L13 -8 L13 8 Z" fill="#ff8fc1" stroke="#3a2d5c" stroke-width="2.5" stroke-linejoin="round"/><circle r="4" fill="#ffd25e" stroke="#3a2d5c" stroke-width="2.5"/></g>
</svg>`;
}

// ---------------------------------------------------------------- pronoms
const PRON = [['ich', 'je'], ['du', 'tu'], null, ['wir', 'nous'], ['ihr', 'vous'], ['sie', 'ils / elles']];
const P3 = [['er', 'il'], ['sie', 'elle'], ['es', 'il (neutre)']];
function pronoun(p, noSie) {
  if (p === 2) { const o = noSie ? rnd([P3[0], P3[2]]) : rnd(P3); return { de: o[0], fr: o[1] }; }
  return { de: PRON[p][0], fr: PRON[p][1] };
}
function subjectFor(p) {
  return [() => 'Ich', () => 'Du', () => rnd(['Er', 'Lea', 'Tom', 'Mama', 'Papa']), () => 'Wir', () => 'Ihr', () => rnd(['Die Kinder', 'Mama und Papa', 'Lea und Tom'])][p]();
}
function verbCtx(v) {
  const c = (v.ctx || []).slice();
  NOUNS.forEach(n => { if (n.loc && n.acts && n.acts.includes(v.inf)) c.push(n.loc + ' ' + n.de); });
  return c;
}
function conjTable(v, p) {
  const lab = ['ich', 'du', 'er/sie/es', 'wir', 'ihr', 'sie'];
  const cell = i => `<span>${lab[i]}</span><span class="${i === p ? 'hl' : ''}">${esc(v.forms[i])}</span>`;
  return `<div><b>${esc(v.inf)}</b> (${esc(v.fr)})</div><div class="conj">${cell(0)}${cell(3)}${cell(1)}${cell(4)}${cell(2)}${cell(5)}</div>`;
}
function artTip(n) {
  if (n.tip) return n.tip;
  if (/ung$/.test(n.de)) return 'Les mots en <b>-ung</b> sont toujours <b class="die">die</b>.';
  const base = NOUNS.find(m => m !== n && m.de.length >= 3 && n.de.toLowerCase().endsWith(m.de.toLowerCase()) && n.de.length > m.de.length);
  if (base && base.art === n.art) return `Le dernier mot décide : <b class="${base.art}">${base.art} ${esc(base.de)}</b> → <b class="${n.art}">${n.art} ${esc(n.de)}</b>.`;
  return '';
}

// ---------------------------------------------------------------- fautes d'orthographe
const MISSPELL = [
  s => s.replace(/([bdfglmnprtz])\1/, '$1'),
  s => s.replace(/ss/, 's'),
  s => s.replace(/ä/, 'a'), s => s.replace(/ö/, 'o'), s => s.replace(/ü/, 'u'),
  s => s.replace(/ä/, 'e'), s => s.replace(/ü/, 'ue'),
  s => s.replace(/ie/, 'ei'), s => s.replace(/ei/, 'ie'),
  s => s.replace(/sch/, 'sh'), s => s.replace(/ck/, 'k'), s => s.replace(/tz/, 'z'),
  s => s.replace(/([aeiouäöü])h/, '$1'),
  s => s.replace(/d$/, 't'), s => s.replace(/t$/, 'd'), s => s.replace(/g$/, 'k'), s => s.replace(/b$/, 'p'),
  s => s.replace(/([aeiou])([lmnpt])(?=[aeiou])/, '$1$2$2'),
  s => s.replace(/z/, 'ts'), s => s.replace(/w/, 'v'), s => s.replace(/W/, 'V'), s => s.replace(/v/, 'f'),
  s => s.replace(/eu/, 'oi'), s => s.replace(/au/, 'ao'), s => s.replace(/u/, 'ou'), s => s.replace(/ch/, 'sch')
];
function misspellings(word, isNoun) {
  const out = new Set();
  const rules = shuffle(MISSPELL);
  if (isNoun && Math.random() < 0.5) out.add(word.charAt(0).toLowerCase() + word.slice(1));
  else if (!isNoun && /^[a-zäöü]/.test(word) && Math.random() < 0.4) out.add(word.charAt(0).toUpperCase() + word.slice(1));
  for (const r of rules) { const w = r(word); if (w !== word && w.length > 1) out.add(w); if (out.size >= 3) break; }
  let guard = 0;
  while (out.size < 3 && guard++ < 20) {
    const i = 1 + Math.floor(Math.random() * (word.length - 2));
    const w = word.slice(0, i) + word[i + 1] + word[i] + word.slice(i + 2);
    if (w !== word) out.add(w);
  }
  const extra = shuffle([word + 'e', word + word.slice(-1), word.replace(/([aeiouäöü])/, '$1h'), word.length > 3 ? word.slice(0, -1) : word + 'n', word.replace(/^Z/, 'Ts').replace(/^z/, 'ts')]);
  for (const w of extra) { if (out.size >= 3) break; if (w !== word) out.add(w); }
  out.delete(word);
  return [...out].slice(0, 3);
}
const hasPunct = x => /[?.!,]/.test(x.de);

// ---------------------------------------------------------------- questions
const emo = e => e ? `<div class="emo">${e}</div>` : '';
const BL = '<span class="blank"></span>';
const mc = (labels, cls) => labels.map((l, i) => ({ label: esc(l), value: l, cls: cls ? cls(l, i) : 'c' + (i % 4) }));

const GEN = {
  art() {
    const n = pickW(NOUNS, x => weekFactor(x.week) * boxFactor('a:' + x.de), x => 'a:' + x.de);
    return {
      cat: 'articles', kindLabel: 'der, die ou das ?', isNew: isNew(n),
      html: `${emo(n.emoji)}<div class="main">${BL} ${esc(n.de)}</div><div class="hint">${esc(n.fr)}</div>`,
      layout: 'three', choices: mc(['der', 'die', 'das'], l => 'c' + l), correct: n.art,
      answerHtml: `<span class="${n.art}">${n.art} ${esc(n.de)}</span>`, say: n.art + ' ' + n.de,
      tip: [artTip(n), n.pl ? `Pluriel : <b class="pl">die ${esc(n.pl)}</b>` : 'Pas de pluriel.'].filter(Boolean).join('<br>'),
      keys: ['a:' + n.de], review: `___ ${n.de} (${n.fr})`, answerPlain: `${n.art} ${n.de}`
    };
  },
  conjForm(typing) {
    const v = pickW(VERBS, x => weekFactor(x.week) * boxFactor('c:' + x.inf), x => 'c:' + x.inf);
    const p = nextPerson(), pr = pronoun(p), f = v.forms[p];
    const ctxs = verbCtx(v), ctx = ctxs.length && Math.random() < 0.65 ? ' ' + rnd(ctxs) : '';
    const q = {
      cat: 'verbes', kindLabel: typing ? 'Écris le verbe' : 'Conjugue !', isNew: isNew(v), person: [v.inf, p],
      html: `${emo(v.emoji)}<div class="sentence"><span class="pron">${pr.de}<small>${pr.fr}</small></span> ${BL}${esc(ctx)}.</div><div class="hint">${esc(v.inf)} = ${esc(v.fr)}</div>`,
      answerHtml: `${pr.de} <b>${esc(f)}</b>${esc(ctx)}.`, say: `${pr.de} ${f}${ctx}.`, tip: conjTable(v, p),
      keys: ['c:' + v.inf], review: `${pr.de} ___${ctx} (${v.inf})`, answerPlain: `${pr.de} ${f}`
    };
    if (typing) { q.type = 'type'; q.accept = f; q.lower = true; q.placeholder = v.inf + ' …'; return q; }
    const stem = v.inf.replace(/e?n$/, '');
    const real = shuffle([...new Set(v.forms)].filter(x => x !== f));
    const fakes = shuffle([...new Set([stem + 'e', stem + 'st', stem + 't', stem + 'en', stem + 'est'])].filter(x => x !== f && !real.includes(x)));
    const opts = real.slice(0, 3); while (opts.length < 3 && fakes.length) opts.push(fakes.pop());
    q.layout = 'grid'; q.choices = mc(shuffle([f, ...opts])); q.correct = f;
    return q;
  },
  conjType() { return GEN.conjForm(true); },
  conjPron() {
    const v = pickW(VERBS, x => weekFactor(x.week) * boxFactor('c:' + x.inf), x => 'c:' + x.inf);
    const p = nextPerson(), f = v.forms[p];
    const valid = [0, 1, 2, 3, 4, 5].filter(i => v.forms[i] === f);
    const invalid = shuffle([0, 1, 2, 3, 4, 5].filter(i => !valid.includes(i))).slice(0, 3);
    const er = rnd(['er', 'es']);
    const lab = i => i === 2 ? er : i === 5 ? 'sie (ils/elles)' : PRON[i][0];
    const ctxs = verbCtx(v), ctx = ctxs.length && Math.random() < 0.6 ? ' ' + rnd(ctxs) : '';
    const choices = shuffle([p, ...invalid]).map((i, k) => ({ label: esc(lab(i)), value: lab(i), cls: 'c' + k }));
    return {
      cat: 'verbes', kindLabel: 'Qui ?', isNew: isNew(v), person: [v.inf, p],
      html: `${emo(v.emoji)}<div class="sentence">${BL} <b>${esc(f)}</b>${esc(ctx)}.</div><div class="hint">${esc(v.inf)} = ${esc(v.fr)}</div>`,
      layout: 'grid', choices, correct: lab(p),
      answerHtml: `<span class="pron">${esc(lab(p))}</span> ${esc(f)}${esc(ctx)}.`, say: `${lab(p).replace(/ \(.*/, '')} ${f}${ctx}.`,
      tip: conjTable(v, p), keys: ['c:' + v.inf], review: `___ ${f}${ctx}`, answerPlain: `${lab(p)} ${f}`
    };
  },
  fr2de() {
    const it = pickVocab(() => true);
    const others = vocabDistractors(it, x => x.disp);
    return {
      cat: 'vocab', kindLabel: 'En allemand ?', isNew: isNew(it),
      html: `${emo(it.emoji)}<div class="main">${esc(it.fr)}</div>`,
      layout: 'grid', choices: mc(shuffle([it.disp, ...others.map(x => x.disp)])), correct: it.disp,
      answerHtml: vocabHtml(it), say: it.disp, tip: '', keys: ['v:' + it.id], review: it.fr, answerPlain: it.disp
    };
  },
  de2fr() {
    const it = pickVocab(() => true);
    const others = vocabDistractors(it, x => x.fr);
    return {
      cat: 'vocab', kindLabel: 'En français ?', isNew: isNew(it), sayAtStart: it.disp,
      html: `<div class="main">${vocabHtml(it)}</div><button class="say" data-a="sayq">🔊</button>`,
      layout: 'grid', choices: mc(shuffle([it.fr, ...others.map(x => x.fr)])), correct: it.fr,
      answerHtml: `${vocabHtml(it)} = ${esc(it.fr)}`, say: it.disp, tip: '', keys: ['v:' + it.id], review: it.disp, answerPlain: it.fr
    };
  },
  emoji() {
    const it = pickVocab(x => !!x.emoji);
    const others = vocabDistractors(it, x => x.disp);
    return {
      cat: 'vocab', kindLabel: "Qu'est-ce que c'est ?", isNew: isNew(it),
      html: `<div class="emo" style="font-size:clamp(80px,22vw,130px)">${it.emoji}</div>`,
      layout: 'grid', choices: mc(shuffle([it.disp, ...others.map(x => x.disp)])), correct: it.disp,
      answerHtml: `${vocabHtml(it)} = ${esc(it.fr)}`, say: it.disp, tip: '', keys: ['v:' + it.id], review: it.emoji, answerPlain: it.disp
    };
  },
  spellPick() {
    const it = pickVocab(x => !hasPunct(x));
    const word = it.type === 'n' ? it.de : it.disp;
    const pre = it.type === 'n' ? it.art + ' ' : '';
    const opts = shuffle([word, ...misspellings(word, it.type === 'n')]).map(w => pre + w);
    return {
      cat: 'vocab', kindLabel: 'Bonne orthographe ?', isNew: isNew(it),
      html: `${emo(it.emoji)}<div class="main">${esc(it.fr)}</div><div class="hint">Quelle est la bonne orthographe ?</div>`,
      layout: 'grid', choices: mc(opts), correct: pre + word,
      answerHtml: vocabHtml(it), say: it.disp, tip: it.type === 'n' ? 'Les noms allemands commencent toujours par une <b>majuscule</b>.' : '',
      keys: ['v:' + it.id], review: it.fr, answerPlain: it.disp
    };
  },
  spellType() {
    const it = pickVocab(x => !hasPunct(x));
    return {
      cat: 'vocab', kindLabel: 'Écris le mot', isNew: isNew(it), type: 'type', accept: it.disp, noun: it.type === 'n' ? it : null, lower: it.type === 'v', word: it.type === 'w',
      placeholder: it.type === 'n' ? 'der / die / das …' : '…',
      html: `${emo(it.emoji)}<div class="main">${esc(it.fr)}</div><div class="hint">Écris en allemand${it.type === 'n' ? ' <b>avec l\'article</b>' : ''} !</div>`,
      answerHtml: vocabHtml(it), say: it.disp, tip: '', keys: ['v:' + it.id], review: it.fr, answerPlain: it.disp
    };
  },
  gram() {
    const r = pickW(RULES, x => weekFactor(x.week) * boxFactor('g:' + x.id));
    const q = GRAM[r.id]();
    q.cat = 'grammaire'; q.keys = ['g:' + r.id]; q.isNew = isNew(r);
    return q;
  }
};

const GRAM = {
  morgen() {
    const [sent, k, fr] = rnd(MORGEN), ans = k ? 'Morgen' : 'morgen';
    const [a, b] = sent.split('_');
    return {
      kindLabel: 'morgen ou Morgen ?',
      html: `<div class="emo">${k ? '🌅' : '📅'}</div><div class="sentence">${esc(a)}${BL}${esc(b)}</div><div class="hint">${esc(fr)}</div>`,
      layout: 'two', choices: [{ label: 'morgen<br><small style="font-size:.5em">demain</small>', value: 'morgen', cls: 'c1' }, { label: 'Morgen<br><small style="font-size:.5em">le matin</small>', value: 'Morgen', cls: 'c0' }], correct: ans,
      answerHtml: `${esc(a)}<b>${ans}</b>${esc(b)}`, say: a + ans + b,
      tip: k ? '<b>der Morgen</b> = le matin → c\'est un nom : <b>majuscule</b>.' : '<b>morgen</b> = demain → ce n\'est pas un nom : <b>minuscule</b>.',
      review: `${a}___${b}`, answerPlain: a + ans + b
    };
  },
  poss() {
    const n = pickW(NOUNS.filter(x => x.poss), x => weekFactor(x.week), x => 'gp:' + x.de);
    const girl = Math.random() < 0.5, name = rnd(girl ? NAMES_F : NAMES_M);
    const pl = !!n.pl && Math.random() < 0.3;
    const w = pl ? n.pl : n.de;
    const fem = pl || n.art === 'die';
    const ans = (girl ? 'ihr' : 'sein') + (fem ? 'e' : '');
    const l1 = pl ? `Das sind die ${w} von ${name}.` : `Das ist ${n.art} ${w} von ${name}.`;
    const l2 = pl ? `Das sind ${BL} ${esc(w)}.` : `Das ist ${BL} ${esc(w)}.`;
    return {
      kindLabel: 'sein ou ihr ?',
      html: `${emo(n.emoji)}<div class="sentence" style="font-size:clamp(20px,5vw,30px)">${esc(l1)}</div><div class="sentence">${l2}</div><div class="hint">${girl ? '👧' : '👦'} ${name}</div>`,
      layout: 'grid', choices: mc(['sein', 'seine', 'ihr', 'ihre']), correct: ans,
      answerHtml: `Das ${pl ? 'sind' : 'ist'} <b>${ans}</b> ${esc(w)}.`, say: `Das ${pl ? 'sind' : 'ist'} ${ans} ${w}.`,
      tip: `${name} est ${girl ? 'une fille → <b>ihr</b>' : 'un garçon → <b>sein</b>'}.<br>${pl ? `<b class="pl">die ${esc(w)}</b> (pluriel)` : `<b class="${n.art}">${n.art} ${esc(w)}</b>`} → ${fem ? 'on ajoute <b>-e</b>' : 'pas de <b>-e</b>'} → <b>${ans} ${esc(w)}</b>`,
      review: `${l1} Das ${pl ? 'sind' : 'ist'} ___ ${w}.`, answerPlain: `${ans} ${w}`
    };
  },
  lieu() {
    const n = pickW(NOUNS.filter(x => x.loc), x => weekFactor(x.week), x => 'gl:' + x.de);
    const inf = rnd(n.acts), p = rnd([0, 1, 2, 2, 3, 4, 5]), subj = subjectFor(p), f = formsOf(inf)[p];
    return {
      kindLabel: 'Où ?',
      html: `${emo(n.emoji)}<div class="sentence">${esc(subj)} ${esc(f)} ${BL} ${esc(n.de)}.</div>`,
      layout: 'three', choices: mc(['im', 'in der', 'auf dem'], (l, i) => 'c' + i), correct: n.loc,
      answerHtml: `${esc(subj)} ${esc(f)} <b>${n.loc}</b> ${esc(n.de)}.`, say: `${subj} ${f} ${n.loc} ${n.de}.`,
      tip: `<b class="${n.art}">${n.art} ${esc(n.de)}</b> → <b>${n.loc} ${esc(n.de)}</b> (${esc(n.frLoc || '')})<br><span class="muted">der / das → <b>im</b> · die → <b>in der</b> · sur quelque chose → <b>auf dem</b></span>`,
      review: `${subj} ${f} ___ ${n.de}.`, answerPlain: `${n.loc} ${n.de}`
    };
  },
  esgibt() {
    const n = pickW(NOUNS.filter(x => x.where), x => weekFactor(x.week), x => 'ge:' + x.de);
    const IND = { der: 'einen', die: 'eine', das: 'ein' };
    const ind = IND[n.art];
    let pre, frPre;
    if (n.where === 'stadt') { const c = rnd(CITIES); pre = `In ${c.de}`; frPre = `À ${c.fr}`; }
    else if (n.where === 'haus') { const nm = rnd([...NAMES_F, ...NAMES_M]); pre = `Bei ${nm}`; frPre = `Chez ${nm}`; }
    else { const r = rnd(ROOMS); pre = r.de; frPre = r.fr; }
    const good = `${pre} gibt es ${ind} ${n.de}.`;
    const tip = `es gibt + <b class="der">einen</b> (der) · <b class="die">eine</b> (die) · <b class="das">ein</b> (das)<br><b class="${n.art}">${n.art} ${esc(n.de)}</b> → <b>${ind} ${esc(n.de)}</b>`;
    if (Math.random() < 0.6) {
      return {
        kindLabel: 'es gibt …',
        html: `${emo(n.emoji)}<div class="sentence">${esc(pre)} gibt es ${BL} ${esc(n.de)}.</div><div class="hint">${esc(frPre)}, il y a ${esc(frIndef(n))}.</div>`,
        layout: 'three', choices: mc(['einen', 'eine', 'ein'], l => 'c' + ({ einen: 'der', eine: 'die', ein: 'das' }[l])), correct: ind,
        answerHtml: esc(good), say: good, tip, review: `${pre} gibt es ___ ${n.de}.`, answerPlain: good
      };
    }
    const wrong = shuffle(['einen', 'eine', 'ein'].filter(x => x !== ind))[0];
    const opts = shuffle([good, `${pre} es gibt ${ind} ${n.de}.`, `${pre} gibt es ${wrong} ${n.de}.`, `${pre} es gibt ${wrong} ${n.de}.`]);
    return {
      kindLabel: 'es gibt …',
      html: `${emo(n.emoji)}<div class="main" style="font-size:clamp(22px,5.5vw,34px)">${esc(frPre)}, il y a ${esc(frIndef(n))}.</div><div class="hint">Choisis la bonne phrase !</div>`,
      layout: 'list', choices: mc(opts), correct: good, extraTime: 8,
      answerHtml: esc(good), say: good,
      tip: tip + `<br>Après « ${esc(pre)} », le verbe vient en 2<sup>e</sup> place : ${esc(pre)} <b>gibt es</b> …`,
      review: `${frPre}, il y a ${frIndef(n)}.`, answerPlain: good
    };
  }
};
// morgen (demain, minuscule) ≠ der Morgen (le matin, majuscule)
const MORGEN = [
  ['Wir gehen _ in den Zoo.', 0, 'Nous allons au zoo demain.'], ['Ich schlafe _ bei Lea.', 0, 'Demain, je dors chez Lea.'],
  ['Heute ist Montag und _ ist Dienstag.', 0, 'Aujourd\'hui c\'est lundi et demain c\'est mardi.'], ['Wir kochen _ Spaghetti.', 0, 'Demain, nous cuisinons des spaghettis.'],
  ['Ihr seid _ im Schwimmbad.', 0, 'Demain, vous êtes à la piscine.'], ['Heute ist Freitag und _ ist Samstag.', 0, 'Aujourd\'hui c\'est vendredi et demain samedi.'],
  ['Der _ ist toll.', 1, 'Le matin est génial.'], ['Am _ dusche ich.', 1, 'Le matin, je prends une douche.'],
  ['Heute _ esse ich im Garten.', 1, 'Ce matin, je mange dans le jardin.'], ['Am _ ist es noch dunkel.', 1, 'Le matin, il fait encore sombre.']
];
function frIndef(n) {
  const b = n.fr.split(',')[0].trim();
  if (b.startsWith('le ')) return 'un ' + b.slice(3);
  if (b.startsWith('la ')) return 'une ' + b.slice(3);
  if (b.startsWith("l'")) return (n.frf ? 'une ' : 'un ') + b.slice(2);
  return b;
}
function pickVocab(filter) { return pickW(VOCAB.filter(filter), x => weekFactor(x.week) * boxFactor('v:' + x.id), x => 'v:' + x.id); }
function vocabDistractors(it, field) {
  const same = shuffle(VOCAB.filter(x => x.type === it.type && x !== it && field(x) !== field(it)));
  const out = [], seen = new Set([field(it)]);
  for (const x of same) { if (!seen.has(field(x))) { seen.add(field(x)); out.push(x); } if (out.length === 3) break; }
  return out;
}
function vocabHtml(it) { return it.type === 'n' ? `<span class="${it.art}">${it.art} ${esc(it.de)}</span>` : esc(it.disp); }
function nextPerson() { if (!G.bag.length) G.bag = shuffle([0, 1, 2, 3, 4, 5]); return G.bag.pop(); }

const MODES = {
  articles: { title: 'Articles', sub: 'der · die · das', ic: '🎨', kinds: { art: 1 }, keys: 'a:' },
  verbes: { title: 'Verbes', sub: 'ich, du, er …', ic: '🏃‍♀️', kinds: { conjForm: 5, conjPron: 2, conjType: 2 }, keys: 'c:' },
  vocab: { title: 'Vocabulaire', sub: 'mots & orthographe', ic: '📚', kinds: { fr2de: 3, de2fr: 2, emoji: 2, spellPick: 2, spellType: 2 }, keys: 'v:' },
  grammaire: { title: 'Grammaire', sub: 'sein/ihr · im · es gibt · morgen', ic: '🧩', kinds: { gram: 1 }, keys: 'g:' },
  mix: { title: 'Grand Quiz', sub: 'Un peu de tout !', ic: '🏆', kinds: { art: 3, conjForm: 2, conjPron: 1, conjType: 1, fr2de: 1, de2fr: 1, emoji: 1, spellPick: 1, spellType: 1, gram: 3 } }
};
function pickKind(mode) {
  const ks = Object.entries(MODES[mode].kinds).filter(([k]) => S.settings.typing || !/Type$/.test(k));
  return pickW(ks, x => x[1])[0];
}

// ---------------------------------------------------------------- partie
let G = null;
function recentAcc() { const h = S.history.slice(-40); return h.length < 5 ? 0.7 : h.reduce((a, b) => a + b, 0) / h.length; }
function makeBots() {
  const lvl = S.settings.level;
  const off = { facile: [-0.1, -0.18, -0.25, -0.32], auto: [0.06, -0.04, -0.12, -0.22], fort: [0.15, 0.08, 0, -0.08] }[lvl] || [0.06, -0.04, -0.12, -0.22];
  const spd = { facile: 1.25, auto: 1, fort: 0.8 }[lvl] || 1;
  const r = recentAcc();
  return shuffle(BOT_POOL.filter(b => b.em !== S.player.avatar)).slice(0, 4).map((b, i) => Object.assign({}, b, {
    acc: clamp(r + off[i], 0.3, 0.96), spd: spd * (0.85 + Math.random() * 0.3), score: 0, streak: 0, prev: 0, bot: true
  }));
}
function startGame(mode) {
  Snd.init();
  G = { mode, n: mode === 'mix' ? Math.max(S.settings.qCount, 12) : S.settings.qCount, i: 0, used: new Set(), bag: [],
    me: { name: S.player.name, em: S.player.avatar, bg: '#ffe3f1', score: 0, streak: 0, correct: 0, prev: 0, me: true },
    bots: makeBots(), mistakes: [] };
  renderLobby();
}
function everyone() { return [G.me, ...G.bots].sort((a, b) => b.score - a.score); }

function renderLobby() {
  const m = MODES[G.mode];
  const card = (p, i) => `<div class="pl-card ${p.me ? 'me' : ''}" style="animation-delay:${i * 0.35}s"><div class="em" style="background:${p.bg}">${p.em}</div><b>${esc(p.name)}</b><small>${p.me ? 'toi !' : 'prêt·e !'}</small></div>`;
  app.innerHTML = `<div class="screen lobby"><div class="wrap" style="display:flex;flex-direction:column;gap:18px;align-items:center">
    <div class="pill">${m.ic} ${m.title} · ${G.n} questions</div>
    <h2>Les joueurs arrivent…</h2>
    <div class="players">${[G.me, ...G.bots].map(card).join('')}</div>
    <button class="btn big" data-a="go">C'est parti ! 🚀</button>
    <button class="btn soft" data-a="home">← Menu</button></div></div>`;
  G.bots.forEach((b, i) => setTimeout(() => Snd.pop(), (i + 1) * 350));
}
function countdown() {
  let k = 3;
  const step = () => {
    if (!G) return;
    if (k === 0) { nextQ(); return; }
    app.innerHTML = `<div class="screen" style="justify-content:center;align-items:center"><div class="count">${k}</div></div>`;
    Snd.count(false); k--; setTimeout(step, 750);
  };
  step();
}

function nextQ() {
  if (G.i >= G.n) return endGame();
  const kind = pickKind(G.mode);
  const q = GEN[kind]();
  q.kind = kind;
  q.time = q.type === 'type' ? S.settings.time * 2 + 5 : S.settings.time + (q.extraTime || 0);
  G.q = q; G.i++; G.answered = false;
  [G.me, ...G.bots].forEach(p => { p.prev = everyone().indexOf(p); });
  G.bots.forEach(b => {
    b.ok = Math.random() < b.acc * (q.type === 'type' ? 0.92 : 1);
    b.t = Math.min(q.time * 0.95, q.time * (0.16 + Math.random() * 0.5) * b.spd);
    b.done = false;
  });
  renderQuestion();
  G.t0 = performance.now(); G.lastSec = -1;
  Music.start();
  if (q.sayAtStart) setTimeout(() => speak(q.sayAtStart), 250);
  G.raf = requestAnimationFrame(tick);
}
function renderQuestion() {
  const q = G.q;
  const SH = ['▲', '◆', '●', '■'];
  let answers;
  if (q.type === 'type') {
    answers = `<form class="typebox" id="tb">
      <input id="ti" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" enterkeyhint="done" placeholder="${esc(q.placeholder || '')}">
      <div class="keys"><button type="button" data-k="ä">ä</button><button type="button" data-k="ö">ö</button><button type="button" data-k="ü">ü</button><button type="submit" class="btn mint" style="flex:2">OK ✓</button></div></form>`;
  } else {
    answers = `<div class="answers ${q.layout === 'three' ? 'three' : q.layout === 'two' ? 'three two' : q.layout === 'list' ? 'list' : ''}">${q.choices.map((c, i) =>
      `<button class="ans ${c.cls}" data-a="ans" data-i="${i}"><span class="sh">${SH[i % 4]}</span>${c.label}</button>`).join('')}</div>`;
  }
  app.innerHTML = `<div class="screen q-screen"><div class="wrap" style="display:flex;flex-direction:column;gap:10px;flex:1">
    <div class="q-top"><button class="x" data-a="quit">✕</button><span class="pill">${G.i} / ${G.n}</span><span class="pill">⭐ ${G.me.score}</span><div class="spacer"></div><div class="clock" id="clock">${Math.ceil(q.time)}</div></div>
    <div class="timer" id="timer"><i></i></div>
    <div class="bots">${G.bots.map((b, i) => `<div class="bot" id="bot${i}" style="background:${b.bg}">${b.em}</div>`).join('')}</div>
    <div class="card prompt"><span class="kind">${q.kindLabel}</span>${q.isNew ? '<span class="badge-new">Nouveau !</span>' : ''}${q.html}</div>
    ${answers}</div></div>`;
}
function tick() {
  if (!G || G.answered || !G.q) return;
  if (G.paused) { G.raf = requestAnimationFrame(tick); return; }
  const el = (performance.now() - G.t0) / 1000, q = G.q, left = Math.max(0, q.time - el);
  const bar = $('#timer i'), clock = $('#clock');
  if (bar) bar.style.transform = `scaleX(${left / q.time})`;
  const sec = Math.ceil(left);
  if (clock && sec !== G.lastSec) {
    clock.textContent = sec; G.lastSec = sec;
    const low = left <= 5 && left > 0;
    clock.classList.toggle('low', low); $('#timer').classList.toggle('low', low);
    if (low) Snd.tick();
  }
  G.bots.forEach((b, i) => { if (!b.done && el >= b.t) { b.done = true; const e = $('#bot' + i); if (e) e.classList.add('done'); } });
  if (left <= 0) {
    if (q.type === 'type') { const ti = $('#ti'); submit(ti ? ti.value : '', true); } else submit(null, true);
    return;
  }
  G.raf = requestAnimationFrame(tick);
}
document.addEventListener('visibilitychange', () => {
  if (!G) return;
  if (document.hidden) { G.paused = performance.now(); Music.stop(); }
  else if (G.paused) { const d = performance.now() - G.paused; G.t0 += d; G.paused = 0; if (!G.answered && G.q) Music.start(); }
});

const norm = s => String(s).normalize('NFC').trim().replace(/\s+/g, ' ').replace(/ß/g, 'ss').replace(/[’`´]/g, "'");
function gradeType(q, text) {
  const t = norm(text), exp = norm(q.accept);
  if (!t) return { res: false, why: 'Pas de réponse.' };
  if (t === exp) return { res: true };
  if (t.toLowerCase() === exp.toLowerCase()) {
    if (q.lower) return { res: true };
    if (q.word) return { res: 'almost', why: exp[0] === exp[0].toLowerCase() ? 'Presque ! Ce mot s\'écrit avec une <b>minuscule</b>.' + (exp === 'morgen' ? ' (<b>morgen</b> = demain, <b>der Morgen</b> = le matin)' : '') : 'Presque ! Ce mot commence par une <b>majuscule</b>.' };
    return { res: 'almost', why: 'Presque ! Attention à la <b>majuscule</b> : les noms allemands commencent par une majuscule.' };
  }
  if (q.noun) {
    const w = q.noun.de, words = t.split(' ');
    const last = words[words.length - 1];
    if (words.length === 1 && last.toLowerCase() === w.toLowerCase()) return { res: 'almost', why: "Presque ! N'oublie pas l'<b>article</b>." };
    if (words.length === 2 && last.toLowerCase() === w.toLowerCase()) return { res: false, why: `Le mot est juste, mais l'article est <b class="${q.noun.art}">${q.noun.art}</b>.` };
  }
  return { res: false, why: `Tu as écrit : « ${esc(t)} »` };
}

function submit(value, timeout) {
  if (!G || G.answered) return;
  G.answered = true; cancelAnimationFrame(G.raf); Music.stop();
  const q = G.q, el = Math.min((performance.now() - G.t0) / 1000, q.time);
  let res, why = '';
  if (q.type === 'type') { const g = gradeType(q, value || ''); res = g.res; why = g.why || ''; }
  else res = value !== null && value === q.correct;
  if (timeout && (value === null || value === '')) why = 'Temps écoulé ! ⏰';

  // points (façon Kahoot : plus on est rapide, plus on gagne)
  const me = G.me; let pts = 0;
  if (res === true) { me.streak++; pts = Math.round(1000 * (1 - 0.5 * el / q.time)) + (me.streak >= 2 ? Math.min(me.streak - 1, 5) * 100 : 0); me.correct++; }
  else if (res === 'almost') { me.streak = 0; pts = Math.round(500 * (1 - 0.5 * el / q.time)); }
  else me.streak = 0;
  me.score += pts; me.last = pts;
  G.bots.forEach(b => {
    b.done = true;
    if (b.ok) { b.streak++; b.last = Math.round(1000 * (1 - 0.5 * b.t / q.time)) + (b.streak >= 2 ? Math.min(b.streak - 1, 5) * 100 : 0); b.score += b.last; }
    else { b.streak = 0; b.last = 0; }
  });

  // progrès
  q.keys.forEach(k => record(k, res));
  if (q.person) { const [inf, p] = q.person; const a = S.persons[inf] || (S.persons[inf] = [0, 0, 0, 0, 0, 0]); a[p]++; }
  S.history.push(res === true ? 1 : 0); if (S.history.length > 80) S.history = S.history.slice(-80);
  if (res !== true) G.mistakes.push({ q: q.review, a: q.answerPlain });
  save();

  // affichage
  if (q.type === 'type') {
    const tb = $('#tb'); if (tb) tb.classList.add(res === true ? 'righttype' : 'wrongtype');
    const ti = $('#ti'); if (ti) ti.blur();
  } else {
    $$('.ans').forEach((b, i) => {
      const c = q.choices[i];
      if (c.value === q.correct) { b.classList.add('right'); b.insertAdjacentHTML('beforeend', '<span class="mark">✓</span>'); }
      else { b.classList.add('dim'); if (String(i) === String(G.chosen)) { b.classList.remove('dim'); b.classList.add('wrong'); b.insertAdjacentHTML('beforeend', '<span class="mark">✗</span>'); } }
    });
  }
  if (res === true) Snd.good(); else if (res === 'almost') Snd.almost(); else Snd.bad();
  setTimeout(() => speak(q.say), 300);
  setTimeout(() => showFeedback(res, pts, why), 750);
}

const CHEERS = ['Bravo !', 'Super !', 'Génial !', 'Toll !', 'Prima !', 'Wunderbar !', 'Klasse !'];
function showFeedback(res, pts, why) {
  const q = G.q;
  const v = res === true ? { c: 'ok', e: rnd(['🎉', '🌟', '💖', '🥳']), t: rnd(CHEERS) } : res === 'almost' ? { c: 'almost', e: '🤏', t: 'Presque !' } : { c: 'ko', e: rnd(['🙈', '😿', '🫣']), t: 'Oups !' };
  const all = everyone();
  const rows = all.map((p, i) => {
    const mv = p.prev > i ? '<span class="mv up">▲</span>' : p.prev < i ? '<span class="mv down">▼</span>' : '<span class="mv"></span>';
    return `<div class="brow ${p.me ? 'me' : ''}"><span class="rk">${i + 1}</span>${mv}<span class="em">${p.em}</span><span>${esc(p.name)}</span><span class="muted" style="font-size:13px">${p.last ? '+' + p.last : ''}</span><span class="sc">${p.score}</span></div>`;
  }).join('');
  const last = G.i >= G.n;
  const sheet = document.createElement('div');
  sheet.className = 'sheet-bg';
  sheet.innerHTML = `<div class="sheet">
    <div class="verdict ${v.c}"><span class="big">${v.e}</span><h2>${v.t}</h2><span class="points">+${pts}</span></div>
    ${G.me.streak >= 2 ? `<div class="pill" style="margin-top:6px">🔥 ${G.me.streak} bonnes réponses de suite !</div>` : ''}
    <div class="answer-line"><span>${q.answerHtml}</span><button class="say" data-a="say">🔊</button></div>
    ${why ? `<div class="muted" style="font-weight:700">${why}</div>` : ''}
    ${q.tip ? `<div class="tip">💡 ${q.tip}</div>` : ''}
    <div class="board">${rows}</div>
    <button class="btn big" style="width:100%" data-a="next">${last ? 'Résultats 🏆' : 'Suivant ▶'}</button></div>`;
  app.appendChild(sheet);
}

function endGame() {
  Music.stop();
  const all = everyone(), rank = all.indexOf(G.me) + 1, acc = G.me.correct / G.n;
  let stars = { 1: 3, 2: 2, 3: 1 }[rank] || 0;
  if (G.me.correct === G.n) stars++;
  S.stars += stars; S.games++; if (rank === 1) S.wins++;
  const reward = rank === 1 || acc >= 0.8;
  let idea = null;
  if (reward) { idea = makeIdea(); S.pending.push(idea); }
  save();
  const pod = (p, k) => p ? `<div class="pod p${k} ${p.me ? 'me' : ''}"><span class="em">${p.em}</span><b>${esc(p.name)}</b><span class="muted" style="font-weight:800">${p.score}</span><div class="blk" style="animation-delay:${(3 - k) * 0.25}s">${k}</div></div>` : '';
  const msg = rank === 1 ? `Tu as gagné, ${esc(S.player.name)} ! 🎉` : rank <= 3 ? `Bravo, ${rank}<sup>e</sup> place !` : 'Bien joué, on recommence ?';
  const mist = G.mistakes.length ? `<div class="card" style="margin-top:12px"><h3>À revoir 📝</h3><div class="mist">${G.mistakes.map(m => `<div>${esc(m.q)} → <b>${esc(m.a)}</b></div>`).join('')}</div></div>` : `<div class="card center" style="margin-top:12px"><h3>Aucune faute ! 🌈</h3></div>`;
  app.innerHTML = `<div class="screen"><div class="wrap">
    <div class="result-msg"><h1>${msg}</h1><p class="muted" style="font-weight:800;margin:4px 0">${G.me.correct} / ${G.n} bonnes réponses</p></div>
    <div class="podium">${pod(all[1], 2)}${pod(all[0], 1)}${pod(all[2], 3)}</div>
    ${rank > 3 ? `<p class="center muted" style="font-weight:800">Tu es ${rank}<sup>e</sup> avec ${G.me.score} points.</p>` : ''}
    <div class="stars-row">${stars ? '⭐'.repeat(stars) : '💪'}</div>
    <p class="center muted" style="font-weight:700;margin:0">${stars ? `+${plural(stars, 'étoile', 'étoiles')}` : 'Continue, tu vas y arriver !'}</p>
    ${reward ? `<div class="card center" style="margin-top:12px;background:linear-gradient(135deg,#fff,#ffeef7)"><h2 style="color:#8f5bd9">🎁 Récompense : un dessin !</h2><p style="font-weight:700;margin:6px 0 10px">${rank === 1 ? 'Tu as battu tout le monde !' : 'Plus de 80 % de bonnes réponses !'} Tu peux dessiner un personnage kawaii.</p><button class="btn big lav" data-a="reward" data-id="${idea.id}">🎨 Voir mon idée de dessin</button></div>` : `<p class="center muted" style="font-weight:700">🎨 Gagne une partie (ou 8 bonnes réponses sur 10) pour débloquer un dessin !</p>`}
    ${mist}
    <div class="row" style="justify-content:center;margin-top:14px;flex-wrap:wrap"><button class="btn mint" data-a="again">Rejouer 🔁</button><button class="btn soft" data-a="home">Menu 🏠</button></div>
  </div></div>`;
  if (rank === 1) { Snd.fanfare(); confetti(); } else if (rank <= 3) Snd.good();
}
function confetti() {
  const c = document.createElement('div'); c.className = 'confetti';
  const bits = ['🎉', '⭐', '💖', '🌸', '✨', '🎈', '🍓'];
  for (let i = 0; i < 40; i++) {
    const e = document.createElement('i'); e.textContent = rnd(bits);
    e.style.left = Math.random() * 100 + 'vw'; e.style.animationDuration = 2 + Math.random() * 2.5 + 's'; e.style.animationDelay = Math.random() * 1.2 + 's';
    c.appendChild(e);
  }
  document.body.appendChild(c); setTimeout(() => c.remove(), 5500);
}

// ---------------------------------------------------------------- idées de dessin
const CHARS = [
  { fr: 'un petit lapin', de: 'Der Hase', em: '🐰' }, { fr: 'une petite chatte', de: 'Die Katze', em: '🐱', f: 1 },
  { fr: 'un bébé panda', de: 'Der Panda', em: '🐼' }, { fr: 'une licorne', de: 'Das Einhorn', em: '🦄', f: 1 },
  { fr: 'un petit renard', de: 'Der Fuchs', em: '🦊' }, { fr: 'une petite souris', de: 'Die Maus', em: '🐭', f: 1 },
  { fr: 'un ourson', de: 'Der Bär', em: '🐻' }, { fr: 'un petit pingouin', de: 'Der Pinguin', em: '🐧' },
  { fr: 'un hamster tout rond', de: 'Der Hamster', em: '🐹' }, { fr: 'un petit chiot', de: 'Der Hund', em: '🐶' },
  { fr: 'une fraise kawaii', de: 'Die Erdbeere', em: '🍓', f: 1 }, { fr: 'un petit nuage', de: 'Die Wolke', em: '☁️' },
  { fr: 'une petite pieuvre', de: 'Der Tintenfisch', em: '🐙', f: 1 }, { fr: 'un petit koala', de: 'Der Koala', em: '🐨' }
];
const EXTRAS = [
  f => 'avec un chapeau en forme de fraise 🍓', f => 'avec des joues toutes roses 🌸', f => 'avec un joli nœud 🎀',
  f => `entouré${f ? 'e' : ''} de petites étoiles ✨`, f => 'avec un ami nuage ☁️', f => 'sous un arc-en-ciel 🌈',
  f => 'avec une écharpe toute douce 🧣', f => 'avec un ballon en forme de cœur 🎈', f => 'avec des lunettes rondes 👓',
  f => 'avec un bonnet à pompon', f => 'avec une tasse de chocolat chaud ☕', f => 'avec un petit sac à dos 🎒'
];
const PALETTES = [
  { name: 'Bonbon', c: ['#ffb3d1', '#b9a6ff', '#9fe3c8'] }, { name: 'Pêche', c: ['#ffd6a5', '#fdffb6', '#caffbf'] },
  { name: 'Ciel', c: ['#a0c4ff', '#bdb2ff', '#ffc6ff'] }, { name: 'Glace', c: ['#ffadad', '#ffd6a5', '#9bf6ff'] },
  { name: 'Forêt', c: ['#b5e48c', '#ffe5b4', '#f4acb7'] }
];
const SC = window.DP_SCENES;
function sceneForIdea(idea) {
  if (idea.scene && SC.SCENES[idea.scene]) return idea.scene;
  const n = NOUNS.find(x => x.loc && idea.de && idea.de.includes(' ' + x.loc + ' ' + x.de + '.'));
  const ids = n ? SC.forPlace(n.de) : [];
  idea.scene = ids[0] || 'schlafzimmer'; save();
  return idea.scene;
}
function makeIdea() {
  const ch = rnd(CHARS);
  const places = NOUNS.filter(n => n.loc && n.acts && SC.forPlace(n.de).length);
  const n = pickW(places, x => weekFactor(x.week));
  const acts = n.acts.filter(a => a !== 'sein');
  const inf = acts.length ? rnd(acts) : 'sein';
  const v = VERB[inf];
  const frAct = inf === 'sein' ? 'est' : (ch.f && v.frActF ? v.frActF : v.frAct);
  return {
    id: Date.now() + '' + Math.floor(Math.random() * 1000), em: ch.em, ch: ch.fr,
    scene: rnd(SC.forPlace(n.de)),
    de: `${ch.de} ${formsOf(inf)[2]} ${n.loc} ${n.de}.`,
    fr: `Dessine ${ch.fr} qui ${frAct} ${n.frLoc || ''}`.trim() + '.',
    extra: rnd(EXTRAS)(ch.f), pal: rnd(PALETTES)
  };
}
function renderIdea(id) {
  const idea = S.pending.find(x => x.id === id) || S.pending[0];
  if (!idea) return renderHome();
  const scene = sceneForIdea(idea);
  app.innerHTML = `<div class="screen"><div class="wrap" style="display:flex;flex-direction:column;gap:14px">
    <div class="row"><button class="btn soft" data-a="home">←</button><h2 style="font-size:28px">Ton idée de dessin 🎨</h2></div>
    <div class="idea"><div class="de">${esc(idea.em)} ${esc(idea.de)}</div><button class="say" data-a="sayidea" data-t="${esc(idea.de)}">🔊</button>
      <div class="fr">${esc(idea.fr)}</div><div class="extra">… ${esc(idea.extra)}</div>
      <canvas id="pv" width="600" height="600" class="preview"></canvas>
      <div style="font-weight:800;margin-top:8px">Le décor est prêt ! Tu n'as plus qu'à dessiner ${esc(idea.ch || 'le personnage')} ${esc(idea.em)}</div>
      <div class="swatches">${idea.pal.c.map(c => `<i style="background:${c}"></i>`).join('')}</div><div class="muted" style="font-weight:700;font-size:14px;margin-top:4px">Couleurs « ${idea.pal.name} » — ou celles que tu veux !</div></div>
    <button class="btn big lav" data-a="draw" data-id="${idea.id}">✏️ Dessiner maintenant</button>
    ${idea.rerolled ? '' : `<button class="btn soft" data-a="reroll" data-id="${idea.id}">🎲 Une autre idée</button>`}
    <button class="btn soft" data-a="home">Plus tard (je la garde)</button>
  </div></div>`;
  SC.paint(scene, $('#pv').getContext('2d'), 600).catch(() => {});
  setTimeout(() => speak(idea.de), 300);
}

// ---------------------------------------------------------------- dessin
// Deux calques : le décor (en dessous, jamais effacé) et le dessin (au-dessus).
const COLORS = ['#3a2d5c', '#7a5230', '#e8364f', '#ff8fc1', '#ffc4dd', '#ff9a3c', '#ffd25e', '#fff3a8', '#3cbf6a', '#9fe3c8', '#3a8bff', '#a0d4ff', '#9b6bff', '#d6c6ff', '#9aa0a6', '#ffffff'];
const N = 1200;                       // taille du dessin en pixels (carré)
const SIZES = [8, 18, 36, 70];
const STAMP_SIZES = [90, 150, 240, 360];
const STAMPS = ['⭐', '💖', '🌸', '✨', '🍓', '☁️', '🌈', '🎀', '🐾', '🍰', '🌙', '🦋'];
let D = null;
function renderDraw(id) {
  const idea = S.pending.find(x => x.id === id);
  if (!idea) return renderHome();
  const scene = sceneForIdea(idea);
  D = { idea, tool: 'pen', color: COLORS[0], size: 1, stamp: '⭐', undo: [], dirty: false, pid: null, bgData: null };
  app.innerHTML = `<div class="screen draw-screen">
    <div class="draw-head"><button class="btn soft" style="padding:10px 14px" data-a="drawback">←</button>
      <div class="idea-mini">${idea.em} ${esc(idea.de)}<small>${esc(idea.fr)} ${esc(idea.extra)}</small></div>
      <button class="btn mint" style="padding:10px 14px" data-a="drawsave">✓ Fini</button></div>
    <div class="canvas-wrap" id="cw"><div class="paper" id="paper"><canvas id="bg" width="${N}" height="${N}"></canvas><canvas id="cv" width="${N}" height="${N}"></canvas></div></div>
    <div class="colors">${COLORS.map(c => `<button data-a="color" data-c="${c}" style="background:${c}" class="${c === D.color ? 'on' : ''}"></button>`).join('')}</div>
    <div class="stamps" id="stamps" hidden>${STAMPS.map(s => `<button data-a="stamp" data-s="${s}" class="${s === D.stamp ? 'on' : ''}">${s}</button>`).join('')}</div>
    <div class="tools">
      <button class="t on" data-a="tool" data-t="pen">🖌️</button><button class="t" data-a="tool" data-t="fill">🪣</button>
      <button class="t" data-a="tool" data-t="stamp">⭐</button><button class="t" data-a="tool" data-t="eraser">🧽</button>
      <span style="width:8px"></span>
      ${SIZES.map((s, i) => `<button class="t ${i === D.size ? 'on' : ''}" data-a="size" data-i="${i}"><span class="dot" style="width:${6 + i * 6}px;height:${6 + i * 6}px"></span></button>`).join('')}
      <span style="width:8px"></span>
      <button class="t" data-a="undo">↩️</button><button class="t" data-a="clear">🗑️</button>
    </div></div>`;
  const cv = $('#cv');
  D.cv = cv; D.ctx = cv.getContext('2d', { willReadFrequently: true });
  const bgc = $('#bg').getContext('2d', { willReadFrequently: true });
  D.bgc = bgc;
  bgc.fillStyle = '#fff'; bgc.fillRect(0, 0, N, N);
  const myD = D;
  SC.paint(scene, bgc, N).then(() => { if (D === myD) { try { D.bgData = bgc.getImageData(0, 0, N, N); } catch (e) { D.bgData = null; } } }).catch(() => {});
  fitPaper();
  cv.addEventListener('pointerdown', penDown);
  cv.addEventListener('pointermove', penMove);
  cv.addEventListener('pointerup', penUp);
  cv.addEventListener('pointercancel', penUp);
}
function fitPaper() {
  const wrap = $('#cw'), paper = $('#paper'); if (!wrap || !paper) return;
  const r = wrap.getBoundingClientRect();
  const s = Math.max(50, Math.floor(Math.min(r.width, r.height)));
  paper.style.width = paper.style.height = s + 'px';
}
addEventListener('resize', () => { if (D && $('#paper')) setTimeout(fitPaper, 120); });
function cpos(e) { const r = D.cv.getBoundingClientRect(); return { x: (e.clientX - r.left) * N / r.width, y: (e.clientY - r.top) * N / r.height }; }
function pushUndo() { try { D.undo.push(D.ctx.getImageData(0, 0, N, N)); if (D.undo.length > 6) D.undo.shift(); } catch (e) { /* mémoire */ } D.dirty = true; }
function lineW(e) { const base = SIZES[D.size] * (D.tool === 'eraser' ? 1.8 : 1); return e.pointerType === 'pen' && e.pressure > 0 ? base * (0.45 + e.pressure * 1.1) : base; }
function penMode() { const c = D.ctx; c.globalCompositeOperation = D.tool === 'eraser' ? 'destination-out' : 'source-over'; c.fillStyle = c.strokeStyle = D.color; c.lineCap = 'round'; c.lineJoin = 'round'; return c; }
function penDown(e) {
  e.preventDefault();
  if (D.pid !== null) return;
  const p = cpos(e);
  D.ctx.globalCompositeOperation = 'source-over';
  if (D.tool === 'fill') { pushUndo(); flood(p.x, p.y, D.color); return; }
  if (D.tool === 'stamp') {
    pushUndo();
    D.ctx.font = `${STAMP_SIZES[D.size]}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`; D.ctx.textAlign = 'center'; D.ctx.textBaseline = 'middle';
    D.ctx.fillText(D.stamp, p.x, p.y); Snd.pop(); return;
  }
  pushUndo();
  D.pid = e.pointerId; try { D.cv.setPointerCapture(e.pointerId); } catch (er) { /* rien */ }
  D.last = p; D.mid = p;
  const c = penMode();
  c.beginPath(); c.arc(p.x, p.y, lineW(e) / 2, 0, Math.PI * 2); c.fill();
}
function penMove(e) {
  if (D.pid !== e.pointerId) return;
  e.preventDefault();
  const evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
  const c = penMode();
  for (const ev of (evs.length ? evs : [e])) {
    const p = cpos(ev), mid = { x: (D.last.x + p.x) / 2, y: (D.last.y + p.y) / 2 };
    c.lineWidth = lineW(ev);
    c.beginPath(); c.moveTo(D.mid.x, D.mid.y); c.quadraticCurveTo(D.last.x, D.last.y, mid.x, mid.y); c.stroke();
    D.last = p; D.mid = mid;
  }
}
function penUp(e) {
  if (D.pid !== e.pointerId) return;
  const c = penMode(); c.beginPath(); c.moveTo(D.mid.x, D.mid.y); c.lineTo(D.last.x, D.last.y); c.stroke();
  c.globalCompositeOperation = 'source-over';
  D.pid = null;
}
// Pot de peinture : regarde l'image visible (décor + dessin) et peint sur le calque du dessin.
function flood(x0, y0, hex) {
  const w = N, h = N; x0 = Math.floor(x0); y0 = Math.floor(y0);
  if (x0 < 0 || y0 < 0 || x0 >= w || y0 >= h) return;
  const img = D.ctx.getImageData(0, 0, w, h), d = img.data, b = D.bgData ? D.bgData.data : null;
  const comp = new Uint8ClampedArray(w * h * 3);
  for (let i = 0, j = 0; i < d.length; i += 4, j += 3) {
    const a = d[i + 3] / 255;
    comp[j] = d[i] * a + (b ? b[i] : 255) * (1 - a); comp[j + 1] = d[i + 1] * a + (b ? b[i + 1] : 255) * (1 - a); comp[j + 2] = d[i + 2] * a + (b ? b[i + 2] : 255) * (1 - a);
  }
  const k0 = (y0 * w + x0) * 3, tr = comp[k0], tg = comp[k0 + 1], tb = comp[k0 + 2];
  const fr = parseInt(hex.slice(1, 3), 16), fg = parseInt(hex.slice(3, 5), 16), fb = parseInt(hex.slice(5, 7), 16);
  if (Math.abs(tr - fr) + Math.abs(tg - fg) + Math.abs(tb - fb) < 12) return;
  const seen = new Uint8Array(w * h), TOL = 90;
  const dist = i => Math.abs(comp[i * 3] - tr) + Math.abs(comp[i * 3 + 1] - tg) + Math.abs(comp[i * 3 + 2] - tb);
  const match = i => !seen[i] && dist(i) <= TOL;
  const paint = i => { seen[i] = 1; d[i * 4] = fr; d[i * 4 + 1] = fg; d[i * 4 + 2] = fb; d[i * 4 + 3] = 255; };
  const stack = [x0, y0];
  while (stack.length) {
    const y = stack.pop(), x = stack.pop();
    let cx = x, i = y * w + cx;
    while (cx >= 0 && match(i)) { cx--; i--; }
    cx++; i++;
    let up = false, down = false;
    while (cx < w && match(i)) {
      paint(i);
      if (y > 0) { if (match(i - w)) { if (!up) { stack.push(cx, y - 1); up = true; } } else up = false; }
      if (y < h - 1) { if (match(i + w)) { if (!down) { stack.push(cx, y + 1); down = true; } } else down = false; }
      cx++; i++;
    }
  }
  // couvre le petit bord flou autour des traits
  const grow = [];
  for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
    const i = y * w + x; if (seen[i]) continue;
    if ((seen[i - 1] || seen[i + 1] || seen[i - w] || seen[i + w]) && dist(i) < 260) grow.push(i);
  }
  grow.forEach(paint);
  D.ctx.putImageData(img, 0, 0);
  Snd.pop();
}
async function saveDrawing() {
  const out = document.createElement('canvas'); out.width = out.height = N;
  const o = out.getContext('2d');
  let img;
  try { o.drawImage($('#bg'), 0, 0); o.drawImage(D.cv, 0, 0); img = out.toDataURL('image/jpeg', 0.88); }
  catch (e) { o.globalCompositeOperation = 'copy'; o.fillStyle = '#fff'; o.fillRect(0, 0, N, N); o.globalCompositeOperation = 'source-over'; o.drawImage(D.cv, 0, 0); img = out.toDataURL('image/jpeg', 0.88); }
  try {
    await dbPut({ img, de: D.idea.de, fr: D.idea.fr, em: D.idea.em, date: Date.now() });
  } catch (e) { alert("Oups, le dessin n'a pas pu être enregistré."); return; }
  S.pending = S.pending.filter(x => x.id !== D.idea.id); S.drawings++; save();
  D = null; Snd.fanfare(); confetti();
  renderGallery('Bravo ! Ton dessin est dans ta galerie 🖼️');
}

// ---------------------------------------------------------------- galerie (IndexedDB)
function idb() {
  return new Promise((res, rej) => {
    const r = indexedDB.open('deutschParty', 1);
    r.onupgradeneeded = () => r.result.createObjectStore('drawings', { keyPath: 'id', autoIncrement: true });
    r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
  });
}
async function dbTx(mode, fn) {
  const db = await idb();
  return new Promise((res, rej) => { const st = db.transaction('drawings', mode).objectStore('drawings'); const r = fn(st); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
}
const dbPut = o => dbTx('readwrite', st => st.add(o));
const dbAll = () => dbTx('readonly', st => st.getAll());
const dbDel = id => dbTx('readwrite', st => st.delete(id));
let GAL = [];
async function renderGallery(msg) {
  try { GAL = (await dbAll()).reverse(); } catch (e) { GAL = []; }
  app.innerHTML = `<div class="screen"><div class="wrap" style="display:flex;flex-direction:column;gap:12px">
    <div class="row"><button class="btn soft" data-a="home">←</button><h2 style="font-size:28px">Mes dessins 🖼️</h2></div>
    ${msg ? `<div class="card center" style="font-weight:800;font-size:18px">${msg}</div>` : ''}
    ${GAL.length ? `<div class="gal">${GAL.map(g => `<button data-a="view" data-id="${g.id}"><img src="${g.img}" alt=""><small>${esc(g.em || '')} ${new Date(g.date).toLocaleDateString('fr-CH')}</small></button>`).join('')}</div>`
      : '<div class="card center"><p style="font-weight:800">Pas encore de dessin.<br>Gagne une partie pour en débloquer un ! 🏆</p></div>'}
  </div></div>`;
}
function renderViewer(id) {
  const g = GAL.find(x => String(x.id) === String(id)); if (!g) return renderGallery();
  app.innerHTML = `<div class="screen viewer"><div class="wrap" style="display:flex;flex-direction:column;gap:12px">
    <div class="row"><button class="btn soft" data-a="gallery">←</button><div class="spacer"></div><button class="btn soft" data-a="delpic" data-id="${g.id}">🗑️</button></div>
    <img src="${g.img}" alt="">
    <div class="card"><b style="font-family:var(--display);font-size:22px">${esc(g.de)}</b><div class="muted" style="font-weight:700">${esc(g.fr)}</div></div>
    <p class="muted center" style="font-weight:700;font-size:14px">Astuce : appuie longtemps sur l'image pour l'enregistrer dans Photos.</p>
  </div></div>`;
}

// ---------------------------------------------------------------- accueil
function mastery(prefix) {
  const keys = prefix === 'a:' ? NOUNS.map(n => 'a:' + n.de) : prefix === 'c:' ? VERBS.map(v => 'c:' + v.inf) : prefix === 'v:' ? VOCAB.map(x => 'v:' + x.id) : RULES.map(r => 'g:' + r.id);
  const pts = keys.reduce((a, k) => a + Math.min((S.stats[k] ? S.stats[k].box : 0), 3), 0);
  return Math.round(100 * pts / (keys.length * 3));
}
function hasNew(mode) {
  if (!MAXW) return false;
  if (mode === 'articles') return NOUNS.some(isNew);
  if (mode === 'verbes') return VERBS.some(isNew);
  if (mode === 'vocab') return VOCAB.some(isNew);
  if (mode === 'grammaire') return RULES.some(isNew);
  return VOCAB.some(isNew) || RULES.some(isNew);
}
function renderHome() {
  G = null; D = null; Music.stop();
  const modeBtn = k => {
    const m = MODES[k];
    if (k === 'mix') return `<button class="mode m-mix" data-a="play" data-m="mix"><span class="ic">${m.ic}</span><span style="flex:1"><b>${m.title}</b><br><small>${m.sub}</small></span>${hasNew(k) ? '<span class="new">Nouveau !</span>' : ''}<span style="font-size:30px">▶</span></button>`;
    const pc = mastery(m.keys);
    return `<button class="mode m-${k}" data-a="play" data-m="${k}">${hasNew(k) ? '<span class="new">Nouveau !</span>' : ''}<span class="ic">${m.ic}</span><span><b>${m.title}</b><br><small>${m.sub}</small><span class="bar"><i style="width:${pc}%"></i></span></span></button>`;
  };
  const n = S.pending.length;
  app.innerHTML = `<div class="screen"><div class="wrap">
    <div class="home-top"><button class="avatar" data-a="avatar">${S.player.avatar}</button>
      <div><b style="font-family:var(--display);font-size:22px">Hallo ${esc(S.player.name)} !</b><div class="muted" style="font-weight:800;font-size:14px">⭐ ${S.stars} · 🏆 ${S.wins} ${S.wins === 1 ? 'victoire' : 'victoires'}</div></div>
      <div class="spacer"></div><button class="gear" data-a="mute">${S.settings.sound ? '🔊' : '🔇'}</button><button class="gear" id="gear">⚙️<span class="ring"></span></button></div>
    <div class="hero">${mascot()}<h1>Deutsch Party</h1><p>Choisis ton jeu !</p></div>
    <div class="modes">${['articles', 'verbes', 'vocab', 'grammaire', 'mix'].map(modeBtn).join('')}</div>
    <div class="home-bottom">
      <button class="tile ${n ? 'glow' : ''}" data-a="pending"><span class="ic">🎨</span><span>${n ? `${plural(n, 'dessin', 'dessins')} à faire !` : 'Gagne pour dessiner !'}</span></button>
      <button class="tile" data-a="gallery"><span class="ic">🖼️</span><span>Mes dessins${S.drawings ? ` (${S.drawings})` : ''}</span></button>
    </div>
  </div></div>`;
  bindGear();
}
function bindGear() {
  const g = $('#gear'); if (!g) return;
  let t = null;
  const stop = () => { clearTimeout(t); g.classList.remove('holding'); };
  g.addEventListener('pointerdown', () => { g.classList.add('holding'); t = setTimeout(() => { stop(); renderParent(); }, 1600); });
  g.addEventListener('pointerup', () => { if (g.classList.contains('holding')) { stop(); toast('Coin des parents : appuie longtemps sur ⚙️'); } });
  g.addEventListener('pointerleave', stop); g.addEventListener('pointercancel', stop);
}
function toast(msg) {
  const t = document.createElement('div');
  t.style.cssText = 'position:fixed;left:50%;bottom:calc(24px + env(safe-area-inset-bottom));transform:translateX(-50%);background:#3a2d5c;color:#fff;padding:10px 16px;border-radius:14px;font-weight:800;z-index:50;animation:fadeIn .2s';
  t.textContent = msg; document.body.appendChild(t); setTimeout(() => t.remove(), 2200);
}
function renderAvatar() {
  app.innerHTML = `<div class="screen"><div class="wrap" style="display:flex;flex-direction:column;gap:14px">
    <div class="row"><button class="btn soft" data-a="home">←</button><h2 style="font-size:28px">Choisis ton personnage</h2></div>
    <div class="card"><div class="choose-av">${AVATARS.map(a => `<button data-a="setav" data-v="${a}" class="${a === S.player.avatar ? 'on' : ''}">${a}</button>`).join('')}</div></div>
  </div></div>`;
}

// ---------------------------------------------------------------- coin des parents
function seg(name, opts, cur) { return `<span class="seg">${opts.map(([v, l]) => `<button data-a="set" data-k="${name}" data-v="${v}" class="${String(v) === String(cur) ? 'on' : ''}">${l}</button>`).join('')}</span>`; }
function accCell(k) {
  const st = S.stats[k]; if (!st || !st.seen) return '<td class="muted">—</td><td></td>';
  const p = Math.round(100 * st.ok / st.seen);
  const col = p >= 80 ? '#d8f5e6' : p >= 50 ? '#fff1c9' : '#ffdce2';
  return `<td><span class="acc" style="background:${col}">${p}%</span> <span class="muted">(${st.seen})</span></td><td>${'●'.repeat(Math.min(st.box, 5))}<span class="muted">${'○'.repeat(5 - Math.min(st.box, 5))}</span></td>`;
}
function renderParent() {
  const s = S.settings;
  const wk = w => `<span class="muted">S${w || 0}</span>`;
  const nounRows = NOUNS.map(n => `<tr><td><b class="${n.art}">${n.art}</b> ${esc(n.de)} ${wk(n.week)}</td>${accCell('a:' + n.de)}</tr>`).join('');
  const verbRows = VERBS.map(v => `<tr><td>${esc(v.inf)} ${wk(v.week)}<br><span class="muted" style="font-size:12px">${(S.persons[v.inf] || [0, 0, 0, 0, 0, 0]).map((c, i) => ['ich', 'du', 'er', 'wir', 'ihr', 'sie'][i] + ':' + c).join(' ')}</span></td>${accCell('c:' + v.inf)}</tr>`).join('');
  const vocRows = VOCAB.map(x => `<tr><td>${esc(x.disp)} ${wk(x.week)}</td>${accCell('v:' + x.id)}</tr>`).join('');
  const gRows = RULES.map(r => `<tr><td>${esc(r.title)} ${wk(r.week)}</td>${accCell('g:' + r.id)}</tr>`).join('');
  const weeks = DATA.weeks.map(w => `<li><b>S${w.week}</b> : ${esc(w.label)} — ${VOCAB.filter(x => (x.week || 0) === w.week).length} mots</li>`).join('');
  app.innerHTML = `<div class="screen parent"><div class="wrap">
    <div class="row"><button class="btn soft" data-a="home">←</button><h2 style="font-size:28px">Coin des parents</h2></div>
    <div class="card" style="margin-top:12px">
      <div class="set"><label>Prénom</label><input type="text" id="pname" value="${esc(S.player.name)}" maxlength="16"></div>
      <div class="set"><label>Questions par partie</label>${seg('qCount', [[8, '8'], [10, '10'], [15, '15']], s.qCount)}</div>
      <div class="set"><label>Temps par question</label>${seg('time', [[15, '15 s'], [20, '20 s'], [30, '30 s']], s.time)}</div>
      <div class="set"><label>Adversaires</label>${seg('level', [['facile', 'Faciles'], ['auto', 'Auto'], ['fort', 'Forts']], s.level)}</div>
      <div class="set"><label>Questions à écrire (clavier)</label>${seg('typing', [[true, 'Oui'], [false, 'Non']], s.typing)}</div>
      <div class="set"><label>Sons</label>${seg('sound', [[true, 'Oui'], [false, 'Non']], s.sound)}</div>
      <div class="set"><label>Musique pendant les questions</label>${seg('music', [[true, 'Oui'], [false, 'Non']], s.music)}</div>
      <div class="set"><label>Voix allemande</label>${seg('speak', [[true, 'Oui'], [false, 'Non']], s.speak)}</div>
      <p class="muted" style="font-size:14px;font-weight:700">« Auto » : les adversaires s'adaptent au niveau récent (${Math.round(recentAcc() * 100)} % de bonnes réponses) pour qu'elle gagne souvent, mais pas toujours.</p>
    </div>
    <h3>Résumé</h3>
    <div class="card"><b>${S.games}</b> parties · <b>${S.wins}</b> victoires · <b>${S.stars}</b> étoiles · <b>${S.drawings}</b> dessins<ul style="margin:8px 0 0;padding-left:20px">${weeks}</ul>
      <p class="muted" style="font-size:14px;font-weight:700;margin-bottom:0">Les mots de la semaine la plus récente apparaissent ~3,5× plus souvent, ceux de la semaine d'avant ~1,6×. Les mots ratés reviennent plus souvent (● = niveau de maîtrise).</p></div>
    <h3>Articles</h3><div class="card"><table class="stats"><tr><th>Mot</th><th>Réussite</th><th>Niveau</th></tr>${nounRows}</table></div>
    <h3>Verbes</h3><div class="card"><table class="stats"><tr><th>Verbe (personnes posées)</th><th>Réussite</th><th>Niveau</th></tr>${verbRows}</table></div>
    <h3>Grammaire</h3><div class="card"><table class="stats"><tr><th>Règle</th><th>Réussite</th><th>Niveau</th></tr>${gRows}</table></div>
    <h3>Vocabulaire</h3><div class="card"><table class="stats"><tr><th>Mot</th><th>Réussite</th><th>Niveau</th></tr>${vocRows}</table></div>
    <h3>Sauvegarde</h3>
    <div class="card"><div class="row" style="flex-wrap:wrap"><button class="btn soft" data-a="export">📤 Exporter</button><label class="btn soft">📥 Importer<input type="file" id="imp" accept="application/json,.json" hidden></label><button class="btn soft" data-a="reset" style="color:#d8434f">Tout effacer</button></div>
      <p class="muted" style="font-size:14px;font-weight:700;margin-bottom:0">Les progrès sont gardés sur cet appareil. L'export ne contient pas les dessins.</p></div>
    <p class="center muted" style="font-size:12px">Deutsch Party · ${VOCAB.length} mots · ${RULES.length} règles</p>
  </div></div>`;
  $('#pname').addEventListener('change', e => { S.player.name = e.target.value.trim() || 'Alinka'; save(); });
  $('#imp').addEventListener('change', async e => {
    const f = e.target.files[0]; if (!f) return;
    try { const o = JSON.parse(await f.text()); if (!o || !o.stats) throw 0; S = Object.assign(DEFAULTS(), o); save(); toast('Progrès importés ✓'); renderParent(); }
    catch (er) { alert("Ce fichier n'est pas une sauvegarde Deutsch Party."); }
  });
}
async function exportData() {
  const blob = new Blob([JSON.stringify(S)], { type: 'application/json' });
  const name = `deutsch-party-${new Date().toISOString().slice(0, 10)}.json`;
  try {
    const file = new File([blob], name, { type: 'application/json' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], title: 'Deutsch Party' }); return; }
  } catch (e) { if (e && e.name === 'AbortError') return; }
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); a.remove();
}

// ---------------------------------------------------------------- clics
app.addEventListener('click', e => {
  const b = e.target.closest('[data-a]'); if (!b) return;
  const a = b.dataset.a;
  Snd.init();
  switch (a) {
    case 'play': Snd.tap(); startGame(b.dataset.m); break;
    case 'go': Snd.tap(); countdown(); break;
    case 'home': renderHome(); break;
    case 'again': startGame(G.mode); break;
    case 'quit': if (confirm('Quitter la partie ?')) { if (G) { G.answered = true; cancelAnimationFrame(G.raf); } renderHome(); } break;
    case 'ans': if (!G || G.answered) return; G.chosen = b.dataset.i; submit(G.q.choices[+b.dataset.i].value); break;
    case 'next': if (G && G.answered) nextQ(); break;
    case 'say': if (G && G.q) speak(G.q.say); break;
    case 'sayq': if (G && G.q) speak(G.q.sayAtStart); break;
    case 'sayidea': speak(b.dataset.t); break;
    case 'mute': S.settings.sound = !S.settings.sound; save(); renderHome(); break;
    case 'avatar': renderAvatar(); break;
    case 'setav': S.player.avatar = b.dataset.v; save(); Snd.pop(); renderHome(); break;
    case 'reward': renderIdea(b.dataset.id); break;
    case 'pending': if (S.pending.length) renderIdea(S.pending[0].id); else toast('Gagne une partie pour débloquer un dessin ! 🏆'); break;
    case 'reroll': { const i = S.pending.findIndex(x => x.id === b.dataset.id); if (i >= 0) { const n = makeIdea(); n.rerolled = true; S.pending[i] = n; save(); renderIdea(n.id); } break; }
    case 'draw': renderDraw(b.dataset.id); break;
    case 'drawback': if (!D || !D.dirty || confirm('Quitter sans enregistrer ton dessin ? (Ton idée reste gardée.)')) renderHome(); break;
    case 'drawsave': if (D) { if (!D.dirty && !confirm('Ton dessin est vide. Enregistrer quand même ?')) return; saveDrawing(); } break;
    case 'color': D.color = b.dataset.c; if (D.tool === 'eraser' || D.tool === 'stamp') setTool('pen'); $$('.colors button').forEach(x => x.classList.toggle('on', x === b)); break;
    case 'tool': setTool(b.dataset.t); break;
    case 'size': D.size = +b.dataset.i; $$('[data-a=size]').forEach(x => x.classList.toggle('on', x === b)); break;
    case 'stamp': D.stamp = b.dataset.s; $$('[data-a=stamp]').forEach(x => x.classList.toggle('on', x === b)); break;
    case 'undo': if (D.undo.length) { D.ctx.putImageData(D.undo.pop(), 0, 0); } break;
    case 'clear': if (confirm('Effacer ton dessin ? (Le décor reste.)')) { pushUndo(); D.ctx.clearRect(0, 0, N, N); } break;
    case 'gallery': renderGallery(); break;
    case 'view': renderViewer(b.dataset.id); break;
    case 'delpic': if (confirm('Supprimer ce dessin ?')) dbDel(GAL.find(x => String(x.id) === b.dataset.id).id).then(() => { S.drawings = Math.max(0, S.drawings - 1); save(); renderGallery(); }); break;
    case 'set': { const k = b.dataset.k, v = b.dataset.v; S.settings[k] = v === 'true' ? true : v === 'false' ? false : isNaN(+v) ? v : +v; save(); const y = app.querySelector('.screen').scrollTop; renderParent(); app.querySelector('.screen').scrollTop = y; break; }
    case 'export': exportData(); break;
    case 'reset': if (confirm('Effacer tous les progrès ? (Les dessins restent.)') && confirm('Vraiment tout effacer ?')) { const keep = { player: S.player, settings: S.settings, drawings: S.drawings }; S = Object.assign(DEFAULTS(), keep); save(); renderParent(); } break;
  }
});
function setTool(t) {
  D.tool = t; $$('[data-a=tool]').forEach(x => x.classList.toggle('on', x.dataset.t === t));
  $('#stamps').hidden = t !== 'stamp';
  setTimeout(fitPaper, 0);
}
// clavier : réponses écrites
app.addEventListener('submit', e => { e.preventDefault(); if (G && !G.answered) { const ti = $('#ti'); submit(ti ? ti.value : ''); } });
app.addEventListener('pointerdown', e => {
  const k = e.target.closest('[data-k]'); if (!k) return;
  e.preventDefault();
  const ti = $('#ti'); if (!ti) return;
  const s = ti.selectionStart ?? ti.value.length, en = ti.selectionEnd ?? ti.value.length;
  ti.value = ti.value.slice(0, s) + k.dataset.k + ti.value.slice(en);
  ti.focus(); ti.setSelectionRange(s + 1, s + 1);
});
// clavier physique (iPad) : 1-4 pour répondre, Entrée pour continuer
addEventListener('keydown', e => {
  if (!G || e.target.tagName === 'INPUT') return;
  if (!G.answered && G.q && G.q.choices && /^[1-4]$/.test(e.key)) { const i = +e.key - 1; if (G.q.choices[i]) { G.chosen = String(i); submit(G.q.choices[i].value); } }
  else if (G.answered && e.key === 'Enter') { const n = $('[data-a=next]'); if (n) n.click(); }
});
if ('speechSynthesis' in window) { try { speechSynthesis.getVoices(); speechSynthesis.onvoiceschanged = () => {}; } catch (e) { /* rien */ } }

// test hooks (utilisés seulement par les tests automatiques)
window.__DP = { GEN, get G() { return G; }, setG(v) { G = v; }, misspellings, makeIdea, gradeType, MODES };

renderHome();
})();
