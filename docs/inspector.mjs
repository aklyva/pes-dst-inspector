/**
 * Zero-dependency, isomorphic Brother #PES0001 (.PES) and Tajima (.DST) binary stitch inspector.
 * Runs identically in Node.js and modern browsers via Uint8Array + DataView.
 *
 * For full PNG/JPG/SVG-to-PES/DST digitizing, auto-tracing, and satin/tatami planning:
 * https://imagetopes.com
 */

export const BROTHER_PEC_PALETTE = [
  { pecIndex: 1, code: 'ET-001', name: 'Prussian Blue', hex: '#0e2f76', madeiraCode: '1043' },
  { pecIndex: 2, code: 'ET-007', name: 'Blue', hex: '#1c5aa6', madeiraCode: '1076' },
  { pecIndex: 3, code: 'ET-010', name: 'Teal Green', hex: '#0f8c79', madeiraCode: '1249' },
  { pecIndex: 4, code: 'ET-014', name: 'Teal Green', hex: '#468b97', madeiraCode: '1133' },
  { pecIndex: 5, code: 'ET-019', name: 'Cardinal Red', hex: '#b8292f', madeiraCode: '1147' },
  { pecIndex: 6, code: 'ET-020', name: 'Reddish Brown', hex: '#8c3b2b', madeiraCode: '1144' },
  { pecIndex: 7, code: 'ET-021', name: 'Magenta Rose', hex: '#c72c82', madeiraCode: '1109' },
  { pecIndex: 8, code: 'ET-025', name: 'Harvest Gold', hex: '#eab308', madeiraCode: '1025' },
  { pecIndex: 9, code: 'ET-027', name: 'Warm Orange', hex: '#ea580c', madeiraCode: '1078' },
  { pecIndex: 10, code: 'ET-029', name: 'Emerald Leaf', hex: '#16a34a', madeiraCode: '1251' },
  { pecIndex: 11, code: 'ET-033', name: 'Moss Olive', hex: '#4d7c0f', madeiraCode: '1369' },
  { pecIndex: 12, code: 'ET-045', name: 'Cream Ivory', hex: '#fef3c7', madeiraCode: '1082' },
  { pecIndex: 13, code: 'ET-052', name: 'Metallic Gold', hex: '#d97706', madeiraCode: '1024' },
  { pecIndex: 14, code: 'ET-056', name: 'Warm Blush Pink', hex: '#f472b6', madeiraCode: '1116' },
  { pecIndex: 15, code: 'ET-058', name: 'Snow White', hex: '#f8fafc', madeiraCode: '1001' },
  { pecIndex: 16, code: 'ET-060', name: 'Jet Black', hex: '#111827', madeiraCode: '1000' },
  { pecIndex: 19, code: 'ET-019B', name: 'Alpine Slate Blue', hex: '#3a506b', madeiraCode: '1042' },
  { pecIndex: 21, code: 'ET-021B', name: 'Electric Ocean Blue', hex: '#1d5b79', madeiraCode: '1075' },
  { pecIndex: 25, code: 'ET-025B', name: 'Coral Carmine', hex: '#ef6262', madeiraCode: '1108' },
  { pecIndex: 26, code: 'ET-026', name: 'Light Amber Brown', hex: '#a86424', madeiraCode: '1145' },
  { pecIndex: 29, code: 'ET-029W', name: 'Warm Linen White', hex: '#f5ebe1', madeiraCode: '1002' },
  { pecIndex: 33, code: 'ET-033G', name: 'Sunburst Gold', hex: '#f4b942', madeiraCode: '1023' },
  { pecIndex: 36, code: 'ET-036', name: 'Tudor Crimson Red', hex: '#c93b2b', madeiraCode: '1147' },
  { pecIndex: 38, code: 'ET-038', name: 'Collegiate Ultramarine', hex: '#1b365d', madeiraCode: '1043' },
  { pecIndex: 42, code: 'ET-042', name: 'Parchment Cream', hex: '#f3e8d8', madeiraCode: '1082' },
  { pecIndex: 47, code: 'ET-047', name: 'Soft Muzzle Beige', hex: '#f6dec2', madeiraCode: '1084' },
  { pecIndex: 48, code: 'ET-048', name: 'Strawberry Scarlet', hex: '#d9383a', madeiraCode: '1146' },
  { pecIndex: 49, code: 'ET-049', name: 'Terracotta Vermilion', hex: '#d95f43', madeiraCode: '1078' },
  { pecIndex: 50, code: 'ET-050', name: 'Deep Satin Black', hex: '#1c1917', madeiraCode: '1000' },
  { pecIndex: 52, code: 'ET-052G', name: 'Crown Harvest Gold', hex: '#e8a33c', madeiraCode: '1025' },
  { pecIndex: 54, code: 'ET-054', name: 'Botanical Emerald', hex: '#1e6f5c', madeiraCode: '1251' },
  { pecIndex: 56, code: 'ET-056M', name: 'Cottage Moss Green', hex: '#2d7d46', madeiraCode: '1369' }
];

