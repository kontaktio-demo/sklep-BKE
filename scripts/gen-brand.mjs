// Rozbija zrodlowe loga na assety marki. Dwa sklepy = dwie marki = dwa pliki zrodlowe:
//   brand/dogstore-src.jpg      -> Dog Store      (okragly emblemat, sklep cywilny)
//   brand/dogstore-pro-src.jpg  -> Dog Store Pro  (kanciasta tarcza, sklep sluzbowy)
// Uruchamiane recznie po podmianie logo:
//   node scripts/gen-brand.mjs
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const BRAND_DIR = join(ROOT, "public", "brand");
const APP_DIR = join(ROOT, "app");
mkdirSync(BRAND_DIR, { recursive: true });

// Tlo ikon i obrazka OG. Oba loga sa RYSOWANE na czerni, wiec kafel ikony tez jest czarny -
// na papierze sklepu emblemat i tak stoi na wlasnym czerwonym polu i nie potrzebuje kafla.
const ICON_BG = { r: 0x0e, g: 0x0e, b: 0x0e }; // --color-pro-bg
// Tusz sklepu cywilnego (--color-nf-white). Napis "DOG" jest w zrodle BIALY, wiec na papierze
// musi zejsc do tuszu - inaczej znika.
const INK = { r: 0x16, g: 0x16, b: 0x1a };
const WHITE = { r: 0xff, g: 0xff, b: 0xff };

// ---- klasyfikacja pikseli --------------------------------------------------
// Zrodlo ma trzy jezyki koloru i kazdy znaczy co innego:
//   czerwien  - emblemat, "STORE", plakietka "PRO"          -> zostaje czerwienia zawsze
//   biel      - napis "DOG"                                  -> tusz na papierze, biel na graficie
//   czern     - sylwetka w emblemacie ORAZ ciecia w literach -> w sygnecie zostaje,
//               w napisie staje sie przezroczysta (inaczej na papierze ciecia znikaja w tuszu)
const luma = (r, g, b) => 0.2126 * r + 0.7152 * g + 0.0722 * b;
const isRed = (r, g, b) => r > 100 && r > g * 2 && r > b * 2;
const isWhite = (r, g, b) => !isRed(r, g, b) && luma(r, g, b) > 140;
// luzniejszy prog na wygaszone brzegi czerwieni - do wyznaczania KSZTALTU emblematu,
// nie do malowania
const isRedish = (r, g, b) => r > 60 && r > g * 1.6 && r > b * 1.6;

async function load(file) {
  const img = sharp(file).ensureAlpha();
  const { width, height } = await img.metadata();
  const { data } = await img.raw().toBuffer({ resolveWithObject: true });
  return { width, height, data };
}

/**
 * Wycina czarne tlo. Flood fill OD KRAWEDZI, nie progowanie po kolorze: czern wewnatrz
 * logo (sylwetka psa i przewodnika w emblemacie, ciecia w literach) ma zostac. Progowanie
 * zjadloby ja razem z tlem.
 *
 * Zrodla sa JPEG-ami, wiec wokol glifow siedzi ciemny pierscien z kompresji. Sam flood fill
 * zostawialby go jako brudna obwodke, dlatego piksele stykajace sie z tlem dostaja alfe
 * proporcjonalna do jasnosci - artefakt wygasza sie miekko, a pelny kolor zostaje kryjacy.
 */
