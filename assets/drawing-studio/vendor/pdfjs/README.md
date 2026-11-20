# PDF.js 6.5.438 — local reference rendering

This directory contains only the PDF.js runtime used by the drawing studio's
PDF reference panel. All files are served from this site's own origin. The
drawing page must load **none** of these resources until the user chooses a PDF.
The selected PDF is read as a local `Uint8Array`; its contents are never uploaded.

## Source and version

- Project: <https://github.com/mozilla/pdf.js>
- Official release: <https://github.com/mozilla/pdf.js/releases/tag/v6.5.438>
- Official distribution guide: <https://mozilla.github.io/pdf.js/getting_started/>
- Downloaded package: <https://registry.npmjs.org/pdfjs-dist/-/pdfjs-dist-6.5.438.tgz>
- Package version: **6.5.438**, published 2026-11-01; copied 2026-11-20.
- The downloaded archive's SHA-512 was verified against the npm registry's
  version metadata before extraction:

  `sha512-vg8Pw1x+AFKy4AMDvhuWl5cOYV8d698UoEANoFFhc79hqXDnZQqnOXoxw3HG907WHOg1JYOvLhP756boddFxpA==`

`pdf.mjs` is the unmodified `legacy/build/pdf.min.mjs`, and `pdf.worker.mjs` is
the unmodified `legacy/build/pdf.worker.min.mjs`. Only their filenames changed.
Both use the same version. The legacy build supplies compatibility code for
recent JavaScript features at a cost of about 119 KB over the modern minified
pair; the browser still needs ES modules and module workers.

## Included size

Bytes below are uncompressed file sizes, including the relevant license files.

| Component | Files | Bytes | Loading |
| --- | ---: | ---: | --- |
| Main module, worker, root license | 3 | 1,875,534 | Only after PDF import |
| `cmaps/` | 169 | 1,167,747 | Only character maps required by a document |
| `standard_fonts/` | 16 | 798,046 | Only fallback fonts required by a document |
| `wasm/` | 13 | 913,150 | Only image/color decoders required by a document |
| `iccs/` | 2 | 15,017 | Only color profile required by a document |
| **Total** | **203** | **4,769,494** | **0 PDF bytes on the drawing page's initial load** |

The directory deliberately excludes the stock viewer, example PDFs, source
maps, type declarations, WebGPU renderer worker, and QuickJS document-scripting
runtime. Ordinary image reference loading and all painting tools have no PDF.js
dependency. Only the current PDF page is rendered, at a bounded reference
resolution; page changes cancel stale renders and release the old page.

## Integration

Lazy-import `./pdf.mjs` and set `GlobalWorkerOptions.workerSrc` to the same-origin
`./pdf.worker.mjs`. Supply these document options with a trailing slash on each
resource URL:

```js
{
  data: localPdfBytes,
  cMapUrl: base + 'cmaps/',
  cMapPacked: true,
  standardFontDataUrl: base + 'standard_fonts/',
  wasmUrl: base + 'wasm/',
  iccUrl: base + 'iccs/',
  disableWorkerRendering: true,
  enableXfa: false
}
```

`base` is `/assets/drawing-studio/vendor/pdfjs/`. The integration renders pages
to a canvas only: do not instantiate the stock viewer, scripting manager,
annotation/link layers, or execute document actions. PDF actions and external
links must not be opened automatically. The removed historical
`isEvalSupported` option is not a substitute for this integration rule in 6.x.

No CDN, online PDF conversion, viewer service, or document upload is needed.
PDF import needs these static runtime files to be reachable (or already cached);
this is local processing, not a guarantee that a never-loaded page works offline.

## Integrity and licensing

- `pdf.mjs` SHA-256:
  `522ad2c83bc8a0010e7f0cc60d0892b77c8d2bf2c9702dc12288311d94270f42`
- `pdf.worker.mjs` SHA-256:
  `b4c8353ded0d88d2e2009574a29eb4e0c3ff7e942ecdf51ef5f71566a9667f31`

The full upstream Apache 2.0 license is retained in `LICENSE`. Character maps,
font files, ICC profiles, WebAssembly modules, and decoder fallbacks retain their
upstream license files in their respective directories. Do not remove their
copyright notices or upgrade one half of the main-module/worker pair alone.