const DST_PRESET_PALETTES = {
  'varsity-crest-mo': [
    { code: 'ET-038', name: 'Collegiate Ultramarine', hex: '#1b365d', madeiraCode: '1043' },
    { code: 'ET-052G', name: 'Varsity Gold Satin', hex: '#d99b26', madeiraCode: '1025' },
    { code: 'ET-036', name: 'Crimson Laurel & Shield', hex: '#c93b2b', madeiraCode: '1147' }
  ],
  'yosemite-sunset-': [
    { code: 'ET-052G', name: 'Sunburst Sky Gold', hex: '#e8a33c', madeiraCode: '1025' },
    { code: 'ET-049', name: 'Terracotta Sun', hex: '#d95f43', madeiraCode: '1078' },
    { code: 'ET-019B', name: 'Granite Peaks Blue', hex: '#3a506b', madeiraCode: '1042' },
    { code: 'ET-054', name: 'Alpine Pine Emerald', hex: '#1e6f5c', madeiraCode: '1251' },
    { code: 'ET-029W', name: 'River Trail White', hex: '#f7f4ee', madeiraCode: '1002' },
    { code: 'ET-050', name: 'Merrow Satin Rim', hex: '#1c1917', madeiraCode: '1000' }
  ],
  'tudor-rose-crest': [
    { code: 'ET-029W', name: 'Warm Linen White', hex: '#f5ebe1', madeiraCode: '1002' },
    { code: 'ET-054', name: 'Botanical Emerald', hex: '#1e6f5c', madeiraCode: '1251' },
    { code: 'ET-036', name: 'Tudor Crimson Red', hex: '#c93b2b', madeiraCode: '1147' },
    { code: 'ET-052G', name: 'Crown Harvest Gold', hex: '#e8a33c', madeiraCode: '1025' },
    { code: 'ET-050', name: 'Deep Satin Black', hex: '#1c1917', madeiraCode: '1000' },
    { code: 'ET-054', name: 'Botanical Emerald', hex: '#1e6f5c', madeiraCode: '1251' }
  ]
};

export const HOOP_PRESETS = [
  {
    id: '4x4',
    name: 'Brother 4x4" Standard Hoop (SA443)',
    widthMm: 100,
    heightMm: 100,
    compatibleMachines: 'Brother SE600, SE625, SE700, PE535, PE550D, Baby Lock Verve'
  },
  {
    id: '5x7',
    name: 'Brother 5x7" Pro Hoop (SA444)',
    widthMm: 130,
    heightMm: 180,
    compatibleMachines: 'Brother PE800, PE900, SE1900, SE2000, Innov-is NQ1700E'
  },
  {
    id: '6x10',
    name: 'Brother 6x10" Commercial Hoop (SA445)',
    widthMm: 160,
    heightMm: 260,
    compatibleMachines: 'Brother Innov-is NQ1700E, Luminaire XP3, Baby Lock Flourish 2'
  },
  {
    id: 'cap-frame',
    name: 'Commercial Cap Frame 5.1x2.4" (PRCF3)',
    widthMm: 130,
    heightMm: 60,
    compatibleMachines: 'Brother Entrepreneur PR680W, PR1055X, Tajima Sai 8-Needle'
  }
];