function keyOutBackground({ width, height, data }) {
  const corner = { r: data[0], g: data[1], b: data[2] };
  const TOL = 60;
  const nearBg = (i) =>
    Math.abs(data[i] - corner.r) +
      Math.abs(data[i + 1] - corner.g) +
      Math.abs(data[i + 2] - corner.b) <=
    TOL;

  const alpha = new Uint8Array(width * height).fill(255);
  const visited = new Uint8Array(width * height);
  const stack = [];
  for (let x = 0; x < width; x++) stack.push([x, 0], [x, height - 1]);
  for (let y = 0; y < height; y++) stack.push([0, y], [width - 1, y]);

  while (stack.length > 0) {
    const [x, y] = stack.pop();
    if (x < 0 || y < 0 || x >= width || y >= height) continue;
    const p = y * width + x;
    if (visited[p]) continue;
    visited[p] = 1;
    if (!nearBg(p * 4)) continue;
    alpha[p] = 0;
    stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
  }

  // wygaszenie pierscienia JPEG na styku z tlem
  const FEATHER = 46; // powyzej tej jasnosci piksel jest pelnym kolorem, nie artefaktem
  const edge = [];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const p = y * width + x;
      if (!alpha[p]) continue;
      const touchesBg =
        (x > 0 && !alpha[p - 1]) ||
        (x < width - 1 && !alpha[p + 1]) ||
        (y > 0 && !alpha[p - width]) ||
        (y < height - 1 && !alpha[p + width]);
      if (!touchesBg) continue;
      const i = p * 4;
      const l = luma(data[i], data[i + 1], data[i + 2]);
      if (l < FEATHER) edge.push([p, Math.round((l / FEATHER) * 255)]);
    }
  }
  for (const [p, a] of edge) alpha[p] = a;

  return alpha;
}

/**
 * WNETRZE EMBLEMATU - i dlaczego samo wyciecie tla nie wystarcza.
 *
 * W obu logach postac PRZEBIJA ramke: czapka przewodniczki wychodzi ponad czerwone pole.
 * Sylwetka jest czarna, tlo jest czarne, wiec w tym miejscu sie stykaja - a flood fill,
 * ktory wchodzi od krawedzi obrazu, przechodzi tym stykiem do srodka i zjada CALA sylwetke
 * razem z tlem. Na czerni nikt tego nie zauwazy (czarne na czarnym), ale na papierze sklepu
 * emblemat robi sie czerwonym kolem z BIALA dziura w ksztalcie psa.
 *
 * Dlatego ksztalt emblematu wyznaczamy z CZERWIENI, nie z topologii czerni:
 *   1. maska czerwieni,
 *   2. OTWARCIE morfologiczne (erozja o K, potem dylatacja o K). Erozja zjada cienkie
 *      ozdobniki - luk wokol dysku w logo cywilnym ma ~12 px - a dylatacja przywraca bryle
 *      do pierwotnego rozmiaru. Bez tego kroku luk sklejal sie z dyskiem w jedna plame,
 *      a szczelina miedzy nimi (czarne TLO) zalewala sie czernia razem z sylwetka.
 *   3. w kazdym wierszu wnetrzem jest wszystko miedzy skrajnie lewym a prawym pikselem
 *      otwartej maski. Oba emblematy sa w poziomie wypukle, wiec ten przedzial to
 *      dokladnie ich wnetrze.
 * Czern, ktora w nim lezy, to sylwetka - i ma zostac czarna.
 *
 * Liczymy przedzial z CALEJ otwartej maski, nie z jednej spojnej skladowej: postac stoi
 * w poprzek emblematu i rozcina czerwien na lewa i prawa polowe, wiec "najwieksza skladowa"
 * to tylko jedna z nich - a wtedy druga polowa sylwetki zostawala niewypelniona.
 */
function emblemInterior({ width, height, data }, K = 8) {
  const red = new Uint8Array(width * height);
  for (let p = 0; p < width * height; p++) {
    const i = p * 4;
    if (isRedish(data[i], data[i + 1], data[i + 2])) red[p] = 1;
  }

  // erozja i dylatacja kwadratem (2K+1), rozdzielone na poziom i pion
  const sweep = (src, all) => {
    const hor = new Uint8Array(width * height);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let hit = all ? 1 : 0;
        for (let d = -K; d <= K; d++) {
          const xx = x + d;
          const v = xx < 0 || xx >= width ? 0 : src[y * width + xx];
          if (all) {
            if (!v) {
              hit = 0;
              break;
            }
          } else if (v) {
            hit = 1;
            break;
          }
        }
        hor[y * width + x] = hit;
      }
    }
    const out = new Uint8Array(width * height);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let hit = all ? 1 : 0;
        for (let d = -K; d <= K; d++) {
          const yy = y + d;
          const v = yy < 0 || yy >= height ? 0 : hor[yy * width + x];
          if (all) {
            if (!v) {
              hit = 0;
              break;
            }
          } else if (v) {
            hit = 1;
            break;
          }
        }
        out[y * width + x] = hit;
      }
    }
    return out;
  };

  const opened = sweep(sweep(red, true), false); // erozja -> dylatacja

  const interior = new Uint8Array(width * height);
  for (let y = 0; y < height; y++) {
    let lo = -1;
    let hi = -1;
    for (let x = 0; x < width; x++) {
      if (!opened[y * width + x]) continue;
      if (lo === -1) lo = x;
      hi = x;
    }
    if (lo === -1) continue;
    for (let x = lo; x <= hi; x++) interior[y * width + x] = 1;
  }
  return interior;
}

