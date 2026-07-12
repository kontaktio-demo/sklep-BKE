// One-shot generator for phase-1 placeholder imagery (public/placeholder/*.svg).
// Deterministic: same input → same files. Real photography replaces these in phase 2.
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

const DEFS = (id) => `
  <defs>
    <radialGradient id="bg-${id}" cx="50%" cy="42%" r="75%">
      <stop offset="0%" stop-color="#232323"/>
      <stop offset="60%" stop-color="#181818"/>
      <stop offset="100%" stop-color="#0e0e0e"/>
    </radialGradient>
    <radialGradient id="floor-${id}" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#000000" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
    </radialGradient>
    <filter id="grain-${id}">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch"/>
      <feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.03 0"/>
    </filter>
    <linearGradient id="sheen-${id}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.28"/>
      <stop offset="55%" stop-color="#ffffff" stop-opacity="0.02"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0.25"/>
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
    <ellipse rx="${rx}" ry="${ry}" fill="none" stroke="${dark}" stroke-width="${sw + 14}"/>
    <ellipse rx="${rx}" ry="${ry}" fill="none" stroke="${hex}" stroke-width="${sw}"/>
    <ellipse rx="${rx}" ry="${ry}" fill="none" stroke="${light}" stroke-width="${Math.round(sw * 0.3)}"
      stroke-dasharray="${Math.round(rx * 1.5)} ${Math.round(rx * 4)}" stroke-dashoffset="${Math.round(rx * 0.4)}" opacity="0.5"/>
    <ellipse rx="${rx}" ry="${ry}" fill="none" stroke="${dark}" stroke-width="3"
      stroke-dasharray="10 26" opacity="0.85" transform="scale(${(rx - sw * 0.32) / rx} ${(ry - sw * 0.32) / ry})"/>
    <ellipse rx="${rx}" ry="${ry}" fill="none" stroke="${dark}" stroke-width="3"
      stroke-dasharray="10 26" opacity="0.85" transform="scale(${(rx + sw * 0.32) / rx} ${(ry + sw * 0.32) / ry})"/>
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

function productSvg(slug, hex, chain, variant) {
  const id = `${slug}-${variant}`;
  const rnd = mulberry32(hashCode(id));
  const zoomed = variant === 2;
  const body = chain ? chainCollar(hex, rnd, zoomed) : nylonCollar(hex, rnd, zoomed);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1500" viewBox="0 0 1200 1500">
  ${DEFS(id)}
  <rect width="1200" height="1500" fill="url(#bg-${id})"/>
  <ellipse cx="600" cy="1150" rx="460" ry="110" fill="url(#floor-${id})"/>
  ${body}
  <rect width="1200" height="1500" fill="url(#sheen-${id})" opacity="0.5"/>
  <rect width="1200" height="1500" filter="url(#grain-${id})"/>
</svg>`;
}

function heroSvg() {
  const rnd = mulberry32(hashCode("hero-collars"));
  const ring = nylonCollar("#4A5D43", rnd, false);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="2400" height="1200" viewBox="0 0 2400 1200">
  <defs>
    <radialGradient id="hero-bg" cx="72%" cy="40%" r="85%">
      <stop offset="0%" stop-color="#2a2a2a"/>
      <stop offset="55%" stop-color="#171717"/>
      <stop offset="100%" stop-color="#0a0a0a"/>
    </radialGradient>
    <linearGradient id="hero-streak" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#e50914" stop-opacity="0"/>
      <stop offset="50%" stop-color="#e50914" stop-opacity="0.22"/>
      <stop offset="100%" stop-color="#e50914" stop-opacity="0"/>
    </linearGradient>
    <filter id="hero-blur"><feGaussianBlur stdDeviation="26"/></filter>
    <filter id="hero-grain">
      <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" stitchTiles="stitch"/>
      <feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.035 0"/>
    </filter>
  </defs>
  <rect width="2400" height="1200" fill="url(#hero-bg)"/>
  <rect x="900" y="-200" width="1800" height="900" fill="url(#hero-streak)" transform="rotate(18 1800 250)" filter="url(#hero-blur)"/>
  <g transform="translate(1130 -120) scale(1.55)">
    <ellipse cx="600" cy="720" rx="430" ry="310" fill="none" stroke="#e50914" stroke-width="4" opacity="0.5" filter="url(#hero-blur)"/>
    ${ring}
  </g>
  <ellipse cx="1720" cy="1080" rx="700" ry="140" fill="#000000" opacity="0.5" filter="url(#hero-blur)"/>
  <rect width="2400" height="1200" filter="url(#hero-grain)"/>
</svg>`;
}

let written = 0;
for (const p of PRODUCTS) {
  for (const variant of [1, 2]) {
    writeFileSync(join(OUT, `${p.slug}-${variant}.svg`), productSvg(p.slug, p.hex, p.chain, variant));
    written++;
  }
}
writeFileSync(join(OUT, "hero-collars.svg"), heroSvg());
written++;
console.log(`wrote ${written} files to ${OUT}`);