function inspectorError(message, code = 'INVALID_EMBROIDERY_BINARY') {
  const err = new Error(message);
  err.code = code;
  return err;
}

function toUint8Array(input) {
  if (input instanceof Uint8Array) return input;
  if (input instanceof ArrayBuffer) return new Uint8Array(input);
  if (ArrayBuffer.isView(input)) return new Uint8Array(input.buffer, input.byteOffset, input.byteLength);
  throw inspectorError('Expected Uint8Array or ArrayBuffer input.');
}

function readAscii(bytes, start, end) {
  let out = '';
  const limit = Math.min(bytes.length, end);
  for (let i = start; i < limit; i++) {
    out += String.fromCharCode(bytes[i]);
  }
  return out;
}

function writeAscii(bytes, offset, str) {
  for (let i = 0; i < str.length && offset + i < bytes.length; i++) {
    bytes[offset + i] = str.charCodeAt(i) & 0x7f;
  }
}

export function renderWireframeSvg(playerTrack) {
  const rawVb = Array.isArray(playerTrack?.viewBox) ? playerTrack.viewBox : [-53, -53, 106, 106];
  const [vbX, vbY, vbW, vbH] = rawVb.map((n, i) =>
    Number.isFinite(Number(n)) ? Number(n) : i < 2 ? -53 : 106
  );
  const hoopX = Number((vbX + (vbW - 100) / 2).toFixed(1));
  const hoopY = Number((vbY + (vbH - 100) / 2).toFixed(1));
  const polylines = (playerTrack?.runs || [])
    .filter((r) => r.points && r.points.length > 0)
    .map((r) => {
      const stroke = /^#[0-9a-fA-F]{3,8}$/.test(String(r.color || '')) ? r.color : '#1b365d';
      const pts = r.points
        .map(([x, y]) => `${Number(x).toFixed(2)},${Number(y).toFixed(2)}`)
        .join(' ');
      return `  <polyline fill="none" stroke="${stroke}" stroke-width="0.34" stroke-linecap="round" stroke-linejoin="round" points="${pts}" />`;
    })
    .join('\n');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vbX} ${vbY} ${vbW} ${vbH}">
  <rect x="${vbX}" y="${vbY}" width="${vbW}" height="${vbH}" fill="#ede8df" />
  <rect x="${hoopX}" y="${hoopY}" width="100" height="100" rx="4" fill="none" stroke="#9a9488" stroke-width="0.3" stroke-dasharray="2 1" />