/** Pasy tresci: ciagi wierszy, w ktorych cokolwiek zostalo po wycieciu tla. */
function rowBands(alpha, width, height) {
  const MIN = Math.max(3, Math.round(width * 0.002)); // ponizej tego to smiec z kompresji
  const bands = [];
  let start = -1;
  for (let y = 0; y < height; y++) {
    let n = 0;
    for (let x = 0; x < width; x++) if (alpha[y * width + x] > 24) n++;
    const has = n >= MIN;
    if (has && start === -1) start = y;
    if (!has && start !== -1) {
      bands.push([start, y - 1]);
      start = -1;
    }
  }
  if (start !== -1) bands.push([start, height - 1]);
  return bands;
}

/** Bounding box pikseli danej roli. trim() z libvips wywraca sie na raw+alfa, liczymy sami. */
function bbox(role, want, width, height) {
  let left = width;
  let right = -1;
  let top = -1;
  let bottom = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (role[y * width + x] !== want) continue;
      if (x < left) left = x;
      if (x > right) right = x;
      if (top === -1) top = y;
      bottom = y;
    }
  }
  if (right === -1) throw new Error(`Pusty wycinek dla roli ${want}`);
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

// ---- marki -----------------------------------------------------------------
// Pasy liczone sa z obrazu, nie wpisane na sztywno - po podmianie logo skrypt wypisze je
// w konsoli i wtedy weryfikuje sie indeksy ponizej.
const BRANDS = [
  {
    key: "ds", // Dog Store - sklep cywilny
    src: "dogstore-src.jpg",
    // pasy: 0 emblemat (kolo), 1 DOG, 2 STORE, 3 PRO, 4 haslo, 5 pasek ikon
    // Sklep cywilny bierze emblemat + DOG + STORE. Plakietka PRO, haslo i ikony zostaja
    // w zrodle: to znaki linii sluzbowej, a nie tej marki.
    markBands: [0],
    wordBands: [1, 2],
  },
  {
    key: "ds-pro", // Dog Store Pro - sklep sluzbowy
    src: "dogstore-pro-src.jpg",
    // pasy: 0 emblemat (tarcza) SKLEJONY z napisem DOG, 1 STORE, 2 PRO
    // Tarcza konczy sie ostrym klinem, ktory wchodzi w gorne krawedzie liter DOG - miedzy
    // nimi nie ma pustego wiersza, wiec pas 0 nalezy do OBU assetow. Rozdziela je kolor
    // (patrz split ponizej), a nie ciecie: ciecie albo urwaloby klin, albo scielo litery.
    markBands: [0],
    wordBands: [0, 1, 2],
  },
];

