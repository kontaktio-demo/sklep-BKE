// One-shot generator for phase-1 placeholder imagery (public/placeholder/*.svg).
// Deterministic: same input -> same files. Real photography replaces these in phase 2.
import { mkdirSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "placeholder");
mkdirSync(OUT, { recursive: true });

const PRODUCTS = [
  { slug: "ranger-duty-collar", hex: "#7A5C3E", chain: false },
  { slug: "fjord-everyday-collar", hex: "#22304A", chain: false },
  { slug: "sentinel-id-collar", hex: "#1F1F1F", chain: false },
  { slug: "bolt-e-fit-collar", hex: "#4A5D43", chain: false },
  { slug: "vanguard-k9-collar", hex: "#7A5C3E", chain: false },
  { slug: "nightwatch-reflective-collar", hex: "#C75000", chain: false },
  { slug: "grizzly-alpine-collar", hex: "#4A5D43", chain: false },
  { slug: "ridgeline-field-collar", hex: "#4A5D43", chain: false },
  { slug: "bastion-heavy-collar", hex: "#1F1F1F", chain: false },
  { slug: "halo-comfort-collar", hex: "#C7B299", chain: false },
  { slug: "havoc-chain-martingale", hex: "#9EA3A8", chain: true },
  { slug: "onyx-slip-chain", hex: "#4B4F55", chain: true },
  { slug: "pulse-e-collar-strap", hex: "#B3001B", chain: false },
  { slug: "aurora-padded-collar", hex: "#C7B299", chain: false },
  { slug: "timber-trail-collar", hex: "#7A5C3E", chain: false },
  { slug: "drift-coastal-collar", hex: "#22304A", chain: false },
  { slug: "cipher-tactical-collar", hex: "#1F1F1F", chain: false },
  { slug: "ember-reflective-collar", hex: "#B3001B", chain: false },
  { slug: "torque-chain-collar", hex: "#9EA3A8", chain: true },
  { slug: "willow-heritage-collar", hex: "#C7B299", chain: false },
  { slug: "strike-e-fit-pro-collar", hex: "#1F1F1F", chain: false },
  { slug: "kodiak-duty-collar", hex: "#4A5D43", chain: false },
  { slug: "meadow-soft-collar", hex: "#C7B299", chain: false },
  { slug: "breeze-mesh-collar", hex: "#8E9193", chain: false },
  { slug: "surge-e-fit-collar", hex: "#1F1F1F", chain: false },
  { slug: "raptor-e-fit-field-collar", hex: "#4A5D43", chain: false },
  // linia PAKT-K9 (sprzet sluzbowy, niedostepny w zwyklym sklepie)
  { slug: "k9-patrol-duty-collar", hex: "#1F1F1F", chain: false },
  { slug: "k9-grip-handle-collar", hex: "#1F1F1F", chain: false },
  { slug: "k9-breach-handle-collar", hex: "#4B4F55", chain: false },
  { slug: "k9-mount-e-collar", hex: "#3E4634", chain: false },
  { slug: "k9-relay-e-collar", hex: "#4A5D43", chain: false },
  { slug: "k9-drill-training-collar", hex: "#3E4634", chain: false },
  { slug: "k9-check-training-chain", hex: "#4B4F55", chain: true },
  { slug: "k9-scent-detection-collar", hex: "#7A5C3E", chain: false },
  { slug: "k9-track-detection-collar", hex: "#3E4634", chain: false },
  { slug: "k9-sentry-patrol-collar", hex: "#1F1F1F", chain: false },
  { slug: "k9-anchor-patrol-collar", hex: "#7A5C3E", chain: false },
  { slug: "k9-cadet-training-collar", hex: "#3E4634", chain: false },
];

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashCode(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function shade(hex, f) {
  const n = parseInt(hex.slice(1), 16);
  const ch = (v) =>
    Math.max(0, Math.min(255, Math.round(f >= 0 ? v + (255 - v) * f : v * (1 + f))));
  const r = ch((n >> 16) & 255);
  const g = ch((n >> 8) & 255);
  const b = ch(n & 255);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

// Dwa swiaty, dwa studia. Sklep cywilny stoi na jasnym tle (produkt na bieli, jak
// w kazdym sklepie), sekcja K9 na graficie. O tym, ktore studio dostaje produkt,
// decyduje jego linia - nie osobna lista, tylko prefiks slug "k9-".
const STUDIO = {
  light: {
    bgTop: "#ffffff",
    bgBottom: "#ececea",
    floor: "#16161a",
    floorOpacity: 0.16,
    // ziarno na bieli musi byc CIEMNE, inaczej jest niewidoczne
    grain: "0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.016 0",
    sheenTop: "#ffffff",
    sheenTopOpacity: 0.0,
    sheenBottom: "#16161a",
    sheenBottomOpacity: 0.05,
  },
  // Studio K9 stoi na powierzchniach z K9_IDENTITY (§1): karta #161616 schodzaca do tla
  // strony #0E0E0E. Stary grafit (#24282c) na czerni sekcji czytal sie jak szare pudlo
  // doklejone do kadru.
  dark: {
    bgTop: "#191919",
    bgBottom: "#0e0e0e",
    floor: "#000000",
    floorOpacity: 0.45,
    grain: "0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.012 0",
    sheenTop: "#ffffff",
    sheenTopOpacity: 0.04,
    sheenBottom: "#000000",
    sheenBottomOpacity: 0.1,
  },
};

const DEFS = (id, s) => `
  <defs>
    <linearGradient id="bg-${id}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${s.bgTop}"/>
      <stop offset="100%" stop-color="${s.bgBottom}"/>
    </linearGradient>
    <radialGradient id="floor-${id}" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${s.floor}" stop-opacity="${s.floorOpacity}"/>
      <stop offset="100%" stop-color="${s.floor}" stop-opacity="0"/>
    </radialGradient>
    <filter id="grain-${id}">
      <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="1" stitchTiles="stitch"/>
      <feColorMatrix type="matrix" values="${s.grain}"/>
    </filter>
    <linearGradient id="sheen-${id}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${s.sheenTop}" stop-opacity="${s.sheenTopOpacity}"/>
      <stop offset="60%" stop-color="${s.sheenTop}" stop-opacity="0"/>
      <stop offset="100%" stop-color="${s.sheenBottom}" stop-opacity="${s.sheenBottomOpacity}"/>
    </linearGradient>
  </defs>`;

function nylonCollar(hex, rnd, zoomed) {
  const dark = shade(hex, -0.45);
  const light = shade(hex, 0.22);
  const rot = Math.round((rnd() - 0.5) * 26);
  const rx = 360 + Math.round(rnd() * 40);
  const ry = 260 + Math.round(rnd() * 50);
  const sw = 96 + Math.round(rnd() * 18);
  const buckleAngle = -35 + Math.round(rnd() * 24);
  const scale = zoomed ? 1.45 : 1;
  const cy = zoomed ? 640 : 720;
  return `
  <g transform="translate(600 ${cy}) scale(${scale}) rotate(${rot})">
    <ellipse rx="${rx}" ry="${ry}" fill="none" stroke="${dark}" stroke-width="${sw + 10}"/>
    <ellipse rx="${rx}" ry="${ry}" fill="none" stroke="${hex}" stroke-width="${sw}"/>
    <ellipse rx="${rx}" ry="${ry}" fill="none" stroke="${light}" stroke-width="${Math.round(sw * 0.18)}"
      stroke-dasharray="${Math.round(rx * 1.2)} ${Math.round(rx * 5)}" stroke-dashoffset="${Math.round(rx * 0.4)}" opacity="0.18"/>
    <ellipse rx="${rx}" ry="${ry}" fill="none" stroke="${dark}" stroke-width="2"
      stroke-dasharray="8 22" opacity="0.5" transform="scale(${(rx - sw * 0.33) / rx} ${(ry - sw * 0.33) / ry})"/>
    <ellipse rx="${rx}" ry="${ry}" fill="none" stroke="${dark}" stroke-width="2"
      stroke-dasharray="8 22" opacity="0.5" transform="scale(${(rx + sw * 0.33) / rx} ${(ry + sw * 0.33) / ry})"/>
    <g transform="rotate(${buckleAngle}) translate(0 ${-ry})">
      <rect x="-95" y="-${sw / 2 + 16}" width="190" height="${sw + 32}" rx="18" fill="#2b2d30" stroke="#54575c" stroke-width="5"/>
      <rect x="-58" y="-${sw / 2 - 4}" width="116" height="${sw - 24}" rx="10" fill="#1a1b1d" stroke="#45484d" stroke-width="4"/>
      <circle cx="72" cy="0" r="9" fill="#54575c"/>
      <circle cx="-72" cy="0" r="9" fill="#54575c"/>
    </g>
    <g transform="rotate(${buckleAngle + 180}) translate(0 ${-ry})">
      <circle r="${sw * 0.62}" fill="none" stroke="#8f9399" stroke-width="16"/>
      <circle r="${sw * 0.62}" fill="none" stroke="#c6cad0" stroke-width="6" stroke-dasharray="40 90"/>
      <rect x="-${sw * 0.55}" y="-20" width="${sw * 1.1}" height="40" rx="12" fill="${dark}" stroke="${shade(hex, -0.6)}" stroke-width="4"/>
    </g>
  </g>`;
}

function chainCollar(hex, rnd, zoomed) {
  const light = shade(hex, 0.35);
  const dark = shade(hex, -0.4);
  const rot = Math.round((rnd() - 0.5) * 20);
  const rx = 370 + Math.round(rnd() * 30);
  const ry = 280 + Math.round(rnd() * 40);
  const links = 26;
  const scale = zoomed ? 1.5 : 1;
  const cy = zoomed ? 640 : 720;
  let pieces = "";
  for (let i = 0; i < links; i++) {
    const t = (i / links) * Math.PI * 2;
    const x = Math.cos(t) * rx;
    const y = Math.sin(t) * ry;
    const a = (Math.atan2(Math.sin(t) * rx, Math.cos(t) * ry) * 180) / Math.PI;
    pieces += `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="52" ry="34"
      transform="rotate(${(90 - a).toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)})"
      fill="none" stroke="${i % 2 ? hex : light}" stroke-width="17" opacity="0.97"/>`;
  }
  return `
  <g transform="translate(600 ${cy}) scale(${scale}) rotate(${rot})">
    <ellipse rx="${rx}" ry="${ry}" fill="none" stroke="${dark}" stroke-width="8" opacity="0.6"/>
    ${pieces}
    <g transform="translate(0 ${-ry})">
      <circle r="72" fill="none" stroke="${light}" stroke-width="20"/>
      <circle r="40" fill="none" stroke="${hex}" stroke-width="16"/>
    </g>
  </g>`;
}

// gallery shot 3 - hardware macro (buckle / chain link close-up)
function hardwareShot(hex, chain, rnd) {
  const dark = shade(hex, -0.45);
  const light = shade(hex, 0.22);
  const tilt = Math.round((rnd() - 0.5) * 14);

  if (chain) {
    return `
  <g transform="translate(600 760) rotate(${tilt})">
    <ellipse cx="-190" cy="0" rx="150" ry="96" fill="none" stroke="${dark}" stroke-width="46"/>
    <ellipse cx="-190" cy="0" rx="150" ry="96" fill="none" stroke="${hex}" stroke-width="34"/>
    <ellipse cx="10" cy="0" rx="150" ry="96" fill="none" stroke="${shade(hex, -0.5)}" stroke-width="46" transform="rotate(90 10 0)"/>
    <ellipse cx="10" cy="0" rx="150" ry="96" fill="none" stroke="${light}" stroke-width="34" transform="rotate(90 10 0)"/>
    <ellipse cx="210" cy="0" rx="150" ry="96" fill="none" stroke="${dark}" stroke-width="46"/>
    <ellipse cx="210" cy="0" rx="150" ry="96" fill="none" stroke="${hex}" stroke-width="34"/>
  </g>`;
  }

  return `
  <g transform="translate(600 760) rotate(${tilt})">
    <rect x="-420" y="-105" width="420" height="210" rx="16" fill="${dark}"/>
    <rect x="-420" y="-92" width="420" height="184" rx="10" fill="${hex}"/>
    <rect x="-420" y="-92" width="420" height="26" fill="${light}" opacity="0.35"/>
    <g stroke="${shade(hex, -0.62)}" stroke-width="5" stroke-dasharray="16 20" opacity="0.9">
      <path d="M-420 -60 H0"/>
      <path d="M-420 60 H0"/>
    </g>
    <rect x="-30" y="-150" width="330" height="300" rx="34" fill="#2b2d30" stroke="#5b5f66" stroke-width="8"/>
    <rect x="30" y="-92" width="210" height="184" rx="20" fill="#141517" stroke="#4a4d53" stroke-width="6"/>
    <circle cx="255" cy="-105" r="14" fill="#6c7076"/>
    <circle cx="255" cy="105" r="14" fill="#6c7076"/>
    <rect x="300" y="-92" width="140" height="184" rx="14" fill="${dark}"/>
    <rect x="300" y="-92" width="140" height="184" rx="14" fill="${hex}" opacity="0.85"/>
  </g>`;
}

// gallery shot 4 - taśma ułożona płasko (poprzednio zwoje wyglądały jak tarcza)
function flatLayShot(hex, chain, rnd) {
  const dark = shade(hex, -0.45);
  const light = shade(hex, 0.18);
  const rot = Math.round((rnd() - 0.5) * 8);
  const sw = chain ? 34 : 92;
  const y1 = -130;
  const y2 = 90;

  const strap = (y, w) => `
    <rect x="${-w / 2}" y="${y - sw / 2 - 6}" width="${w}" height="${sw + 12}" rx="${sw / 2}" fill="${dark}"/>
    <rect x="${-w / 2}" y="${y - sw / 2}" width="${w}" height="${sw}" rx="${sw / 2}" fill="${hex}"/>
    <rect x="${-w / 2 + 20}" y="${y - sw / 2 + 6}" width="${w - 40}" height="${Math.round(sw * 0.16)}" rx="6" fill="${light}" opacity="0.16"/>
    ${
      chain
        ? ""
        : `<g stroke="${shade(hex, -0.6)}" stroke-width="2" stroke-dasharray="8 20" opacity="0.5">
             <path d="M${-w / 2 + 16} ${y - sw * 0.3} H${w / 2 - 16}"/>
             <path d="M${-w / 2 + 16} ${y + sw * 0.3} H${w / 2 - 16}"/>
           </g>`
    }`;

  return `
  <g transform="translate(600 760) rotate(${rot})">
    ${strap(y1, 720)}
    ${strap(y2, 620)}
    <g transform="translate(-300 ${y1})">
      <circle r="${sw * 0.55}" fill="none" stroke="#8f9399" stroke-width="12"/>
    </g>
    <g transform="translate(280 ${y2})">
      <rect x="-70" y="-${sw / 2 + 8}" width="140" height="${sw + 16}" rx="14" fill="#2b2d30" stroke="#54575c" stroke-width="4"/>
      <rect x="-42" y="-${sw / 2 + 2}" width="84" height="${sw + 4}" rx="8" fill="#1a1b1d" stroke="#45484d" stroke-width="3"/>
    </g>
  </g>`;
}

function productSvg(slug, hex, chain, variant) {
  const id = `${slug}-${variant}`;
  const rnd = mulberry32(hashCode(id));
  const studio = slug.startsWith("k9-") ? STUDIO.dark : STUDIO.light;
  const body =
    variant === 3
      ? hardwareShot(hex, chain, rnd)
      : variant === 4
        ? flatLayShot(hex, chain, rnd)
        : chain
          ? chainCollar(hex, rnd, variant === 2)
          : nylonCollar(hex, rnd, variant === 2);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1500" viewBox="0 0 1200 1500">
  ${DEFS(id, studio)}
  <rect width="1200" height="1500" fill="url(#bg-${id})"/>
  <ellipse cx="600" cy="1150" rx="460" ry="110" fill="url(#floor-${id})"/>
  ${body}
  <rect width="1200" height="1500" fill="url(#sheen-${id})" opacity="0.5"/>
  <rect width="1200" height="1500" filter="url(#grain-${id})"/>
</svg>`;
}

// Baner kolekcji: sklep cywilny stoi na jasnym, wiec i baner jest jasny. Czerwona
// poswiata i rozmyta smuga poszly precz - to byl efekt sam dla siebie, i to w kolorze,
// ktory nalezal do serwisu filmowego, a nie do marki.
function heroSvg() {
  const rnd = mulberry32(hashCode("hero-collars"));
  const ring = nylonCollar("#4A5D43", rnd, false);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="2400" height="1200" viewBox="0 0 2400 1200">
  <defs>
    <linearGradient id="hero-bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#e7e7e4"/>
    </linearGradient>
    <filter id="hero-blur"><feGaussianBlur stdDeviation="26"/></filter>
    <filter id="hero-grain">
      <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" stitchTiles="stitch"/>
      <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.02 0"/>
    </filter>
  </defs>
  <rect width="2400" height="1200" fill="url(#hero-bg)"/>
  <g transform="translate(1130 -120) scale(1.55)">
    ${ring}
  </g>
  <ellipse cx="1720" cy="1090" rx="640" ry="120" fill="#16161a" opacity="0.14" filter="url(#hero-blur)"/>
  <rect width="2400" height="1200" filter="url(#hero-grain)"/>
</svg>`;
}

let written = 0;
for (const p of PRODUCTS) {
  for (const variant of [1, 2, 3, 4]) {
    writeFileSync(join(OUT, `${p.slug}-${variant}.svg`), productSvg(p.slug, p.hex, p.chain, variant));
    written++;
  }
}
writeFileSync(join(OUT, "hero-collars.svg"), heroSvg());
written++;
console.log(`wrote ${written} files to ${OUT}`);
