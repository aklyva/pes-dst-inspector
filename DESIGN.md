# DESIGN.md — PES & DST Binary Inspector (Google Stitch `DESIGN.md` × Meta `Astryx`)

`Primary Theme: awesome-design-md/meta (Google Stitch DESIGN.md specification) | Micro-Adaptation: astryx/shape-relationships + control-rhythm + system-states`

## 1. Visual System & Provenance
- **Primary Theme (`awesome-design-md/meta` — Google Stitch `DESIGN.md`)**:
  - **Surfaces & Ink**: Stark white canvas (`#ffffff`), Soft Cloud secondary surfaces (`#f1f4f7`), Deep Ink (`#0a1317`) and standard Ink (`#1c1e21`) text, Steel (`#5d6c7b`) captions, Hairline (`#ced0d4`) inputs, and Hairline Soft (`#dee3e9`) card dividers.
  - **Two-Tier Pill CTA Architecture (`rounded.full: 100px`)**:
    - Marketing & Hero CTAs use **Black Pill (`#000000` fill, `#ffffff` text)** paired with **Secondary Outlined Pill (`2px solid #0a1317`)**.
    - Right-Rail Configurator / Conversion Summary Panel uses **Cobalt Primary Pill (`#0064e0` -> `#0457cb` pressed)** exclusively inside the conversion action rail.
    - Top category/preset switcher uses **`button-pill-tab`** (`#ffffff` border `#ced0d4` inactive -> `#0a1317` fill `#ffffff` text active).
  - **Three-Tier Typographic Rhythm (`Optimistic VF` / Geometric Humanist Sans)**:
    - `500` weight Display Headlines (`ss01, ss02`) -> `300` light weight Editorial Subheads (`28px / 1.21`) -> `400` Body (`16px / 1.50 / -0.16px`) -> `700` Bold Pill Controls (`14px / 1.43 / -0.14px`).
  - **58% / 42% PDP Configurator Split**:
    - Left `58%`: `32px` (`rounded.xxxl`) showcase gallery housing the interactive 2D stitch wireframe artboard, circular `32px` (`rounded.circle`) thread color swatches, and dropzone.
    - Right `42%`: Sticky summary rail (`rounded.xl: 16px`, subtle elevation `rgba(20, 22, 26, 0.3) 0px 1px 4px 0px`) presenting binary header telemetry, hoop fit verification, and the Cobalt `#0064e0` conversion CTA to `https://imagetopes.com`.
- **Cross-Skill Micro-Adaptations (`meta/astryx`)**:
  - **Concentric Shape Relationships (`astryx/references/shape-relationships.md`)**: Outer `32px` (`rounded.xxxl`) gallery container with `16px` (`spacing.base`) padding encloses a concentric `16px` (`rounded.xl`) wireframe viewport (`32px - 16px = 16px`).
  - **Mixed-Control Rhythm (`astryx/references/control-rhythm.md`)**: Pill tabs, circular `40px` icon controls, and primary/secondary pill buttons share a unified baseline and `40px–44px` operable target height.
  - **Non-Color Semantic System States (`astryx/references/system-states.md`)**: Hoop compatibility and image-drop conversion gates pair semantic tokens (`#31a24c` success, `#f2a918` attention) with explicit icons (`✓`, `▲`, `→`) and structured labels.