${polylines}
</svg>`;
}

export function evaluateHoopFit(widthMm, heightMm) {
  const w = Number(widthMm || 0);
  const h = Number(heightMm || 0);
  const fits4x4 = w <= 100 && h <= 100;
  const fits5x7 = (w <= 130 && h <= 180) || (w <= 180 && h <= 130);
  const fits6x10 = (w <= 160 && h <= 260) || (w <= 260 && h <= 160);
  const fitsCapFrame = w <= 130 && h <= 60;
  return {
    fits4x4,
    fits5x7,
    fits6x10,
    fitsCapFrame,
    recommendedHoop: fits4x4
      ? 'Brother 4x4" Standard Hoop (100×100mm SA443)'
      : fits5x7
        ? 'Brother 5x7" Pro Hoop (130×180mm SA444)'
        : fits6x10
          ? 'Brother 6x10" Commercial Hoop (160×260mm SA445)'
          : 'Commercial Multi-Needle Frame (>160×260mm)'
  };
}

export function parsePesBinary(inputBytes) {
  const bytes = toUint8Array(inputBytes);
  if (bytes.length < 48) {
    throw inspectorError('Truncated Brother .PES file (shorter than 48-byte #PES0001 header).');
  }
  const magic = readAscii(bytes, 0, 8);
  if (magic !== '#PES0001') {
    throw inspectorError('Invalid Brother .PES magic header (expected #PES0001).');
  }
  if (bytes.length < 580) {
    throw inspectorError('Truncated Brother .PES binary (missing PEC stitch section).');
  }

  const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const pecOffset = dv.getUint32(8, true);
  if (!Number.isFinite(pecOffset) || pecOffset < 12 || pecOffset + 552 >= bytes.length) {
    throw inspectorError('Corrupted Brother .PES binary: out-of-bounds PEC section offset.');
  }

  const pecLabel = readAscii(bytes, pecOffset, pecOffset + 19)
    .replace(/[\x00-\x1f\x7f]+/g, ' ')
    .replace(/^LA:/, '')
    .trim();
  const colorCount = (bytes[pecOffset + 48] & 0xff) + 1;
  const pecColors = [];
  for (let i = 0; i < colorCount; i++) {
    const palPos = pecOffset + 49 + i;
    const idx = palPos < bytes.length ? bytes[palPos] & 0x3f : 1;
    pecColors.push(
      BROTHER_PEC_PALETTE.find((p) => p.pecIndex === idx) ||
        BROTHER_PEC_PALETTE[i % BROTHER_PEC_PALETTE.length]
    );
  }

  const graphicHeaderOffset = pecOffset + 532;
  const widthUnits = dv.getUint16(graphicHeaderOffset + 8, true);
  const heightUnits = dv.getUint16(graphicHeaderOffset + 10, true);

  let pos = graphicHeaderOffset + 20;
  let stitchCount = 0;
  let jumpCount = 0;
  let colorChanges = 0;
  let hasEndMarker = false;
  let curX = 0;
  let curY = 0;
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  let colorIdx = 0;

  const runs = [];
  let currentRun = { color: pecColors[0] ? pecColors[0].hex : '#0e2f76', points: [] };
  const stopStitchCounts = new Array(Math.max(1, colorCount)).fill(0);

  while (pos < bytes.length) {
    const b0 = bytes[pos];
    if (b0 === 0xff) {
      hasEndMarker = true;
      break;
    }
    if (b0 === 0xfe && pos + 1 < bytes.length && bytes[pos + 1] === 0xb0) {
      if (pos + 2 >= bytes.length) break;
      colorChanges++;
      if (currentRun.points.length > 0) runs.push(currentRun);
      colorIdx = Math.min(colorIdx + 1, pecColors.length - 1);
      currentRun = { color: pecColors[colorIdx] ? pecColors[colorIdx].hex : '#1c5aa6', points: [] };
      pos += 3;
      continue;
    }

    let isJump = false;
    let dx = 0;
    let dy = 0;

    if (b0 & 0x80) {
      if (pos + 1 >= bytes.length) break;
      if (b0 & 0x10 || b0 & 0x20) isJump = true;
      const b1 = bytes[pos + 1];
      const raw12 = ((b0 & 0x0f) << 8) | b1;
      dx = raw12 < 0x800 ? raw12 : raw12 - 0x1000;
      pos += 2;
    } else {
      dx = b0 < 0x40 ? b0 : b0 - 0x80;
      pos += 1;
    }

    if (pos >= bytes.length) break;
    const bY = bytes[pos];
    if (bY & 0x80) {
      if (pos + 1 >= bytes.length) break;
      if (bY & 0x10 || bY & 0x20) isJump = true;
      const bY1 = bytes[pos + 1];
      const raw12Y = ((bY & 0x0f) << 8) | bY1;
      dy = raw12Y < 0x800 ? raw12Y : raw12Y - 0x1000;
      pos += 2;
    } else {
      dy = bY < 0x40 ? bY : bY - 0x80;
      pos += 1;
    }

    curX += dx;
    curY += dy;
    stitchCount++;
    if (isJump) {
      jumpCount++;
      if (currentRun.points.length > 0) {
        runs.push(currentRun);
        currentRun = { color: pecColors[colorIdx] ? pecColors[colorIdx].hex : '#0e2f76', points: [] };
      }
    }

    const xMm = Number((curX / 10).toFixed(2));
    const yMm = Number((curY / 10).toFixed(2));
    if (xMm < minX) minX = xMm;
    if (xMm > maxX) maxX = xMm;
    if (yMm < minY) minY = yMm;
    if (yMm > maxY) maxY = yMm;

    currentRun.points.push([xMm, yMm]);
    stopStitchCounts[colorIdx] = (stopStitchCounts[colorIdx] || 0) + 1;
  }

  if (currentRun.points.length > 0) runs.push(currentRun);
  if (stitchCount === 0 || runs.length === 0) {
    throw inspectorError('Corrupted or empty Brother .PES binary: zero decodable stitches.');
  }

  const spanW = Number(Math.max(1, maxX - minX).toFixed(1));
  const spanH = Number(Math.max(1, maxY - minY).toFixed(1));
  const useHeaderSize = widthUnits > 0 && widthUnits <= 5000 && heightUnits > 0 && heightUnits <= 5000 && spanW < 5;
  const widthMm = useHeaderSize ? Number((widthUnits / 10).toFixed(1)) : spanW;
  const heightMm = useHeaderSize ? Number((heightUnits / 10).toFixed(1)) : spanH;

  const boxSize = Math.max(106, Number(Math.max(spanW, spanH) + 16).toFixed(1));
  const cx = Number(((minX + maxX) / 2).toFixed(1));
  const cy = Number(((minY + maxY) / 2).toFixed(1));
  const playerTrack = {
    viewBox: [
      Number((cx - boxSize / 2).toFixed(1)),
      Number((cy - boxSize / 2).toFixed(1)),
      boxSize,
      boxSize
    ],
    runs
  };

  const colorStops = pecColors.map((p, idx) => ({
    stopNumber: idx + 1,
    hex: p.hex,
    brotherThreadName: `${p.name} (${p.code})`,
    madeiraCode: `Madeira ${p.madeiraCode}`,
    stitches: stopStitchCounts[idx] || 1
  }));

  return {
    valid: true,
    format: 'PES',
    label: pecLabel || 'PES-Design',
    stitchCount,
    jumpCount,
    colorCount,
    colorStops,
    sizeMm: { width: widthMm, height: heightMm },
    headerMeta: {
      magic: '#PES0001',
      pecOffset,
      hasEndMarker,
      fileSizeBytes: bytes.length
    },
    playerTrack
  };
}

function decodeDstTripletDelta(b0, b1, b2) {
  let dx = 0;
  let dy = 0;
  if (b0 & 0x01) dx += 1;
  if (b0 & 0x02) dx -= 1;
  if (b0 & 0x04) dx += 9;
  if (b0 & 0x08) dx -= 9;
  if (b0 & 0x80) dy += 1;
  if (b0 & 0x40) dy -= 1;
  if (b0 & 0x20) dy += 9;
  if (b0 & 0x10) dy -= 9;

  if (b1 & 0x01) dx += 3;
  if (b1 & 0x02) dx -= 3;
  if (b1 & 0x04) dx += 27;
  if (b1 & 0x08) dx -= 27;
  if (b1 & 0x80) dy += 3;
  if (b1 & 0x40) dy -= 3;
  if (b1 & 0x20) dy += 27;
  if (b1 & 0x10) dy -= 27;

  if (b2 & 0x04) dx += 81;
  if (b2 & 0x08) dx -= 81;
  if (b2 & 0x20) dy += 81;
  if (b2 & 0x10) dy -= 81;
  return { dx, dy };
}

export function parseDstBinary(inputBytes) {
  const bytes = toUint8Array(inputBytes);
  if (bytes.length < 515) {
    throw inspectorError('Buffer shorter than 512-byte Tajima .DST header + stitch triplet.');
  }
  const headerAscii = readAscii(bytes, 0, 512);
  if (!headerAscii.startsWith('LA:') && !/\bST:\s*\d+/i.test(headerAscii)) {
    throw inspectorError('Invalid Tajima .DST 512-byte ASCII header (expected LA: / ST: fields).');
  }
  const labelLine = (headerAscii.split('\r')[0] || '')
    .replace(/[\x00-\x1f\x7f]+/g, ' ')
    .replace(/^LA:/, '')
    .trim();

  const activePalette = DST_PRESET_PALETTES[labelLine] || [
    { code: 'ET-038', name: 'Collegiate Ultramarine', hex: '#1b365d', madeiraCode: '1043' },
    { code: 'ET-052G', name: 'Crown Harvest Gold', hex: '#d99b26', madeiraCode: '1025' },
    { code: 'ET-036', name: 'Tudor Crimson Red', hex: '#c93b2b', madeiraCode: '1147' },
    { code: 'ET-054', name: 'Botanical Emerald', hex: '#1e6f5c', madeiraCode: '1251' },
    { code: 'ET-050', name: 'Deep Satin Black', hex: '#1c1917', madeiraCode: '1000' }
  ];

  const bodyLen = bytes.length - 512;
  const tripletCount = Math.floor(bodyLen / 3);
  const lastIdx = 512 + (tripletCount - 1) * 3;
  const hasEofTriplet =
    bytes[lastIdx] === 0x00 && bytes[lastIdx + 1] === 0x00 && bytes[lastIdx + 2] === 0xf3;

  let stitchCount = 0;
  let jumpCount = 0;
  let colorChanges = 0;
  let curX = 0;
  let curY = 0;
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  let colorIdx = 0;

  const runs = [];
  let currentRun = { color: activePalette[0].hex, points: [] };
  const stopStitchCounts = [0];

  for (let i = 0; i < tripletCount; i++) {
    const offset = 512 + i * 3;
    const b0 = bytes[offset];
    const b1 = bytes[offset + 1];
    const b2 = bytes[offset + 2];

    if (b0 === 0x00 && b1 === 0x00 && b2 === 0xf3) break;

    if ((b2 & 0xc0) === 0xc0) {
      colorChanges++;
      if (currentRun.points.length > 0) runs.push(currentRun);
      colorIdx++;
      stopStitchCounts[colorIdx] = 0;
      const pal = activePalette[colorIdx % activePalette.length];
      currentRun = { color: pal.hex, points: [] };
      continue;
    }

    const { dx, dy } = decodeDstTripletDelta(b0, b1, b2);
    curX += dx;
    curY -= dy;

    const isJump = (b2 & 0x80) !== 0;
    stitchCount++;
    if (isJump) {
      jumpCount++;
      if (currentRun.points.length > 0) {
        runs.push(currentRun);
        const pal = activePalette[colorIdx % activePalette.length];
        currentRun = { color: pal.hex, points: [] };
      }
    }

    const xMm = Number((curX / 10).toFixed(2));
    const yMm = Number((curY / 10).toFixed(2));
    if (xMm < minX) minX = xMm;
    if (xMm > maxX) maxX = xMm;
    if (yMm < minY) minY = yMm;
    if (yMm > maxY) maxY = yMm;

    currentRun.points.push([xMm, yMm]);
    stopStitchCounts[colorIdx] = (stopStitchCounts[colorIdx] || 0) + 1;
  }

  if (currentRun.points.length > 0) runs.push(currentRun);
  if (stitchCount === 0 || runs.length === 0) {
    throw inspectorError('Corrupted or empty Tajima .DST file: zero decodable stitches.');
  }

  const widthMm = Number(Math.max(1, maxX - minX).toFixed(1));
  const heightMm = Number(Math.max(1, maxY - minY).toFixed(1));
  const boxSize = Math.max(106, Number(Math.max(widthMm, heightMm) + 16).toFixed(1));
  const cx = Number(((minX + maxX) / 2).toFixed(1));
  const cy = Number(((minY + maxY) / 2).toFixed(1));
  const playerTrack = {
    viewBox: [
      Number((cx - boxSize / 2).toFixed(1)),
      Number((cy - boxSize / 2).toFixed(1)),
      boxSize,
      boxSize
    ],
    runs
  };

  const colorCount = colorChanges + 1;
  const colorStops = [];
  for (let i = 0; i < colorCount; i++) {
    const pal = activePalette[i % activePalette.length];
    colorStops.push({
      stopNumber: i + 1,
      hex: pal.hex,
      brotherThreadName: `${pal.name} (${pal.code})`,
      madeiraCode: `Madeira ${pal.madeiraCode}`,
      stitches: stopStitchCounts[i] || 1
    });
  }

  return {
    valid: true,
    format: 'DST',
    label: labelLine || 'DST-Design',
    stitchCount,
    jumpCount,
    colorCount,
    colorStops,
    sizeMm: { width: widthMm, height: heightMm },
    headerMeta: {
      headerBytes: 512,
      hasEofTriplet,
      fileSizeBytes: bytes.length
    },
    playerTrack
  };
}

export function inspectEmbroideryBytes(inputBytes, fileName = 'design.pes') {
  const cleanName = String(fileName || 'design.pes').trim();
  const extMatch = cleanName.match(/\.([a-z0-9]+)$/i);
  const ext = extMatch ? extMatch[1].toLowerCase() : '';

  if (['png', 'jpg', 'jpeg', 'webp', 'svg', 'gif', 'bmp'].includes(ext)) {
    throw inspectorError(
      `Raster/vector image detected (${cleanName}). Open-source pes-dst-inspector only inspects compiled .PES and .DST stitch binaries. Convert PNG, JPG, or SVG artwork into Brother .PES and Tajima .DST online at https://imagetopes.com`,
      'IMAGE_CONVERSION_REQUIRED'
    );
  }

  const bytes = toUint8Array(inputBytes);
  const isPesMagic = bytes.length >= 8 && readAscii(bytes, 0, 8) === '#PES0001';

  const parsed =
    ext === 'pes' || isPesMagic
      ? parsePesBinary(bytes)
      : ext === 'dst' || (bytes.length >= 515 && readAscii(bytes, 0, 3) === 'LA:')
        ? parseDstBinary(bytes)
        : null;

  if (!parsed) {
    throw inspectorError(
      `Unsupported or unrecognized file "${cleanName}". Expected a Brother #PES0001 (.pes) or Tajima 512-byte (.dst) embroidery file.`
    );
  }

  const hoopFit = evaluateHoopFit(parsed.sizeMm.width, parsed.sizeMm.height);
  const svgWireframe = renderWireframeSvg(parsed.playerTrack);
  const estimatedMinutes = Math.max(1, Math.round(parsed.stitchCount / 650));

  return {
    ...parsed,
    fileName: cleanName,
    hoopFit,
    estimatedMinutes,
    svgWireframe,
    conversionStudioUrl: 'https://imagetopes.com'
  };
}

