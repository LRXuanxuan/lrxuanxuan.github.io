/* Focused DOM/native-Canvas checks for imported Riso palettes and fill materials.
 * Reuses the existing local harness; no browser or production dependency is added.
 * NODE_PATH=/path/to/test/node_modules:/path/to/runtime/node_modules node tools/test_drawing_riso.cjs
 */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const { File } = require('node:buffer');
const harnessFile = path.join(__dirname, 'test_drawing_app.cjs');
const source = fs.readFileSync(harnessFile, 'utf8'), boundary = source.indexOf('\nasync function main() {');
assert.ok(boundary > 0, 'Existing integration harness has an explicit suite boundary');
const harness = new Module(harnessFile, module); harness.filename = harnessFile; harness.paths = module.paths;
harness._compile(source.slice(0, boundary) + '\nmodule.exports = { openStudio, errors, native, pixel, pixels, hash, eventually };', harnessFile);
const { openStudio, errors, native, pixel, pixels, hash, eventually } = harness.exports;

// Independent source-file order, including Grey versus Gray and each set's repeats.
const SOURCE_ORDER = [
  ['risograph-master01', 'Black|Burgundy|Blue|Green|Medium Blue|Bright Red|Risofederal Blue|Purple|Teal|Flat Gold|Hunter Green|Red|Brown|Yellow|Marine Red|Orange|Fluorescent Pink|Light Gray|Flatallic Gold|Metallic Gold|Crimson|Fluorescent Orange|Cornflower|Sky Blue|Sea Blue|Lake|Indigo|Midnight|Mist|Granite'],
  ['risograph-master02', 'Charcoal|Smoky Teal|Steel|Slate|Turquoise|Emerald|Grass|Forest|Spruce|Moss|Sea Foam|Kelly Green|Light Teal|Ivy|Pine|Lagoon|Violet|Orchid|Plum|Raisin|Grape|Scarlet|Tomato|Cranberry|Maroon|Raspberry Red|Brick|Light Lime|Sunflower|Melon'],
  ['risograph-master03', 'Apricot|Paprika|Pumpkin|Bright Olive Green|Bright Gold|Copper|Mahogany|Bisque|Bubble Gum|Light Mauve|Dark Mauve|Wine|Gray|Coral|White|Aqua|Mint|Fluorescent Yellow|Fluorescent Red|Fluorescent Green'],
  ['risograph-north-american', 'Black|Fluorescent Pink|Yellow|Blue|Bright Red|Kelly Green|Orchid|Orange|Cornflower|Turquoise|Light Lime|Melon|Steel|Copper'],
  ['risograph-european', 'Aqua|Fluorescent Pink|Fluorescent Orange|Purple|Hunter Green|Crimson|Yellow|Grey|Medium Blue|Sunflower|Fluorescent Green|White|Flat Gold|Black'],
  ['risograph-japanese', 'Teal|Fluorescent Pink|Risofederal Blue|Red|Green|Sunflower|Violet|Mint|Coral|Burgundy|Yellow|Medium Blue|Brown|Black']
];
const MATERIALS = [
  ['干印', ['riso-sparse', 'riso-medium', 'riso-dense']],
  ['湿印', ['riso-wet-light', 'riso-wet-medium', 'riso-wet-dense']]
];
let dom, passed = 0;
async function test(name, fn) { await fn(); passed++; console.log('PASS ' + name); }
const alphaSum = data => data.reduce((sum, value, index) => sum + (index % 4 === 3 ? value : 0), 0);

