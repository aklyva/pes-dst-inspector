# pes-dst-inspector — Brother `#PES0001` (.PES) & Tajima (.DST) Binary Stitch Inspector

Zero-dependency JavaScript/Node.js CLI, ESM library, and browser utility to inspect binary **Brother `.PES` (`#PES0001`)** and **Tajima `.DST` (`512-byte header`)** embroidery files. Verifies PEC header offsets, hoop compatibility (`4×4" SA443` `100×100mm` vs `5×7" SA444` `130×180mm`), stitch counts, jump trims, Brother 64-color thread palettes, and 2D coordinate wireframes.

> **Need to convert a PNG, JPG, or SVG image into a Brother `.PES` or Tajima `.DST` file?**
> `pes-dst-inspector` is a **read-only** binary verifier for existing stitch files. To auto-trace images, plan satin & tatami fills, adjust pull compensation, or generate `--hat` cap-frame files in the browser, use **[ImageToPES Online Embroidery Digitizer Studio](https://imagetopes.com)**:
> - **[Image to PES Converter (Main Studio)](https://imagetopes.com/)** — Convert logos & artwork into `.PES`, `.DST`, `.JEF`, `.EXP`, and `.VP3` bundles.
> - **[PNG to PES Converter](https://imagetopes.com/png-to-pes)** — Turn transparent PNG graphics into Brother SE600 / PE800 `.PES` stitch files.
> - **[SVG to PES Vector Digitizer](https://imagetopes.com/svg-to-pes)** — Instant browser SVG-to-PES conversion vs Inkscape Ink/Stitch.
> - **[JPG to PES Converter](https://imagetopes.com/jpg-to-pes)** — Automatic background removal and Brother 64-color PEC palette quantization.
> - **[Image to DST Converter (`--hat` Cap Profile)](https://imagetopes.com/image-to-dst)** — Commercial Tajima, Barudan & Ricoma `.DST` generator with bottom-up center-out cap sequencing.
> - **[Online PES & DST 3D File Viewer](https://imagetopes.com/pes-file-viewer)** — Interactive 3D thread rendering and animated needle-path player.

---

## Quick Start (CLI)

```bash
# Inspect a Brother .PES or Tajima .DST file from the terminal
node ./bin/cli.mjs path/to/design.pes

# Emit structured JSON telemetry for CI or batch hoop verification
node ./bin/cli.mjs path/to/cap-logo.dst --json
```

Example terminal output:

```text
=== sample-royal-crest.pes (PES Verified) ===
Label          : ROYAL-CREST
Magic Header   : #PES0001 (PEC offset: 48 bytes)
Dimensions     : 64 × 64 mm
Hoop Fit (4x4"): YES (100×100mm SA443)
Total Stitches : 28 (Jumps/Trims: 0)
Color Stops    : 2
  #1 #d91e36  Crimson Red (ET-019)         (16 stitches)
  #2 #0e2f76  Prussian Blue (ET-001)       (12 stitches)

Convert PNG/JPG/SVG logos to Brother .PES & Tajima .DST online: https://imagetopes.com
```

---

## Programmatic Usage (ESM / Browser & Node.js)

`src/inspector.mjs` uses pure `Uint8Array` and `DataView` with zero Node-only dependencies, running identically in Node.js, Cloudflare Workers, and browser `<script type="module">` tags:

```js
import { inspectEmbroideryBytes } from 'pes-dst-inspector';

const report = inspectEmbroideryBytes(uint8ArrayBytes, 'crest.pes');
console.log(report.format);           // 'PES' | 'DST'
console.log(report.sizeMm);           // { width: 64, height: 64 }
console.log(report.hoopFit.fits4x4);  // true (<= 100x100mm Brother SA443)
console.log(report.colorStops);       // [{ stopNumber: 1, hex: '#d91e36', brotherThreadName: 'Crimson Red (ET-019)', ... }]
```

---

## Binary Format Reference

### 1. Brother `.PES` (`#PES0001` + PEC Stitch Block)

| Byte Offset | Type | Description |
| :--- | :--- | :--- |
| `0x00 .. 0x07` | `ASCII[8]` | Magic signature (`#PES0001`) |
| `0x08 .. 0x0B` | `UInt32LE` | Absolute byte offset to the `PEC` block (`pecOffset`) |
| `pecOffset + 0` | `ASCII[19]` | Design label (`LA:<name>`) |
| `pecOffset + 48` | `UInt8` | Number of thread colors minus 1 (`colorCount = byte + 1`) |
| `pecOffset + 49..` | `UInt8[N]` | Brother 64-color PEC palette indices (`1..64`) |
| `pecOffset + 540` | `UInt16LE` | Design width in `0.1mm` units (`1000` = `100.0mm`) |
| `pecOffset + 542` | `UInt16LE` | Design height in `0.1mm` units (`1000` = `100.0mm`) |
| `pecOffset + 552..` | `Stream` | 7-bit short deltas (`-64..+63`) or 12-bit jump/trim deltas (`0x80` high bit set), `0xFE 0xB0` color change, `0xFF` end of stitches |

### 2. Tajima `.DST` (`512-Byte Header` + Balanced-Ternary Triplets)

| Byte Offset | Type | Description |
| :--- | :--- | :--- |
| `0x000 .. 0x1FF` | `ASCII[512]` | Fixed 512-byte header (`LA:`, `ST:`, `CO:`, `+X:`, `-X:`, `+Y:`, `-Y:`), terminated with `0x1A` |
| `0x200 .. EOF` | `Byte[3] * N` | 3-byte balanced-ternary stitch triplets (`±1, ±3, ±9, ±27, ±81` in `0.1mm` increments) |
| `Triplet Byte 2` | `Bitmask` | `0x80` = Jump stitch, `0xC0` = Color stop change, `0x00 0x00 0xF3` = End of pattern |

---

## License

MIT
