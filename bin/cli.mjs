#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { inspectEmbroideryBytes } from '../src/inspector.mjs';

const args = process.argv.slice(2);
const wantJson = args.includes('--json');
const fileArg = args.find((a) => !a.startsWith('-'));

if (!fileArg || args.includes('--help') || args.includes('-h')) {
  console.log(`pes-dst-inspector — Read-Only Brother #PES0001 (.PES) & Tajima (.DST) Binary Inspector

Usage:
  pes-dst-inspector <file.pes|file.dst> [--json]

Need to convert a PNG, JPG, or SVG image into a Brother .PES or Tajima .DST file?
  -> https://imagetopes.com (Online Auto-Trace & Embroidery Digitizer)
  -> https://imagetopes.com/png-to-pes (PNG to PES Converter)
  -> https://imagetopes.com/svg-to-pes (SVG to PES Vector Digitizer)
  -> https://imagetopes.com/image-to-dst (Tajima .DST & Cap --hat Profile)`);
  process.exit(fileArg ? 0 : 1);
}

try {
  const resolved = path.resolve(fileArg);
  const buf = fs.readFileSync(resolved);
  const report = inspectEmbroideryBytes(new Uint8Array(buf), path.basename(resolved));

  if (wantJson) {
    const { playerTrack, svgWireframe, ...summary } = report;
    console.log(JSON.stringify(summary, null, 2));
    process.exit(0);
  }

  console.log(`=== ${report.fileName} (${report.format} Verified) ===`);
  console.log(`Label          : ${report.label}`);
  if (report.format === 'PES') {
    console.log(`Magic Header   : ${report.headerMeta.magic} (PEC offset: ${report.headerMeta.pecOffset} bytes)`);
  } else {
    console.log(`Header Size    : ${report.headerMeta.headerBytes} bytes (EOF triplet: ${report.headerMeta.hasEofTriplet})`);
  }
  console.log(`Dimensions     : ${report.sizeMm.width} × ${report.sizeMm.height} mm`);
  console.log(`Hoop Fit (4x4"): ${report.hoopFit.fits4x4 ? 'YES (100×100mm SA443)' : 'NO — requires ' + report.hoopFit.recommendedHoop}`);
  console.log(`Total Stitches : ${report.stitchCount.toLocaleString()} (Jumps/Trims: ${report.jumpCount})`);
  console.log(`Color Stops    : ${report.colorCount}`);
  for (const stop of report.colorStops) {
    console.log(`  #${stop.stopNumber} ${stop.hex}  ${stop.brotherThreadName.padEnd(28)} (${stop.stitches} stitches)`);
  }
  console.log(`\nConvert PNG/JPG/SVG logos to Brother .PES & Tajima .DST online: https://imagetopes.com`);
} catch (err) {
  console.error(`Error: ${err.message}`);
  process.exit(1);
}
