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
  { pecIndex: 4, code: 'ET-014', name: 'Cornflower Blue', hex: '#4f86f7', madeiraCode: '1133' },
  { pecIndex: 5, code: 'ET-019', name: 'Crimson Red', hex: '#d91e36', madeiraCode: '1147' },
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
  { pecIndex: 16, code: 'ET-060', name: 'Jet Black', hex: '#111827', madeiraCode: '1000' }
];

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
  const rawVb = Array.isArray(playerTrack?.viewBox) ? playerTrack.viewBox : [-50, -50, 100, 100];
  const [vbX, vbY, vbW, vbH] = rawVb.map((n, i) =>
    Number.isFinite(Number(n)) ? Number(n) : i < 2 ? -50 : 100
  );
  const polylines = (playerTrack?.runs || [])
    .filter((r) => r.points && r.points.length > 0)
    .map((r) => {
      const stroke = /^#[0-9a-fA-F]{3,8}$/.test(String(r.color || '')) ? r.color : '#0e2f76';
      const pts = r.points
        .map(([x, y]) => `${Number(x).toFixed(2)},${Number(y).toFixed(2)}`)
        .join(' ');
      return `  <polyline fill="none" stroke="${stroke}" stroke-width="0.55" stroke-linecap="round" stroke-linejoin="round" points="${pts}" />`;
    })
    .join('\n');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vbX} ${vbY} ${vbW} ${vbH}">\n${polylines}\n</svg>`;
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

  const pad = 4;
  const spanW = Number(Math.max(1, maxX - minX).toFixed(1));
  const spanH = Number(Math.max(1, maxY - minY).toFixed(1));
  const widthMm = widthUnits > 0 && widthUnits <= 5000 ? Number((widthUnits / 10).toFixed(1)) : spanW;
  const heightMm = heightUnits > 0 && heightUnits <= 5000 ? Number((heightUnits / 10).toFixed(1)) : spanH;

  const playerTrack = {
    viewBox: [
      Number((minX - pad).toFixed(1)),
      Number((minY - pad).toFixed(1)),
      Number(Math.max(10, maxX - minX + pad * 2).toFixed(1)),
      Number(Math.max(10, maxY - minY + pad * 2).toFixed(1))
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
  let currentRun = { color: BROTHER_PEC_PALETTE[0].hex, points: [] };
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
      const pal = BROTHER_PEC_PALETTE[colorIdx % BROTHER_PEC_PALETTE.length];
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
        const pal = BROTHER_PEC_PALETTE[colorIdx % BROTHER_PEC_PALETTE.length];
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

  const pad = 4;
  const widthMm = Number(Math.max(1, maxX - minX).toFixed(1));
  const heightMm = Number(Math.max(1, maxY - minY).toFixed(1));
  const playerTrack = {
    viewBox: [
      Number((minX - pad).toFixed(1)),
      Number((minY - pad).toFixed(1)),
      Number((widthMm + pad * 2).toFixed(1)),
      Number((heightMm + pad * 2).toFixed(1))
    ],
    runs
  };

  const colorCount = colorChanges + 1;
  const colorStops = [];
  for (let i = 0; i < colorCount; i++) {
    const pal = BROTHER_PEC_PALETTE[i % BROTHER_PEC_PALETTE.length];
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
  const bytes = toUint8Array(inputBytes);
  const cleanName = String(fileName || 'design.pes').trim();
  const extMatch = cleanName.toLowerCase().match(/\.([a-z0-9]+)$/);
  const ext = extMatch ? extMatch[1] : '';

  const isPng = bytes.length >= 4 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47;
  const isJpg = bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  const headText = readAscii(bytes, 0, Math.min(256, bytes.length)).trimStart();
  const isSvg = /^<\?xml|^<!DOCTYPE\s+svg|^<svg[\s>]/i.test(headText);

  if (['png', 'jpg', 'jpeg', 'webp', 'svg'].includes(ext) || isPng || isJpg || isSvg) {
    throw inspectorError(
      'pes-dst-inspector is a read-only binary verifier for existing .PES and .DST stitch files. To auto-trace and convert PNG, JPG, or SVG artwork into Brother .PES and Tajima .DST embroidery files, use the online digitizing studio at https://imagetopes.com',
      'IMAGE_CONVERSION_REQUIRED'
    );
  }

  const isPesMagic = bytes.length >= 8 && readAscii(bytes, 0, 8) === '#PES0001';
  const isDstMagic = bytes.length >= 515 && readAscii(bytes, 0, 3) === 'LA:';

  const parsed =
    ext === 'pes' || isPesMagic
      ? parsePesBinary(bytes)
      : ext === 'dst' || isDstMagic
        ? parseDstBinary(bytes)
        : (() => {
            throw inspectorError(
              'Unrecognized binary header. Provide a valid Brother #PES0001 (.pes) or Tajima 512-byte (.dst) embroidery file.'
            );
          })();

  const hoopFit = evaluateHoopFit(parsed.sizeMm.width, parsed.sizeMm.height);
  const svgWireframe = renderWireframeSvg(parsed.playerTrack);

  return {
    ...parsed,
    fileName: cleanName,
    hoopFit,
    svgWireframe
  };
}

/**
 * Generates a deterministic, spec-compliant Brother #PES0001 binary buffer in memory
 * (a 2-color 64x64mm geometric crest) for CLI tests and 1-click browser demo inspection.
 */
export function createSamplePesBytes() {
  const pecOffset = 48;
  const stitchStart = pecOffset + 552;
  const stitchBytes = [];

  // Ring 1 (Color 1: Crimson Red ET-019) - octagon stitches
  const deltas1 = [
    [35, 0], [25, 25], [0, 35], [-25, 25], [-35, 0], [-25, -25], [0, -35], [25, -25],
    [35, 0], [25, 25], [0, 35], [-25, 25], [-35, 0], [-25, -25], [0, -35], [25, -25]
  ];
  for (const [dx, dy] of deltas1) {
    stitchBytes.push(dx >= 0 ? dx & 0x3f : (dx + 0x80) & 0x7f);
    stitchBytes.push(dy >= 0 ? dy & 0x3f : (dy + 0x80) & 0x7f);
  }

  // PEC color change marker (0xFE 0xB0 0x02)
  stitchBytes.push(0xfe, 0xb0, 0x02);

  // Ring 2 (Color 2: Prussian Blue ET-001) - inner star stitches
  const deltas2 = [
    [20, 10], [10, 20], [-20, 10], [-10, 20], [-20, -10], [-10, -20], [20, -10], [10, -20],
    [15, 15], [-15, 15], [-15, -15], [15, -15]
  ];
  for (const [dx, dy] of deltas2) {
    stitchBytes.push(dx >= 0 ? dx & 0x3f : (dx + 0x80) & 0x7f);
    stitchBytes.push(dy >= 0 ? dy & 0x3f : (dy + 0x80) & 0x7f);
  }

  // End marker
  stitchBytes.push(0xff);

  const totalLen = stitchStart + stitchBytes.length;
  const bytes = new Uint8Array(totalLen);
  const dv = new DataView(bytes.buffer);

  writeAscii(bytes, 0, '#PES0001');
  dv.setUint32(8, pecOffset, true);
  writeAscii(bytes, pecOffset, 'LA:ROYAL-CREST     ');
  bytes[pecOffset + 48] = 1; // 2 colors (count - 1)
  bytes[pecOffset + 49] = 5; // ET-019 Crimson Red
  bytes[pecOffset + 50] = 1; // ET-001 Prussian Blue

  const graphicHeaderOffset = pecOffset + 532;
  dv.setUint16(graphicHeaderOffset + 8, 640, true);  // 64.0 mm
  dv.setUint16(graphicHeaderOffset + 10, 640, true); // 64.0 mm

  for (let i = 0; i < stitchBytes.length; i++) {
    bytes[stitchStart + i] = stitchBytes[i];
  }
  return bytes;
}

function encodeDstNormalTriplet(dx, dy) {
  // Simple balanced-ternary encoder for small sample steps (-13..+13)
  let rx = dx;
  let ry = dy;
  let b0 = 0;
  let b1 = 0;
  let b2 = 0x03;

  const stepWeights = [
    [9, (pos) => { b0 |= pos ? 0x04 : 0x08; }, (pos) => { b0 |= pos ? 0x20 : 0x10; }],
    [3, (pos) => { b1 |= pos ? 0x01 : 0x02; }, (pos) => { b1 |= pos ? 0x80 : 0x40; }],
    [1, (pos) => { b0 |= pos ? 0x01 : 0x02; }, (pos) => { b0 |= pos ? 0x80 : 0x40; }]
  ];

  for (const [w, setX, setY] of stepWeights) {
    if (rx >= w - Math.floor(w / 2)) {
      setX(true);
      rx -= w;
    } else if (rx <= -(w - Math.floor(w / 2))) {
      setX(false);
      rx += w;
    }
    if (ry >= w - Math.floor(w / 2)) {
      setY(true);
      ry -= w;
    } else if (ry <= -(w - Math.floor(w / 2))) {
      setY(false);
      ry += w;
    }
  }
  return [b0, b1, b2];
}

/**
 * Generates a deterministic, spec-compliant Tajima 512-byte .DST binary buffer in memory.
 */
export function createSampleDstBytes() {
  const triplets = [];
  const steps1 = [
    [12, 0], [12, 6], [6, 12], [0, 12], [-6, 12], [-12, 6], [-12, 0], [-12, -6],
    [-6, -12], [0, -12], [6, -12], [12, -6], [10, 5], [10, -5], [-10, -5], [-10, 5]
  ];
  for (const [dx, dy] of steps1) {
    triplets.push(...encodeDstNormalTriplet(dx, dy));
  }
  // Color change triplet (0x00, 0x00, 0xC3)
  triplets.push(0x00, 0x00, 0xc3);

  const steps2 = [
    [9, 9], [9, -9], [-9, -9], [-9, 9], [12, 0], [-12, 0], [0, 12], [0, -12]
  ];
  for (const [dx, dy] of steps2) {
    triplets.push(...encodeDstNormalTriplet(dx, dy));
  }
  // EOF triplet (0x00, 0x00, 0xF3)
  triplets.push(0x00, 0x00, 0xf3);

  const bytes = new Uint8Array(512 + triplets.length);
  bytes.fill(0x20, 0, 512);
  const headerStr = 'LA:TAJIMA-CAP-LOGO \rST:     25\rCO:  1\r+X:   350\r-X:   350\r+Y:   240\r-Y:   240\rAX:+    0\rAY:+    0\r';
  writeAscii(bytes, 0, headerStr);
  bytes[511] = 0x1a;

  for (let i = 0; i < triplets.length; i++) {
    bytes[512 + i] = triplets[i];
  }
  return bytes;
}
