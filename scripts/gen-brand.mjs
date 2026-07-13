// Rozbija logo.png na assety marki: sygnet (głowa psa), wordmark (PAKT),
// pełny lockup, favicon i obrazek OG. Uruchamiane ręcznie po podmianie logo:
//   node scripts/gen-brand.mjs
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(ROOT, "brand", "logo.png"); // źródłowa grafika marki
const BRAND_DIR = join(ROOT, "public", "brand");
const APP_DIR = join(ROOT, "app");
mkdirSync(BRAND_DIR, { recursive: true });

const BG = { r: 0x14, g: 0x14, b: 0x14 }; // --color-nf-bg

const src = sharp(SRC).ensureAlpha();
const { width, height } = await src.metadata();
const { data } = await src.raw().toBuffer({ resolveWithObject: true });

// Tło logo jest ciemne (i miejscami nieprzezroczyste) - wycinamy je kluczowaniem
// koloru: piksele bliskie próbce z narożnika stają się w pełni przezroczyste.
const corner = { r: data[0], g: data[1], b: data[2] };
const TOL = 45;

const keyed = Buffer.from(data);
const isContent = (i) => keyed[i + 3] > 24;

// Flood fill od krawędzi: usuwamy TYLKO tło stykające się z brzegiem obrazu.
// Proste progowanie po kolorze wycinało też ciemne cieniowanie wewnątrz logo.
const nearBg = (i) =>
  Math.abs(data[i] - corner.r) + Math.abs(data[i + 1] - corner.g) + Math.abs(data[i + 2] - corner.b) <=
  TOL;

const visited = new Uint8Array(width * height);
const stack = [];
for (let x = 0; x < width; x++) {
  stack.push([x, 0], [x, height - 1]);
}
for (let y = 0; y < height; y++) {
  stack.push([0, y], [width - 1, y]);
}

while (stack.length > 0) {
  const [x, y] = stack.pop();
  if (x < 0 || y < 0 || x >= width || y >= height) continue;
  const p = y * width + x;
  if (visited[p]) continue;
  visited[p] = 1;
  const i = p * 4;
  if (!nearBg(i)) continue;
  keyed[i + 3] = 0;
  stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
}

// wiersze zawierające treść -> pozwalają znaleźć przerwę między głową a napisem
const rowHasContent = [];
for (let y = 0; y < height; y++) {
  let found = false;
  for (let x = 0; x < width; x++) {
    if (isContent((y * width + x) * 4)) {
      found = true;
      break;
    }
  }
  rowHasContent.push(found);
}

const firstRow = rowHasContent.indexOf(true);
const lastRow = rowHasContent.lastIndexOf(true);

// największa pusta przerwa w dolnej połowie = odstęp między sygnetem a wordmarkiem
let gapStart = -1;
let gapEnd = -1;
let bestLen = 0;
let runStart = -1;
for (let y = Math.floor(height * 0.5); y <= lastRow; y++) {
  if (!rowHasContent[y]) {
    if (runStart === -1) runStart = y;
  } else if (runStart !== -1) {
    const len = y - runStart;
    if (len > bestLen) {
      bestLen = len;
      gapStart = runStart;
      gapEnd = y;
    }
    runStart = -1;
  }
}

if (gapStart === -1) throw new Error("Nie znaleziono przerwy między sygnetem a wordmarkiem");

// trim() z libvips wywraca się na raw+alfa, więc bounding box liczymy z pikseli
function bbox(topRow, bottomRow) {
  let left = width;
  let right = -1;
  let top = -1;
  let bottom = -1;
  for (let y = topRow; y <= bottomRow; y++) {
    for (let x = 0; x < width; x++) {
      if (!isContent((y * width + x) * 4)) continue;
      if (x < left) left = x;
      if (x > right) right = x;
      if (top === -1) top = y;
      bottom = y;
    }
  }
  if (right === -1) throw new Error(`Pusty wycinek: ${topRow}-${bottomRow}`);
  const pad = 2;
  const l = Math.max(0, left - pad);
  const t = Math.max(0, top - pad);
  return {
    left: l,
    top: t,
    width: Math.min(width - l, right - left + 1 + pad * 2),
    height: Math.min(height - t, bottom - top + 1 + pad * 2),
  };
}

const keyedPng = () => sharp(keyed, { raw: { width, height, channels: 4 } }).png();

// Wariant na ciemne tło: sylwetka psa jest niemal czarna (#010101) i ginie na czerni
// stopki. Podnosimy tylko najciemniejsze piksele do grafitu - czerwień zostaje nietknięta.
const LIFT = { r: 0x2b, g: 0x2b, b: 0x2b };
const lifted = Buffer.from(keyed);
for (let i = 0; i < lifted.length; i += 4) {
  if (lifted[i + 3] <= 24) continue;
  const luma = 0.2126 * lifted[i] + 0.7152 * lifted[i + 1] + 0.0722 * lifted[i + 2];
  if (luma > 45) continue;
  lifted[i] = LIFT.r;
  lifted[i + 1] = LIFT.g;
  lifted[i + 2] = LIFT.b;
}
const liftedPng = () => sharp(lifted, { raw: { width, height, channels: 4 } }).png();