/**
 * Generates a deterministic in-memory Brother #PES0001 sample binary for unit tests & CLI demos.
 */
export function createSamplePesBytes() {
  const pecOffset = 48;
  const stitchStart = pecOffset + 552;
  const deltas = [
    [0, -20], [18, 8], [14, 18], [-10, 20], [-22, 6],
    [-22, -6], [-10, -20], [14, -18], [18, -8],
    [0xfe, 0xb0, 1],
    [-12, -12], [24, 0], [0, 24], [-24, 0], [0, -24],
    [0xfe, 0xb0, 2],
    [-6, -6], [12, 0], [0, 12], [-12, 0], [0, -12]
  ];

  const stitchBytes = [];
  for (const item of deltas) {
    if (item.length === 3 && item[0] === 0xfe) {
      stitchBytes.push(0xfe, 0xb0, item[2]);
    } else {
      const [dx, dy] = item;
      stitchBytes.push(dx >= 0 ? dx & 0x3f : (dx + 0x80) & 0x7f);
      stitchBytes.push(dy >= 0 ? dy & 0x3f : (dy + 0x80) & 0x7f);
    }
  }
  stitchBytes.push(0xff);

  const totalLen = stitchStart + stitchBytes.length;
  const buf = new Uint8Array(totalLen);
  const dv = new DataView(buf.buffer);

  writeAscii(buf, 0, '#PES0001');
  dv.setUint32(8, pecOffset, true);
  writeAscii(buf, pecOffset, 'LA:ROYAL-CREST     ');
  buf[pecOffset + 48] = 2; // 3 colors (colorCount - 1)
  buf[pecOffset + 49] = 36; // Tudor Crimson Red
  buf[pecOffset + 50] = 52; // Crown Harvest Gold
  buf[pecOffset + 51] = 54; // Botanical Emerald

  const graphicHeaderOffset = pecOffset + 532;
  dv.setUint16(graphicHeaderOffset + 8, 640, true); // 64.0 mm
  dv.setUint16(graphicHeaderOffset + 10, 640, true); // 64.0 mm

  for (let i = 0; i < stitchBytes.length; i++) {
    buf[stitchStart + i] = stitchBytes[i];
  }
  return buf;
}

