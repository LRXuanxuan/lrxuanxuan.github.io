'use strict';
const assert = require('node:assert/strict');
const core = require('../assets/color-block-studio/study-core.js');
let passed = 0;
function test(name, fn) { fn(); passed++; console.log('PASS ' + name); }
const grayRGB = values => Uint8Array.from(values.flatMap(v => [v, v, v]));
const stroke = (tool, points, radius = 0.04) => ({tool, points, radius});

test('CIE neutral endpoints and standard middle gray, plus luminance order', () => {
  assert.equal(core.lightness(0,0,0), 0);
  assert.equal(core.lightness(255,255,255), 100);
  assert.ok(Math.abs(core.lightness(128,128,128) - 53.585) < 0.01);
  assert.ok(core.lightness(0,255,0) > core.lightness(255,0,0));
  assert.ok(core.lightness(255,0,0) > core.lightness(0,0,255));
});

test('Two/three/five value groups preserve a known neutral ramp', () => {
  const rgb = grayRGB([0,60,130,210,255]);
  assert.deepEqual([...core.valueIndices(rgb,5,1,2,35,72)], [0,0,1,1,1]);
  assert.deepEqual([...core.valueIndices(rgb,5,1,3,35,72)], [0,0,1,2,2]);
  assert.deepEqual([...core.valueIndices(rgb,5,1,5,35,72)], [0,1,2,3,4]);
});

test('Colored regions are grouped by linear luminance, not RGB mean', () => {
  // Equal RGB means; green is the lightest, blue darkest.
  const rgb = Uint8Array.from([255,0,0, 0,255,0, 0,0,255]);
  assert.deepEqual([...core.valueIndices(rgb,3,1,3,40,70)], [1,2,0]);
});

test('Crossed/equal/invalid thresholds normalize safely', () => {
  assert.deepEqual(core.valueThresholds(5,72,35), [17.5,35,72,86]);
  assert.deepEqual(core.valueThresholds(2,72,35), [72]);
  assert.deepEqual(core.valueThresholds(3,35,35), [35,35.5]);
  assert.deepEqual(core.valueThresholds(3,NaN,Infinity), [35,72]);
});

test('Output palettes are fresh ordered neutral objects', () => {
  for (const count of [2,3,5]) {
    const a = core.defaultValuePalette(count);
    assert.equal(a.length,count);
    a.forEach((p,i) => { assert.equal(p.r,p.g); assert.equal(p.g,p.b); assert.equal(p.mode,'normal'); if(i) assert.ok(p.r>a[i-1].r); });
    a[0].r = 99;
    assert.notEqual(core.defaultValuePalette(count)[0].r,99);
  }
});

test('Black masks use the same L* boundary as value assignment', () => {
  const rgb = grayRGB(Array.from({length:256}, (_,i)=>i));
  const groups = core.valueIndices(rgb,256,1,2,35,72);
  const mask = core.blackMask(rgb,256,1,35);
  for(let i=0;i<256;i++) assert.equal(mask[i], groups[i]===0 ? 0:255);
  assert.ok([...core.blackMask(rgb,256,1,0)].every(v=>v===255));
});

test('Color protection is optional and does not imply segmentation', () => {
  const rgb = Uint8Array.from([150,100,80, 20,20,20]);
  assert.deepEqual([...core.blackMask(rgb,2,1,70,false)], [0,0]);
  assert.deepEqual([...core.blackMask(rgb,2,1,70,true)], [255,0]);
});

test('Grayscale output round trips neutral byte values within one byte', () => {
  const values = Array.from({length:256},(_,i)=>i);
  const output = core.grayValues(grayRGB(values));
  output.forEach((v,i)=>assert.ok(Math.abs(v-i)<=1));
});

test('Nearest label scaling never creates new region labels', () => {
  const input = Uint8Array.from([1,7,3,9]);
  const output = core.resizeIndicesNearest(input,2,2,4,4);
  assert.deepEqual([...output], [1,1,7,7,1,1,7,7,3,3,9,9,3,3,9,9]);
  assert.deepEqual([...core.resizeIndicesNearest(output,4,4,2,2)], [...input]);
  output[0] = 99;
  assert.equal(input[0],1);
});

test('Single-point brush and sparse pointer segments paint continuously', () => {
  const base = new Uint8Array(21*21).fill(255);
  let out = core.applyStrokes(base,21,21,[stroke('black',[[0.5,0.5]])],'black');
  assert.equal(out[10*21+10],0);
  assert.equal(out[0],255);
  out = core.applyStrokes(base,21,21,[stroke('black',[[0,0.5],[1,0.5]])],'black');
  for(let x=0;x<21;x++) assert.equal(out[10*21+x],0);
  assert.ok([...base].every(v=>v===255));
});

test('Restore, white, and black honor stroke order without mutating candidates', () => {
  const base = new Uint8Array(21*21).fill(255);
  base[10*21+10] = 0;
  const remove = stroke('line-remove',[[0.5,0.5]],0.1);
  const keep = stroke('line-keep',[[0.5,0.5]],0.1);
  assert.equal(core.applyStrokes(base,21,21,[remove,keep],'line')[220],0);
  assert.equal(core.applyStrokes(base,21,21,[keep,remove],'line')[220],255);
  assert.equal(core.applyStrokes(base,21,21,[remove,stroke('erase',[[0.5,0.5]],0.1)],'line')[220],0);
  assert.equal(base[220],0);
});

test('Softening changes dark candidates but preserves paper and weaker gray', () => {
  const base = Uint8Array.from([0,100,200,255]);
  const out = core.applyStrokes(base,4,1,[stroke('line-soft',[[0,0],[1,0]],0.5)],'line');
  assert.deepEqual([...out],[160,160,200,255]);
});

test('Brush clips outside edges and scales radius with the image', () => {
  const base = new Uint8Array(100).fill(255);
  const out = core.applyStrokes(base,10,10,[stroke('black',[[-0.2,0.5],[1.2,0.5]],0.15)],'black');
  for(let x=0;x<10;x++) assert.equal(out[4*10+x],0);
  assert.equal(out.length,100);
  const scaled = core.applyStrokes(new Uint8Array(400).fill(255),20,20,[stroke('black',[[0.5,0.5]],0.1)],'black');
  const small = core.applyStrokes(base,10,10,[stroke('black',[[0.5,0.5]],0.1)],'black');
  assert.ok([...scaled].filter(v=>v===0).length > [...small].filter(v=>v===0).length);
});

test('Invalid stroke points do not join unrelated path segments', () => {
  const base = new Uint8Array(21).fill(255);
  const out = core.applyStrokes(base,21,1,[stroke('black',[[0,0],[NaN,0],[1,0]],0.01)],'black');
  assert.equal(out[0],0); assert.equal(out[20],0); assert.equal(out[10],255);
  assert.deepEqual([...core.applyStrokes(base,21,1,[stroke('unknown',[[0,0]])])],[...base]);
});

test('Invalid dimensions or truncated image buffers fail explicitly', () => {
  assert.throws(()=>core.valueIndices(new Uint8Array(3),2,1,3,35,72),RangeError);
  assert.throws(()=>core.resizeIndicesNearest(new Uint8Array(1),1,1,0,1),RangeError);
  assert.throws(()=>core.applyStrokes(new Uint8Array(1),2,1,[]),RangeError);
});

console.log(`${passed} meaningful core tests passed.`);
