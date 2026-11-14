import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  createSamplePesBytes,
  createSampleDstBytes,
  inspectEmbroideryBytes
} from '../src/inspector.mjs';

test('inspectEmbroideryBytes parses valid Brother #PES0001 binary and verifies hoop fit', () => {
  const pesBytes = createSamplePesBytes();
  const report = inspectEmbroideryBytes(pesBytes, 'sample-crest.pes');

  assert.equal(report.valid, true);
  assert.equal(report.format, 'PES');
  assert.equal(report.headerMeta.magic, '#PES0001');
  assert.ok(report.headerMeta.pecOffset >= 48);
  assert.ok(report.stitchCount > 10);
  assert.ok(report.colorCount >= 2);
  assert.ok(report.sizeMm.width > 0 && report.sizeMm.height > 0);
  assert.equal(report.hoopFit.fits4x4, true);
  assert.equal(report.hoopFit.fits5x7, true);
  assert.match(report.svgWireframe, /<svg\b[^>]*>/);
  assert.match(report.svgWireframe, /<polyline\b/);
});

test('inspectEmbroideryBytes parses valid Tajima 512-byte .DST binary and balanced-ternary triplets', () => {
  const dstBytes = createSampleDstBytes();
  const report = inspectEmbroideryBytes(dstBytes, 'cap-logo.dst');

  assert.equal(report.valid, true);
  assert.equal(report.format, 'DST');
  assert.equal(report.headerMeta.headerBytes, 512);
  assert.equal(report.headerMeta.hasEofTriplet, true);
  assert.ok(report.stitchCount > 10);
  assert.ok(report.colorCount >= 2);
  assert.ok(report.sizeMm.width > 0 && report.sizeMm.height > 0);
  assert.match(report.svgWireframe, /<svg\b[^>]*>/);
});

test('inspectEmbroideryBytes flags raster/vector images as conversion-required for ImageToPES Studio', () => {
  const pngMagic = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  assert.throws(
    () => inspectEmbroideryBytes(pngMagic, 'logo.png'),
    (err) => err.code === 'IMAGE_CONVERSION_REQUIRED' && /imagetopes\.com/i.test(err.message)
  );
});

test('CLI bin/cli.mjs outputs JSON and human summary for .pes and .dst files', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pes-dst-test-'));
  try {
    const pesPath = path.join(tmpDir, 'test.pes');
    fs.writeFileSync(pesPath, createSamplePesBytes());
    const outJson = execFileSync('node', ['./bin/cli.mjs', pesPath, '--json'], {
      cwd: path.resolve(import.meta.dirname, '..'),
      encoding: 'utf8'
    });
    const parsed = JSON.parse(outJson);
    assert.equal(parsed.format, 'PES');
    assert.equal(parsed.valid, true);

    const outHuman = execFileSync('node', ['./bin/cli.mjs', pesPath], {
      cwd: path.resolve(import.meta.dirname, '..'),
      encoding: 'utf8'
    });
    assert.match(outHuman, /#PES0001/);
    assert.match(outHuman, /https:\/\/imagetopes\.com/);
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});
