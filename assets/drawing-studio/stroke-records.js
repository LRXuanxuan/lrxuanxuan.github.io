/* Bounded, local-only stroke provenance. Immutable sparse tiles, no bitmap inference. */
(function (root, factory) {
  'use strict';
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.DrawingStrokeRecords = api;
})(typeof window !== 'undefined' ? window : typeof self !== 'undefined' ? self : null, function () {
  'use strict';
  const TILE = 64, MAX_BYTES = 16 * 1024 * 1024, MAX_OPERATIONS = 128;
  const scratch = new WeakMap(), blobs = new WeakMap(), bundles = new WeakMap();
  let sequence = 0;
  const ctx = c => c.getContext('2d', { willReadFrequently: true });
  const key = (x, y) => x + ',' + y;
  function makeCanvas(target, w, h) {
    const c = target.ownerDocument ? target.ownerDocument.createElement('canvas')
      : typeof OffscreenCanvas !== 'undefined' ? new OffscreenCanvas(w, h) : new target.constructor(w, h);
    c.width = w; c.height = h; return c;
  }
  function workCanvas(target) {
    let work = scratch.get(target);
    if (!work) { work = { tile: makeCanvas(target, TILE, TILE), source: makeCanvas(target, TILE, TILE) }; scratch.set(target, work); }
    return work;
  }
  function patch(c, x, y, width, height) { return { x, y, width, height, image: ctx(c).getImageData(x, y, width, height) }; }
  function bytes(states, seen = new Set(), includeSerialized = false) {
    let total = 0;
    for (const state of states) if (state) {
      const add = p => {
        if (!seen.has(p.image.data.buffer)) { seen.add(p.image.data.buffer); total += p.image.data.byteLength; }
        const blob = includeSerialized && blobs.get(p);
        if (blob && !seen.has(blob)) { seen.add(blob); total += blob.size; }
      };
      state.base.forEach(add); state.operations.forEach(op => op.tiles.forEach(add));
    }
    return total;
  }
  function count(state) { return state ? state.operations.reduce((n, op) => n + (op.kind === 'stroke'), 0) : 0; }
  function clean(state) {
    if (!state || !count(state)) return null;
    const used = new Set(); state.operations.forEach(op => op.tiles.forEach((p, k) => used.add(k)));
    const base = new Map(); state.base.forEach((p, k) => { if (used.has(k)) base.set(k, p); });
    return { ...state, base };
  }
  function append(state, target, source, bounds, options) {
    if (options.kind !== 'stroke' && !count(state)) return null;
    if (state && (state.width !== target.width || state.height !== target.height)) state = null;
    const base = new Map(state ? state.base : []), tiles = new Map();
    const left = Math.max(0, Math.floor(bounds.x / TILE) * TILE), top = Math.max(0, Math.floor(bounds.y / TILE) * TILE);
    const right = Math.min(target.width, bounds.x + bounds.width), bottom = Math.min(target.height, bounds.y + bounds.height);
    let allocated = 0;
    for (let y = top; y < bottom; y += TILE) for (let x = left; x < right; x += TILE) {
      const width = Math.min(TILE, target.width - x), height = Math.min(TILE, target.height - y), p = patch(source, x, y, width, height);
      let inked = false;
      for (let i = 3; i < p.image.data.length; i += 4) if (p.image.data[i]) { inked = true; break; }
      if (!inked) continue;
      allocated += p.image.data.byteLength;
      // A single exceptionally large mark becomes ordinary pixels. Never grow
      // a full-canvas provenance copy beyond the explicit live budget.
      if (allocated > MAX_BYTES) return null;
      const k = key(x, y); tiles.set(k, p);
      if (!base.has(k)) base.set(k, patch(target, x, y, width, height));
    }
    if (!tiles.size) return state;
    const order = ++sequence;
    const op = { id: options.id || 's' + order, kind: options.kind, opacity: options.opacity, order, tiles };
    return { width: target.width, height: target.height, base, operations: [...(state ? state.operations : []), op] };
  }
  function renderTile(state, k, target, operations = state.operations) {
    const base = state.base.get(k); if (!base) return null;
    const work = workCanvas(target), paint = ctx(work.tile), source = ctx(work.source);
    paint.setTransform(1, 0, 0, 1, 0, 0); paint.globalAlpha = 1; paint.globalCompositeOperation = 'source-over';
    paint.clearRect(0, 0, TILE, TILE); paint.putImageData(base.image, 0, 0);
    for (const op of operations) {
      const p = op.tiles.get(k); if (!p) continue;
      source.clearRect(0, 0, TILE, TILE); source.putImageData(p.image, 0, 0);
      paint.globalAlpha = op.opacity; paint.globalCompositeOperation = op.kind === 'erase' ? 'destination-out' : 'source-over';
      paint.drawImage(work.source, 0, 0);
    }
    paint.globalAlpha = 1; paint.globalCompositeOperation = 'source-over';
    return { ...base, image: paint.getImageData(0, 0, base.width, base.height) };
  }
  function render(state, target, keys) {
    if (!state) return;
    const paint = ctx(target);
    for (const k of keys || state.base.keys()) { const p = renderTile(state, k, target); if (p) paint.putImageData(p.image, p.x, p.y); }
  }
  function bakeOldest(state, target) {
    if (!state || !state.operations.length) return null;
    const first = state.operations[0], base = new Map(state.base);
    for (const k of first.tiles.keys()) base.set(k, renderTile(state, k, target, [first]));
    return clean({ ...state, base, operations: state.operations.slice(1) });
  }
  function limit(layers) {
    let retired = false;
    for (const layer of layers) while (layer.strokeRecords && layer.strokeRecords.operations.length > MAX_OPERATIONS) {
      layer.strokeRecords = bakeOldest(layer.strokeRecords, layer.canvas); retired = true;
    }
    // Copies share immutable buffers in memory, but the portable project stores
    // each layer independently. Reserve their decoded size separately so an
    // artwork we export is always within the same limit when reopened.
    while (layers.reduce((n, layer) => n + bytes([layer.strokeRecords]), 0) > MAX_BYTES) {
      const oldest = layers.filter(layer => layer.strokeRecords).sort((a, b) => a.strokeRecords.operations[0].order - b.strokeRecords.operations[0].order)[0];
      if (!oldest) break;
      oldest.strokeRecords = bakeOldest(oldest.strokeRecords, oldest.canvas); retired = true;
    }
    return retired;
  }
  function alpha(op, k, x, y) {
    const p = op.tiles.get(k); return p ? p.image.data[((y - p.y) * p.width + x - p.x) * 4 + 3] / 255 * op.opacity : 0;
  }
  function hit(state, x, y, radius) {
    if (!state) return null;
    radius = Math.max(.75, radius); const rr = radius * radius;
    for (let index = state.operations.length - 1; index >= 0; index--) {
      const op = state.operations[index]; if (op.kind !== 'stroke') continue;
      for (const [k, p] of op.tiles) {
        const left = Math.max(p.x, Math.floor(x - radius)), right = Math.min(p.x + p.width - 1, Math.ceil(x + radius));
        const top = Math.max(p.y, Math.floor(y - radius)), bottom = Math.min(p.y + p.height - 1, Math.ceil(y + radius));
        if (right < left || bottom < top) continue;
        for (let py = top; py <= bottom; py++) for (let px = left; px <= right; px++) {
          if ((px + .5 - x) ** 2 + (py + .5 - y) ** 2 > rr) continue;
          let visible = alpha(op, k, px, py); if (!visible) continue;
          // Later local erasures and overlays reduce the surviving contribution.
          // A stroke fully erased locally has no hit area left to select.
          for (let later = index + 1; later < state.operations.length && visible > .5 / 255; later++) visible *= 1 - alpha(state.operations[later], k, px, py);
          if (visible > .5 / 255) return op.id;
        }
      }
    }
    return null;
  }
  function remove(state, ids) {
    const keys = new Set(), operations = [];
    for (const op of state.operations) {
      if (op.kind === 'stroke' && ids.has(op.id)) op.tiles.forEach((p, k) => keys.add(k));
      else operations.push(op);
    }
    return { state: { ...state, operations }, keys };
  }
  function capture(state, target, keys) {
    const result = [];
    for (const k of keys) { const p = state.base.get(k); if (p) result.push(patch(target, p.x, p.y, p.width, p.height)); }
    return result;
  }
  function exportBundle(state) {
    if (!state) return null;
    if (bundles.has(state)) return bundles.get(state);
    const patches = [], indices = new Map();
    const index = p => {
      if (indices.has(p)) return indices.get(p);
      let data = blobs.get(p);
      if (!data) { data = new Blob([p.image.data], { type: 'application/octet-stream' }); blobs.set(p, data); }
      const i = patches.length; indices.set(p, i); patches.push({ x: p.x, y: p.y, width: p.width, height: p.height, data }); return i;
    };
    const bundle = { version: 1, width: state.width, height: state.height, base: Array.from(state.base.values(), index),
      operations: state.operations.map(op => ({ id: op.id, kind: op.kind, opacity: op.opacity, patches: Array.from(op.tiles.values(), index) })), patches };
    bundles.set(state, bundle); return bundle;
  }
  async function importBundle(bundle, target, decodeBlob, readBlob) {
    if (bundle == null) return null;
    const invalid = () => new Error('工程中的整笔记录无效或超过轻量限额。');
    if (!bundle || bundle.version !== 1 || bundle.width !== target.width || bundle.height !== target.height || !Array.isArray(bundle.base)
      || !Array.isArray(bundle.operations) || !bundle.operations.length || bundle.operations.length > MAX_OPERATIONS || !Array.isArray(bundle.patches) || bundle.patches.length > 12000) throw invalid();
    let total = 0; const patches = [];
    for (const input of bundle.patches) {
      if (!input || ![input.x, input.y, input.width, input.height].every(Number.isSafeInteger) || input.x < 0 || input.y < 0 || input.x >= target.width || input.y >= target.height
        || input.x % TILE || input.y % TILE || input.width !== Math.min(TILE, target.width - input.x) || input.height !== Math.min(TILE, target.height - input.y)) throw invalid();
      total += input.width * input.height * 4; if (total > MAX_BYTES) throw invalid();
      const expectedBytes = input.width * input.height * 4;
      // Reject an oversized encoded tile before atob / Blob allocation. The
      // enclosing project's much larger image limit is inappropriate here.
      if (input.data instanceof Blob ? input.data.size !== expectedBytes
        : !input.data || typeof input.data.$blob !== 'string' || input.data.$blob.length > Math.ceil(expectedBytes / 3) * 4 + 100) throw invalid();
      const blob = decodeBlob(input.data, 'application/octet-stream');
      if (blob.size !== input.width * input.height * 4) throw invalid();
      const data = new Uint8ClampedArray(await readBlob(blob)), image = ctx(target).createImageData(input.width, input.height);
      image.data.set(data); patches.push({ x: input.x, y: input.y, width: input.width, height: input.height, image });
    }
    const map = list => {
      if (!Array.isArray(list) || list.length > patches.length) throw invalid();
      const out = new Map();
      for (const i of list) {
        if (!Number.isSafeInteger(i) || i < 0 || i >= patches.length) throw invalid();
        const p = patches[i], k = key(p.x, p.y); if (out.has(k)) throw invalid(); out.set(k, p);
      }
      return out;
    };
    const base = map(bundle.base), ids = new Set(), operations = bundle.operations.map(input => {
      if (!input || !['stroke', 'erase', 'overlay'].includes(input.kind) || typeof input.id !== 'string' || !input.id || input.id.length > 100 || ids.has(input.id)
        || typeof input.opacity !== 'number' || !Number.isFinite(input.opacity) || input.opacity <= 0 || input.opacity > 1) throw invalid();
      ids.add(input.id); const tiles = map(input.patches);
      if (!tiles.size || Array.from(tiles.keys()).some(k => !base.has(k))) throw invalid();
      return { id: input.id, kind: input.kind, opacity: input.opacity, order: ++sequence, tiles };
    });
    const state = clean({ width: target.width, height: target.height, base, operations });
    if (!state) return null;
    // Validate before the app swaps artworks. Compare premultiplied channels,
    // allowing only the one-byte PNG/Canvas rounding at transparent edges.
    for (const [k, p] of state.base) {
      const actual = ctx(target).getImageData(p.x, p.y, p.width, p.height).data, expected = renderTile(state, k, target).image.data;
      for (let i = 0; i < actual.length; i += 4) {
        if (Math.abs(actual[i + 3] - expected[i + 3]) > 1) throw invalid();
        for (let c = 0; c < 3; c++) if (Math.abs(actual[i + c] * actual[i + 3] - expected[i + c] * expected[i + 3]) > 510) throw invalid();
      }
    }
    return state;
  }
  return { TILE, MAX_BYTES, MAX_OPERATIONS, append, bytes, count, clean, render, limit, hit, remove, capture, exportBundle, importBundle };
});