/**
 * Generates a deterministic in-memory Tajima .DST (512-byte header + triplets) sample binary.
 */
export function createSampleDstBytes() {
  const steps = [
    [20, 0, 0x03], [15, 15, 0x03], [0, 20, 0x03], [-15, 15, 0x03],
    [-20, 0, 0x03], [-15, -15, 0x03], [0, -20, 0x03], [15, -15, 0x03],
    [0, 0, 0xc3], // color change
    [10, 10, 0x03], [-20, 0, 0x03], [0, -20, 0x03], [20, 0, 0x03]
  ];

  const buf = new Uint8Array(512 + (steps.length + 1) * 3);
  buf.fill(0x20, 0, 512);
  const headerStr = 'LA:VARSITY-CAP     \rST:      13\rCO:  1\r+X:  180\r-X:  180\r+Y:  180\r-Y:  180\r';
  writeAscii(buf, 0, headerStr);
  buf[511] = 0x1a;

  function encodeTriplet(dx, dy, flag) {
    let b0 = 0;
    let b1 = 0;
    let b2 = flag & 0xf3;
    if (dx > 0) b0 |= 0x01;
    if (dx < 0) b0 |= 0x02;
    if (Math.abs(dx) >= 9) b0 |= dx > 0 ? 0x04 : 0x08;
    if (Math.abs(dx) >= 20) b1 |= dx > 0 ? 0x04 : 0x08;
    if (dy > 0) b0 |= 0x80;
    if (dy < 0) b0 |= 0x40;
    if (Math.abs(dy) >= 9) b0 |= dy > 0 ? 0x20 : 0x10;
    if (Math.abs(dy) >= 20) b1 |= dy > 0 ? 0x20 : 0x10;
    return [b0, b1, b2];
  }

  let offset = 512;
  for (const [dx, dy, flag] of steps) {
    const [b0, b1, b2] = flag === 0xc3 ? [0x00, 0x00, 0xc3] : encodeTriplet(dx, dy, flag);
    buf[offset++] = b0;
    buf[offset++] = b1;
    buf[offset++] = b2;
  }
  buf[offset++] = 0x00;
  buf[offset++] = 0x00;
  buf[offset++] = 0xf3;
  return buf;
}