async function main() {
  dom = await openStudio();
  const win = dom.window, doc = win.document, app = win.DrawingStudio;
  const el = id => { const field = doc.getElementById(id); assert.ok(field, id); return field; };
  const active = () => app.getLayer(app.inspect().activeId);
  function edit(id, value) {
    const field = el(id);
    if (field.type === 'checkbox') field.checked = value; else field.value = String(value);
    field.dispatchEvent(new win.Event('input', { bubbles: true }));
    field.dispatchEvent(new win.Event('change', { bubbles: true }));
  }
  const settled = () => eventually(() => !doc.body.classList.contains('busy'), 'Palette update finishes');
  function pointer(type, x, y) {
    const canvas = el('drawingCanvas'), rect = canvas.getBoundingClientRect();
    canvas.dispatchEvent(new win.PointerEvent(type, { bubbles: true, cancelable: true,
      pointerId: 87, pointerType: 'mouse', isPrimary: true, button: 0, buttons: type === 'pointerup' ? 0 : 1,
      clientX: rect.left + x / canvas.width * rect.width, clientY: rect.top + y / canvas.height * rect.height }));
  }
  function fillSelection() {
    pointer('pointerdown', 12, 12);
    for (const [x, y] of [[116, 12], [116, 84], [12, 84]]) pointer('pointermove', x, y);
    pointer('pointerup', 12, 84); app.render();
  }
  async function fresh(kind, transparent = true) {
    await app.newDocument({ width: 128, height: 96, title: 'Riso integration', paper: 'transparent' });
    app.setTool('fill');
    for (const [id, value] of Object.entries({ fillPaintMode: 'color', fillScope: 'lasso', fillOpacity: 100,
      materialKind: kind, materialFollowInk: false, materialForeground: '#d43224', materialBackground: '#2040e0',
      materialTransparent: transparent, materialThickness: 2, materialSpacing: 14 })) edit(id, value);
  }

  await test('Six Riso palettes retain source order, five columns, reference linkage and working swatches', async () => {
    const presets = win.DrawingPalettes.filter(p => p.id.startsWith('risograph-'));
    assert.deepEqual(Array.from(presets, p => p.swatches.length), [30, 30, 20, 14, 14, 14]);
    const image = native.createCanvas(12, 4), ctx = image.getContext('2d');
    ['#ff48b1', '#000000', '#ffffff'].forEach((color, i) => { ctx.fillStyle = color; ctx.fillRect(i * 4, 0, 4, 4); });
    await app.ref.load(new File([image.toBuffer('image/png')], 'riso-test.png', { type: 'image/png' }));
    el('previewPalette').click(); await settled();
    for (const [id, order] of SOURCE_ORDER) {
      const preset = presets.find(p => p.id === id); assert.ok(preset, id);
      assert.equal(preset.category, 'Risograph 孔版印刷');
      assert.deepEqual(Array.from(preset.swatches, s => s.officialName), order.split('|'), id);
      edit('palettePreset', id); await settled();
      assert.equal(el('referenceCopicPreset').value, id); assert.equal(app.ref.getInfo().paletteMethod, 'color');
      for (const layout of ['compact', 'grouped']) {
        doc.querySelector('[data-palette-layout="' + layout + '"]').click();
        for (const target of ['presetSwatches', 'referenceSwatches']) assert.equal(el(target).style.getPropertyValue('--palette-columns'), '5');
        const buttons = Array.from(el('presetSwatches').querySelectorAll('button'));
        assert.deepEqual(buttons.map(b => b.dataset.color), Array.from(preset.swatches, s => s.hex));
        assert.equal(buttons.length, order.split('|').length);
        buttons.forEach((button, i) => {
          assert.ok(button.title.includes(preset.swatches[i].officialName)); button.click();
          assert.equal(el('inkColor').value, preset.swatches[i].hex); assert.equal(button.getAttribute('aria-pressed'), 'true');
        });
      }
    }
  });

  await test('All six materials expose the matching ink and grain controls', async () => {
    app.setTool('fill');
    for (const [label, kinds] of MATERIALS) for (const kind of kinds) {
      edit('materialKind', kind); assert.equal(el('materialKind').value, kind);
      assert.equal(el('materialName').textContent, el('materialKind').selectedOptions[0].textContent);
      assert.equal(el('materialFrontLabel').textContent, '油墨颜色');
      assert.equal(el('materialThicknessLabel').textContent, '颗粒大小');
      assert.equal(el('materialSpacingLabel').textContent, '颗粒间距（越小越密）');
      assert.equal(el('materialThickness').getAttribute('aria-label'), label + '颗粒大小');
      assert.ok(el('materialHint').textContent.includes('三档' + label));
      assert.equal(el('materialPatternOptions').hidden, false); assert.equal(el('materialAngleField').hidden, true);
    }
    edit('materialKind', 'horizontal'); assert.equal(el('materialThicknessLabel').textContent, '线宽 / 点径');
  });

  for (const [label, kinds] of MATERIALS) await test(label + ' lasso fill increases coverage and survives undo, redo and project restoration', async () => {
    const amounts = [];
    for (const kind of kinds) {
      await fresh(kind); const blank = hash(pixels(active().canvas)), history = app.inspect().history;
      fillSelection(); const painted = pixels(active().canvas), after = hash(painted), amount = alphaSum(painted);
      assert.ok(amount > 0 && amount < 104 * 72 * 255, 'Texture deposits partial ink coverage: ' + kind);
      assert.equal(pixel(active().canvas, 4, 4)[3], 0, 'Lasso exterior remains transparent');
      assert.equal(app.inspect().history, history + 1); amounts.push(amount);
      app.undo(); assert.equal(hash(pixels(active().canvas)), blank);
      app.redo(); assert.equal(hash(pixels(active().canvas)), after);
      const project = await app.serializeProject();
      assert.equal(project.settings.marks.materialKind, kind);
      await app.newDocument({ width: 64, height: 64, paper: 'transparent' });
      await app.loadProject(project); app.render();
      assert.equal(hash(pixels(active().canvas)), after, 'Saved material pixels are retained');
      assert.equal(el('materialKind').value, kind); assert.equal(el('materialTransparent').checked, true);
      assert.equal(el('materialForeground').value, '#d43224'); assert.equal(el('materialBackground').value, '#2040e0');
      assert.equal(el('materialThickness').value, '2'); assert.equal(el('materialSpacing').value, '14');
    }
    assert.ok(amounts[0] < amounts[1] && amounts[1] < amounts[2], label + ' actual coverage increases: ' + amounts.join(', '));
  });

  await test('Opaque backgrounds fill only the lasso and blend the selected ink over the selected background', async () => {
    const foreground = [212, 50, 36], background = [32, 64, 224];
    for (const kind of ['riso-medium', 'riso-wet-medium']) {
      await fresh(kind); fillSelection(); const transparent = pixels(active().canvas);
      await fresh(kind, false); fillSelection(); const opaque = pixels(active().canvas);
      assert.equal(pixel(active().canvas, 4, 4)[3], 0);
      let translucent = 0;
      for (let y = 16; y < 80; y += 7) for (let x = 16; x < 112; x += 7) {
        const offset = (y * 128 + x) * 4, alpha = transparent[offset + 3] / 255;
        if (alpha < 1) translucent++;
        assert.equal(opaque[offset + 3], 255, 'Explicit background removes internal transparency');
        for (let channel = 0; channel < 3; channel++) {
          const expected = foreground[channel] * alpha + background[channel] * (1 - alpha);
          assert.ok(Math.abs(opaque[offset + channel] - expected) <= 2, kind + ' uses the requested background color');
        }
      }
      assert.ok(translucent > 0, 'Medium ink has visible background contribution');
    }
  });

  assert.deepEqual(errors, [], 'No DOM runtime errors');
  console.log(`Riso integration: ${passed}/${passed} checks passed.`);
}
main().then(() => dom?.window.close()).catch(error => {
  console.error(error); dom?.window.close(); process.exitCode = 1;
});