// sama głowa (bez popiersia): kadr prawie kwadratowy, czyta się w pasku nawigacyjnym,
// gdzie pełna pionowa sylwetka robi się wąskim, nieczytelnym paskiem
// 0.68: pełna głowa z pyskiem i żuchwą, cięcie wypada na szyi. Mniej (0.6) ucinało pysk.
const headBottom = firstRow + Math.round((gapStart - firstRow) * 0.68);

await keyedPng().extract(bbox(firstRow, lastRow)).toFile(join(BRAND_DIR, "pakt-logo.png"));
await keyedPng().extract(bbox(firstRow, gapStart - 1)).toFile(join(BRAND_DIR, "pakt-mark.png"));
await keyedPng().extract(bbox(firstRow, headBottom)).toFile(join(BRAND_DIR, "pakt-head.png"));
await liftedPng().extract(bbox(firstRow, headBottom)).toFile(join(BRAND_DIR, "pakt-head-dark.png"));
await keyedPng().extract(bbox(gapEnd, lastRow)).toFile(join(BRAND_DIR, "pakt-wordmark.png"));
await liftedPng()
  .extract(bbox(firstRow, gapStart - 1))
  .toFile(join(BRAND_DIR, "pakt-mark-dark.png"));
await liftedPng().extract(bbox(firstRow, lastRow)).toFile(join(BRAND_DIR, "pakt-logo-dark.png"));

// Ikony: głowa psa na kwadracie w kolorze tła strony.
// Margines ~14% (w małych rozmiarach pełny kadr klei się do krawędzi).
async function squareIcon(size, out) {
  const inner = Math.round(size * 0.72);
  const head = await sharp(join(BRAND_DIR, "pakt-head-dark.png"))
    .resize(inner, inner, { fit: "contain", background: { ...BG, alpha: 0 } })
    .toBuffer();
  const buf = await sharp({
    create: { width: size, height: size, channels: 4, background: { ...BG, alpha: 1 } },
  })
    .composite([{ input: head, gravity: "center" }])
    .png()
    .toBuffer();
  if (out) await sharp(buf).toFile(out);
  return buf;
}

await squareIcon(512, join(APP_DIR, "icon.png"));
await squareIcon(180, join(APP_DIR, "apple-icon.png"));
await squareIcon(192, join(BRAND_DIR, "icon-192.png"));
await squareIcon(512, join(BRAND_DIR, "icon-512.png"));

// favicon.ico: 16/32/48 px w jednym pliku (ICO z osadzonymi PNG-ami).
// sharp nie zapisuje ICO, więc składamy kontener ręcznie.
const icoSizes = [16, 32, 48];
const icoImages = await Promise.all(icoSizes.map((s) => squareIcon(s)));
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0); // reserved
header.writeUInt16LE(1, 2); // typ 1 = ikona
header.writeUInt16LE(icoSizes.length, 4);

let offset = 6 + icoSizes.length * 16;
const entries = [];
icoImages.forEach((img, i) => {
  const e = Buffer.alloc(16);
  e.writeUInt8(icoSizes[i] === 256 ? 0 : icoSizes[i], 0); // szerokość
  e.writeUInt8(icoSizes[i] === 256 ? 0 : icoSizes[i], 1); // wysokość
  e.writeUInt8(0, 2); // paleta
  e.writeUInt8(0, 3); // reserved
  e.writeUInt16LE(1, 4); // płaszczyzny
  e.writeUInt16LE(32, 6); // bity na piksel
  e.writeUInt32LE(img.length, 8);
  e.writeUInt32LE(offset, 12);
  offset += img.length;
  entries.push(e);
});
writeFileSync(join(APP_DIR, "favicon.ico"), Buffer.concat([header, ...entries, ...icoImages]));

// obrazek Open Graph 1200x630
await sharp({
  create: { width: 1200, height: 630, channels: 4, background: { ...BG, alpha: 1 } },
})
  .composite([
    {
      input: await sharp(join(BRAND_DIR, "pakt-logo-dark.png"))
        .resize({ height: 460, fit: "contain", background: { ...BG, alpha: 0 } })
        .toBuffer(),
      gravity: "center",
    },
  ])
  .png()
  .toFile(join(BRAND_DIR, "og.png"));

const info = async (name, file) => {
  const m = await sharp(file).metadata();
  console.log(`${name}: ${m.width}x${m.height}`);
};
await info("pakt-logo", join(BRAND_DIR, "pakt-logo.png"));
await info("pakt-mark", join(BRAND_DIR, "pakt-mark.png"));
await info("pakt-wordmark", join(BRAND_DIR, "pakt-wordmark.png"));
await info("icon", join(APP_DIR, "icon.png"));
await info("og", join(BRAND_DIR, "og.png"));