for (const brand of BRANDS) {
  const img = await load(join(ROOT, "brand", brand.src));
  const { width, height, data } = img;
  const alpha = keyOutBackground(img);
  const interior = emblemInterior(img);
  const bands = rowBands(alpha, width, height);

  console.log(`\n${brand.key} (${brand.src}) - ${width}x${height}, pasy tresci:`);
  bands.forEach(([a, b], i) => console.log(`  ${i}: y ${a}-${b} (${b - a + 1}px)`));

  // pierwszy wiersz z biela = gorna krawedz napisu "DOG". W obu zrodlach emblemat nie ma
  // ANI JEDNEGO bialego piksela, wiec ten wiersz jest twarda granica miedzy sygnetem
  // a napisem - takze tam, gdzie ksztalty na siebie nachodza.
  let firstWhiteRow = height;
  for (let y = 0; y < height && firstWhiteRow === height; y++) {
    for (let x = 0; x < width; x++) {
      const p = y * width + x;
      if (alpha[p] <= 24) continue;
      const i = p * 4;
      if (isWhite(data[i], data[i + 1], data[i + 2])) {
        firstWhiteRow = y;
        break;
      }
    }
  }

  // roli: 0 = tlo, 1 = sygnet, 2 = wordmark
  const role = new Uint8Array(width * height);
  bands.forEach(([top, bottom], i) => {
    const inMark = brand.markBands.includes(i);
    const inWord = brand.wordBands.includes(i);
    if (!inMark && !inWord) return; // pas swiadomie pominiety
    for (let y = top; y <= bottom; y++) {
      for (let x = 0; x < width; x++) {
        const p = y * width + x;
        const visible = alpha[p] > 24;
        // Sylwetka psa i przewodniczki ma po kluczowaniu alfe 0 - stykala sie z czarnym
        // tlem, wiec flood fill wszedl w nia od gory. Odzyskujemy ja z ksztaltu emblematu.
        const inEmblem = inMark && interior[p] === 1;
        if (!visible && !inEmblem) continue;
        if (!(inMark && inWord)) {
          role[p] = inMark ? 1 : 2;
          continue;
        }
        // Pas dzielony: czerwien to tarcza, biel to litery. Czern rozstrzyga sie dwuetapowo -
        // wewnatrz emblematu to sylwetka, powyzej pierwszego wiersza z biela to wygaszony
        // brzeg tarczy, a nizej dopiero ciecia w literach.
        const i4 = p * 4;
        const [r, g, b] = [data[i4], data[i4 + 1], data[i4 + 2]];
        if (isRed(r, g, b)) role[p] = 1;
        else if (isWhite(r, g, b)) role[p] = 2;
        else role[p] = inEmblem || y < firstWhiteRow ? 1 : 2;
      }
    }
  });

  /**
   * Buduje RGBA dla wybranych rol.
   * Sygnet (rola 1) idzie kolorem ze zrodla: czerwone pole z czarna sylwetka w srodku
   * czyta sie i na papierze, i na graficie - nie potrzebuje wariantu.
   * Napis (rola 2) jest przemalowywany: piksele NIECZERWONE traktujemy jak maske krycia
   * (jasnosc = ile litery w tym pikselu), wiec biel staje sie tuszem albo biela, a czarne
   * ciecia w literach robia sie PRZEZROCZYSTE. Bez tego na papierze ciecia zniknelyby
   * w tuszu i "DOG" zlalby sie w klage.
   */
  const compose = (wantRoles, textColor) => {
    const out = Buffer.alloc(width * height * 4);
    for (let p = 0; p < width * height; p++) {
      const r0 = role[p];
      if (!wantRoles.includes(r0)) continue;
      const i = p * 4;
      const [r, g, b] = [data[i], data[i + 1], data[i + 2]];
      if (r0 === 1) {
        // sygnet idzie kolorem ze zrodla. Sylwetce, ktora flood fill zjadl razem z tlem,
        // przywracamy pelne krycie - inaczej na papierze zostanie po niej biala dziura.
        out[i] = r;
        out[i + 1] = g;
        out[i + 2] = b;
        out[i + 3] = alpha[p] > 0 ? alpha[p] : 255;
        continue;
      }
      if (isRed(r, g, b)) {
        out[i] = r;
        out[i + 1] = g;
        out[i + 2] = b;
        out[i + 3] = alpha[p];
        continue;
      }
      const coverage = luma(r, g, b) / 255;
      out[i] = textColor.r;
      out[i + 1] = textColor.g;
      out[i + 2] = textColor.b;
      out[i + 3] = Math.round(alpha[p] * coverage);
    }
    return out;
  };

  const png = (buf) => sharp(buf, { raw: { width, height, channels: 4 } }).png();
  const markBox = bbox(role, 1, width, height);
  const wordBox = bbox(role, 2, width, height);
  const fullBox = {
    left: Math.min(markBox.left, wordBox.left),
    top: Math.min(markBox.top, wordBox.top),
    width: Math.max(markBox.left + markBox.width, wordBox.left + wordBox.width) -
      Math.min(markBox.left, wordBox.left),
    height: Math.max(markBox.top + markBox.height, wordBox.top + wordBox.height) -
      Math.min(markBox.top, wordBox.top),
  };

  const k = brand.key;
  await png(compose([1], INK)).extract(markBox).toFile(join(BRAND_DIR, `${k}-mark.png`));
  await png(compose([2], INK)).extract(wordBox).toFile(join(BRAND_DIR, `${k}-wordmark.png`));
  await png(compose([2], WHITE)).extract(wordBox).toFile(join(BRAND_DIR, `${k}-wordmark-dark.png`));
  await png(compose([1, 2], INK)).extract(fullBox).toFile(join(BRAND_DIR, `${k}-logo.png`));
  await png(compose([1, 2], WHITE)).extract(fullBox).toFile(join(BRAND_DIR, `${k}-logo-dark.png`));

  console.log(
    `  sygnet ${markBox.width}x${markBox.height}, napis ${wordBox.width}x${wordBox.height}, ` +
      `lockup ${fullBox.width}x${fullBox.height} (granica biel/czerwien: y=${firstWhiteRow})`
  );
}

// ---- ikony i OG ------------------------------------------------------------
// Marka calego serwisu to Dog Store - favicon, ikony PWA i obrazek OG ida z niej.
// Sekcja Pro nie ma wlasnego faviconu: to ta sama strona, nie inna domena.
async function squareIcon(size, out) {
  const inner = Math.round(size * 0.78); // ~11% marginesu; w malych rozmiarach pelny kadr klei sie do krawedzi
  const mark = await sharp(join(BRAND_DIR, "ds-mark.png"))
    .resize(inner, inner, { fit: "contain", background: { ...ICON_BG, alpha: 0 } })
    .toBuffer();
  const buf = await sharp({
    create: { width: size, height: size, channels: 4, background: { ...ICON_BG, alpha: 1 } },
  })
    .composite([{ input: mark, gravity: "center" }])
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
// sharp nie zapisuje ICO, wiec skladamy kontener recznie.
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
  e.writeUInt8(icoSizes[i] === 256 ? 0 : icoSizes[i], 0); // szerokosc
  e.writeUInt8(icoSizes[i] === 256 ? 0 : icoSizes[i], 1); // wysokosc
  e.writeUInt8(0, 2); // paleta
  e.writeUInt8(0, 3); // reserved
  e.writeUInt16LE(1, 4); // plaszczyzny
  e.writeUInt16LE(32, 6); // bity na piksel
  e.writeUInt32LE(img.length, 8);
  e.writeUInt32LE(offset, 12);
  offset += img.length;
  entries.push(e);
});
writeFileSync(join(APP_DIR, "favicon.ico"), Buffer.concat([header, ...entries, ...icoImages]));

// obrazek Open Graph 1200x630
await sharp({
  create: { width: 1200, height: 630, channels: 4, background: { ...ICON_BG, alpha: 1 } },
})
  .composite([
    {
      input: await sharp(join(BRAND_DIR, "ds-logo-dark.png"))
        .resize({ height: 470, fit: "contain", background: { ...ICON_BG, alpha: 0 } })
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
console.log("");
await info("ds-mark", join(BRAND_DIR, "ds-mark.png"));
await info("ds-wordmark", join(BRAND_DIR, "ds-wordmark.png"));
await info("ds-pro-mark", join(BRAND_DIR, "ds-pro-mark.png"));
await info("ds-pro-wordmark", join(BRAND_DIR, "ds-pro-wordmark.png"));
await info("icon", join(APP_DIR, "icon.png"));
await info("og", join(BRAND_DIR, "og.png"));
