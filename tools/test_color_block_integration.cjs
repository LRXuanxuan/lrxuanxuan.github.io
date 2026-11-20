/* Code-level DOM/canvas integration tests. This does not launch or control a browser. */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const {JSDOM, ResourceLoader, VirtualConsole} = require('jsdom');
const native = require('@napi-rs/canvas');
const ROOT = path.resolve(__dirname, '..');
const errors = [];
const canvases = new WeakMap();
let passed = 0;

function ensureCanvas(element) {
  let entry = canvases.get(element);
  if (!entry) {
    entry = {canvas:native.createCanvas(Math.max(1,element.width),Math.max(1,element.height))};
    canvases.set(element,entry);
  }
  return entry;
}
function nativeSource(source) {
  return source && source.tagName === 'CANVAS' ? ensureCanvas(source).canvas : source;
}

class LocalResources extends ResourceLoader {
  fetch(url) {
    const u = new URL(url);
    if (u.hostname !== 'color-study.test') throw new Error('Unexpected external dependency: ' + u.hostname);
    const file = path.resolve(ROOT, '.' + decodeURIComponent(u.pathname));
    if (!file.startsWith(ROOT + '/')) throw new Error('Out-of-project resource request');
    const promise = fs.existsSync(file) ? Promise.resolve(fs.readFileSync(file)) : Promise.reject(new Error('Missing local resource ' + file));
    promise.abort = () => {};
    return promise;
  }
}

function installShims(win) {
  win.matchMedia = query => ({matches:false,media:query,addEventListener(){},removeEventListener(){},addListener(){},removeListener(){}});
  win.ResizeObserver = class { observe(){} disconnect(){} unobserve(){} };
  const blobs=new Map();let blobId=0;
  win.URL.createObjectURL = blob => { const url='blob:test-'+(++blobId);blobs.set(url,blob);return url; };
  win.URL.revokeObjectURL = url => blobs.delete(url);
  win.TextEncoder=TextEncoder;win.TextDecoder=TextDecoder;
  win.fetch=async value=>{
    assert.ok(typeof value==='string' && value.startsWith('data:image/'),'Harness only permits data-image fetch');
    const split=value.indexOf(','),type=value.slice(5,value.indexOf(';'));
    return {blob:async()=>new win.Blob([Buffer.from(value.slice(split+1),'base64')],{type})};
  };
  win.scrollTo = () => {};
  win.ImageData = native.ImageData;
  win.Path2D = native.Path2D;
  win.Image = class extends native.Image {
    set src(value) {
      if(typeof value==='string' && value.startsWith('blob:test-')){
        const fr=new win.FileReader();
        fr.onload=()=>Object.getOwnPropertyDescriptor(native.Image.prototype,'src').set.call(this,Buffer.from(fr.result));
        fr.onerror=error=>{if(this.onerror)this.onerror(error);};
        fr.readAsArrayBuffer(blobs.get(value));return;
      }
      if (typeof value === 'string' && value.startsWith('/assets/')) value = fs.readFileSync(path.join(ROOT,value));
      else if (typeof value === 'string' && value.startsWith('https://color-study.test/')) value = fs.readFileSync(path.join(ROOT,new URL(value).pathname));
      super.src = value;
    }
    get src() { return super.src; }
  };
  const proto = win.HTMLCanvasElement.prototype;
  for (const prop of ['width','height']) {
    const desc = Object.getOwnPropertyDescriptor(proto,prop);
    Object.defineProperty(proto,prop,{
      configurable:true, enumerable:true,
      get(){return desc.get.call(this);},
      set(value){desc.set.call(this,value); const e=canvases.get(this); if(e)e.canvas[prop]=Math.max(1,desc.get.call(this));}
    });
  }
  proto.getContext = function(type) {
    if(type!=='2d')return null;
    const entry=ensureCanvas(this), element=this;
    if(!entry.context) {
      const ctx=entry.canvas.getContext('2d');
      entry.context = new Proxy(ctx,{
        get(target,key){
          if(key==='canvas')return element;
          if(key==='drawImage')return (source,...args)=>target.drawImage(nativeSource(source),...args);
          if(key==='createPattern')return (source,...args)=>target.createPattern(nativeSource(source),...args);
          const value=Reflect.get(target,key,target);
          return typeof value==='function' ? value.bind(target) : value;
        },
        set(target,key,value){return Reflect.set(target,key,value,target);}
      });
    }
    return entry.context;
  };
  proto.toDataURL = function(type='image/png',quality){return ensureCanvas(this).canvas.toDataURL(type,quality);};
  proto.toBlob = function(callback,type='image/png'){
    const blob=new win.Blob([ensureCanvas(this).canvas.toBuffer(type)],{type});
    win.setTimeout(()=>callback(blob),0);
  };
  const originalRect=win.HTMLElement.prototype.getBoundingClientRect;
  win.HTMLElement.prototype.getBoundingClientRect=function(){
    if(this.id==='viewer'){
      const width=win.document.body.classList.contains('study-sidebar-collapsed')?1320:1000;
      return {x:0,y:0,left:0,top:0,width,height:760,right:width,bottom:760,toJSON(){}};
    }
    if(this.id==='canvasWrap'){
      const width=parseFloat(this.style.width)||640,height=parseFloat(this.style.height)||480;
      return {x:0,y:0,left:0,top:0,width,height,right:width,bottom:height,toJSON(){}};
    }
    return originalRect.call(this);
  };
  Object.defineProperty(win.HTMLElement.prototype,'clientWidth',{get(){return this.id==='viewer'?(win.document.body.classList.contains('study-sidebar-collapsed')?1320:1000):(parseInt(this.style.width)||0);}});
  Object.defineProperty(win.HTMLElement.prototype,'clientHeight',{get(){return this.id==='viewer'?760:(parseInt(this.style.height)||0);}});
  win.addEventListener('error',event=>errors.push(event.error?.stack || event.message));
  win.addEventListener('unhandledrejection',event=>errors.push(String(event.reason)));
}

function synthetic(w=256,h=192) {
  const canvas=native.createCanvas(w,h),ctx=canvas.getContext('2d');
  const colors=['#141c28','#d34d38','#2b66a0','#e5cb58','#717b83','#eae7de','#a5b7ce','#383a3b'];
  for(let y=0;y<2;y++)for(let x=0;x<4;x++){
    ctx.fillStyle=colors[y*4+x]; ctx.fillRect(x*w/4,y*h/2,w/4,h/2);
  }
  return canvas.toDataURL('image/png');
}

const hash = data => crypto.createHash('sha256').update(data).digest('hex');
function canvasPixels(c){return Buffer.from(c.getContext('2d').getImageData(0,0,c.width,c.height).data);}
async function decodePNG(value){
  const img=await native.loadImage(value.startsWith?.('data:')?value:Buffer.from(value,'base64'));
  const c=native.createCanvas(img.width,img.height);c.getContext('2d').drawImage(img,0,0);
  return {w:img.width,h:img.height,pixels:canvasPixels(c)};
}
function storedZipImages(encoded){
  const bytes=Buffer.from(encoded,'base64'),images=[];let offset=0;
  while(offset+30<=bytes.length && bytes.readUInt32LE(offset)===0x04034b50){
    assert.equal(bytes.readUInt16LE(offset+8),0,'Expected the app\'s uncompressed ZIP entries');
    const size=bytes.readUInt32LE(offset+18),nameSize=bytes.readUInt16LE(offset+26),extra=bytes.readUInt16LE(offset+28);
    const name=bytes.toString('utf8',offset+30,offset+30+nameSize),start=offset+30+nameSize+extra;
    if(name.endsWith('.png'))images.push({name,data:bytes.subarray(start,start+size)});
    offset=start+size;
  }
  return images;
}
async function test(name,fn){await fn(); passed++; console.log('PASS '+name);}
const timeout = (promise,ms=10000) => Promise.race([promise,new Promise((_,reject)=>setTimeout(()=>reject(new Error('Timed out after '+ms+'ms')),ms).unref())]);

async function main(){
  const vc=new VirtualConsole();
  vc.on('jsdomError',err=>errors.push(err.stack||String(err)));
  const dom=new JSDOM(fs.readFileSync(path.join(ROOT,'color-block-studio.html'),'utf8'),{
    url:'https://color-study.test/color-block-studio.html',runScripts:'dangerously',resources:new LocalResources(),
    pretendToBeVisual:true,beforeParse:installShims,virtualConsole:vc
  });
  const win=dom.window,doc=win.document;
  await timeout(new Promise(resolve=>win.addEventListener('load',resolve,{once:true})));
  if(errors.length)throw new Error('Startup script errors:\n'+errors.join('\n'));
  const app=win.__APP;
  assert.ok(app?.studyState && app?.studyTest,'Educational layer must be integrated in HTML');
  const api=app.studyTest;
  const getIndices=()=>Array.from(api.indices?api.indices():app.studyState().indices);
  const pixels=()=>canvasPixels(doc.getElementById('resultCanvas'));
  const click=id=>{const e=doc.getElementById(id);assert.ok(e,'Missing '+id); e.click();};
  const snap=()=>JSON.parse(JSON.stringify(app.getState()));
  async function load(){
    api.setMode('value');api.values(3,35,72);
    await timeout(app.loadDataURL(synthetic(),'synthetic.png'));
    app.setParams({blur:0,minRegion:0,smooth:0});
    api.settle();
  }

  await test('The local-image tool has no hosted reference-image or lesson dependencies',async()=>{
    assert.equal(win.ColorBlockLessons,undefined);
    assert.equal(typeof api.lesson,'undefined');
    assert.equal(doc.querySelectorAll('#lessonList,#lessonSteps,#lessonStarter,#lessonChange,[data-lesson-id],[data-lesson-step],img').length,0);
    assert.equal(doc.querySelectorAll('script[src*="lessons.js"]').length,0);
    const assets=fs.readdirSync(path.join(ROOT,'assets/color-block-studio'));
    assert.equal(assets.includes('lessons.js'),false);
    assert.deepEqual(assets.filter(name=>/\.(webp|jpe?g|png|gif)$/i.test(name)),[]);
    assert.equal(app.getState().ready,false,'The tool must wait for a local image');
  });

  await test('HTML starts with three-value study and a real image renders',async()=>{
    assert.equal(app.studyState().mode,'value');assert.equal(app.studyState().levels,3);
    await load();
    assert.equal(app.getState().ready,true);
    assert.equal(app.getState().palette.length,3);
    assert.equal(new Set(getIndices()).size,3);
    assert.equal(pixels().length,256*192*4);
  });

  await test('Changing a locked palette changes colors without moving regions',async()=>{
    api.setMode('color');app.setParams({blur:0,minRegion:0,smooth:0});
    const initial=getIndices(),before=hash(pixels());
    const pal=Array.from(app.getState().palette).reverse();app.setPalette(pal);api.settle();
    assert.deepEqual(getIndices(),initial);
    assert.notEqual(hash(pixels()),before);
  });

  await test('Explicit regrouping changes regions and is independently undoable',async()=>{
    const before=getIndices(),beforePNG=hash(pixels());
    const beforeUndo=app.studyState().undo;
    api.remap();api.settle();
    const remapped=getIndices(),remapPNG=hash(pixels());
    assert.notDeepEqual(remapped,before);
    assert.ok(app.studyState().undo>beforeUndo,'Regrouping must create its own undo step');
    api.undo();assert.deepEqual(getIndices(),before);assert.equal(hash(pixels()),beforePNG);
    api.redo();assert.deepEqual(getIndices(),remapped);assert.equal(hash(pixels()),remapPNG);
  });

  await test('Mode changes retain custom palette and value thresholds',async()=>{
    const colorPalette=Array.from(app.getState().palette),colorIndices=getIndices();
    api.setMode('value');api.values(5,28,77);
    const valuePalette=Array.from(app.getState().palette);valuePalette[2]='#9f9f9f';app.setPalette(valuePalette);
    const expected=hash(pixels());
    api.setMode('color');assert.deepEqual(Array.from(app.getState().palette),colorPalette);assert.deepEqual(getIndices(),colorIndices);
    api.setMode('value');assert.equal(app.studyState().levels,5);assert.equal(app.studyState().dark,28);assert.equal(app.studyState().light,77);
    assert.deepEqual(Array.from(app.getState().palette),valuePalette);assert.equal(hash(pixels()),expected);
  });

  await test('A/B records a snapshot without mutating the current B state',async()=>{
    const aPixels=hash(pixels());click('saveAB');
    const pal=Array.from(app.getState().palette);pal[0]='#454545';app.setPalette(pal);api.settle();
    const bPixels=hash(pixels()),bPalette=Array.from(app.getState().palette);
    assert.notEqual(aPixels,bPixels);click('showAB');
    assert.equal(app.studyState().showA,true);
    assert.equal(doc.getElementById('studyOverlay').hidden,false);
    assert.equal(hash(canvasPixels(doc.getElementById('studyOverlay'))),aPixels);
    assert.equal(hash(pixels()),bPixels);assert.deepEqual(Array.from(app.getState().palette),bPalette);
    assert.equal(doc.getElementById('exportBtnTop').disabled,true);
    doc.dispatchEvent(new win.KeyboardEvent('keydown',{key:'s',ctrlKey:true,bubbles:true,cancelable:true}));
    assert.match(doc.getElementById('toast').textContent,/只读方案 A/,'Keyboard save must honor read-only A too');
    click('showAB');assert.equal(app.studyState().showA,false);assert.equal(doc.getElementById('exportBtnTop').disabled,false);
  });

  await test('Group isolation is a preview overlay and does not alter exported pixels',async()=>{
    const before=hash(pixels());
    const isolate=doc.getElementById('isolateGroup');isolate.checked=true;isolate.dispatchEvent(new win.Event('change',{bubbles:true}));
    assert.equal(doc.getElementById('studyOverlay').hidden,false);
    assert.equal(hash(pixels()),before);
    const png=await decodePNG(app.resultPNG());assert.equal(hash(png.pixels),before);
    isolate.checked=false;isolate.dispatchEvent(new win.Event('change',{bubbles:true}));
  });

  await test('Current PNG, saved block and original-size export agree on gray and alpha',async()=>{
    app.setPaletteMode(0,'clear');app.setPaletteMode(1,'white');api.settle();
    const current=await decodePNG(app.resultPNG());
    const saved=await app.saveTest({block:true});assert.equal(saved.count,1);
    const block=await decodePNG(saved.dataBase64),full=await app.fullResPNG(),fullImage=await decodePNG(full.dataURL);
    assert.equal(full.w,256);assert.equal(full.h,192);
    assert.deepEqual(block.pixels,current.pixels);assert.deepEqual(fullImage.pixels,current.pixels);
    let transparent=0;for(let i=0;i<current.pixels.length;i+=4){if(!current.pixels[i+3])transparent++;else{assert.equal(current.pixels[i],current.pixels[i+1]);assert.equal(current.pixels[i+1],current.pixels[i+2]);}}
    assert.ok(transparent>0,'Clear group must remain transparent in all exports');
  });

  await test('Color grayscale inspection changes only the diagnostic overlay',async()=>{
    api.setMode('color');
    const before=hash(pixels()),indices=getIndices();
    const toggle=doc.getElementById('studyColorGray');toggle.checked=true;toggle.dispatchEvent(new win.Event('change',{bubbles:true}));
    const overlay=doc.getElementById('studyOverlay');assert.equal(overlay.hidden,false);
    const gray=canvasPixels(overlay);
    for(let i=0;i<gray.length;i+=4){assert.equal(gray[i],gray[i+1]);assert.equal(gray[i+1],gray[i+2]);}
    assert.equal(hash(pixels()),before);assert.deepEqual(getIndices(),indices);
    assert.equal(hash((await decodePNG(app.resultPNG())).pixels),before);
    toggle.checked=false;toggle.dispatchEvent(new win.Event('change',{bubbles:true}));
  });

  await test('Merging two groups preserves all unrelated region positions and can be undone',async()=>{
    const before=getIndices(),palette=Array.from(app.getState().palette);
    doc.querySelector('#paletteGrid [data-i="0"]').click();
    doc.getElementById('studyMergeTarget').value='1';click('studyMerge');
    const after=getIndices();
    assert.equal(app.getState().palette.length,palette.length-1);
    assert.deepEqual(after,before.map(i=>i===0?0:i-1));
    api.undo();assert.deepEqual(getIndices(),before);assert.deepEqual(Array.from(app.getState().palette),palette);
  });

  await test('Black/white/restore brushes and undo preserve the threshold candidates',async()=>{
    api.setMode('black');app.setBlack({threshold:25,protectSkin:false});api.settle();
    const original=Buffer.from(pixels()),beforeUndo=app.studyState().undo;
    const point={radius:.05,points:[[.62,.25]]};
    const index=(Math.round(.25*191)*256+Math.round(.62*255))*4;
    assert.equal(original[index],255);
    api.stroke({...point,tool:'black'});assert.equal(pixels()[index],0);
    api.stroke({...point,tool:'white'});assert.equal(pixels()[index],255);
    api.undo();assert.equal(pixels()[index],0);
    api.redo();assert.equal(pixels()[index],255);
    api.stroke({...point,tool:'erase'});assert.equal(pixels()[index],original[index]);
    assert.ok(app.studyState().undo>beforeUndo);
    const recorded=hash(pixels());api.setMode('value');api.setMode('black');assert.equal(hash(pixels()),recorded);
    assert.equal(app.studyState().strokes.black.length,3);
  });

  await test('Line removal/keep/softening operate on candidates and survive switching',async()=>{
    api.setMode('line');app.setLineParams({amount:12,clean:0,width:1});api.settle();
    const before=Buffer.from(pixels());let pixel=-1;
    for(let p=0;p<before.length/4;p++)if(before[p*4]===0){pixel=p;break;}
    assert.ok(pixel>=0,'Synthetic grid must produce candidate lines');
    const point={radius:.02,points:[[(pixel%256)/255,Math.floor(pixel/256)/191]]};
    api.stroke({...point,tool:'line-remove'});assert.equal(pixels()[pixel*4],255);
    api.stroke({...point,tool:'line-keep'});assert.equal(pixels()[pixel*4],0);
    api.stroke({...point,tool:'line-soft'});assert.equal(pixels()[pixel*4],160);
    const expected=hash(pixels());api.setMode('color');api.setMode('line');assert.equal(hash(pixels()),expected);
    const save=await app.saveTest({line:true}),saved=await decodePNG(save.dataBase64);assert.equal(hash(saved.pixels),expected);
    const full=await app.fullResPNG(),fullPNG=await decodePNG(full.dataURL);assert.equal(hash(fullPNG.pixels),expected);
  });

  await test('Loading a new image resets history, comparisons and local brush strokes',async()=>{
    click('saveAB');await app.loadDataURL(synthetic(128,96),'second.png');
    const st=app.studyState();assert.equal(st.undo,0);assert.equal(st.redo,0);assert.equal(st.hasA,false);
    assert.equal(st.strokes.line.length,0);assert.equal(st.strokes.black.length,0);
  });

  await test('Larger-source export preserves region labels, transparency, and brush alignment',async()=>{
    api.setMode('value');api.values(3,35,72);
    await app.loadDataURL(synthetic(2100,300),'large-source.png');
    app.setParams({blur:0,minRegion:0,smooth:0});app.setPaletteMode(0,'clear');api.settle();
    const preview=Buffer.from(pixels()),state=snap();
    assert.equal(state.workW,2000);assert.ok(state.workH<state.naturalH);
    let full=await app.fullResPNG(),decoded=await decodePNG(full.dataURL);
    assert.equal(full.w,2100);assert.equal(full.h,300);
    function checkNearest(source,result,sourceW,sourceH,destW,destH){
      for(let y=0;y<destH;y++){
        const sy=Math.min(sourceH-1,Math.floor((y+.5)*sourceH/destH));
        for(let x=0;x<destW;x++){
          const sx=Math.min(sourceW-1,Math.floor((x+.5)*sourceW/destW));
          const si=(sy*sourceW+sx)*4,di=(y*destW+x)*4;
          for(let ch=0;ch<4;ch++)if(source[si+ch]!==result[di+ch])throw new Error('Nearest export mismatch at '+x+','+y+' channel '+ch);
        }
      }
    }
    checkNearest(preview,decoded.pixels,state.workW,state.workH,full.w,full.h);
    api.setMode('line');api.stroke({tool:'black',radius:.04,points:[[.3,.15],[.7,.85]]});
    const edited=Buffer.from(pixels());full=await app.fullResPNG();decoded=await decodePNG(full.dataURL);
    checkNearest(edited,decoded.pixels,state.workW,state.workH,full.w,full.h);
  });

  await test('Collapsing and expanding the sidebar preserves edits, comparison, zoom and history',async()=>{
    click('saveAB');api.stroke({tool:'black',radius:.02,points:[[.1,.25],[.2,.35]]});
    click('studyZoomIn');
    const panel=doc.getElementById('panel'),toggle=doc.getElementById('studyTogglePanel');
    assert.equal(panel.contains(toggle),false,'The expand button must remain outside the hidden panel');
    assert.equal(panel.hidden,false);assert.equal(toggle.getAttribute('aria-expanded'),'true');
    assert.equal(toggle.getAttribute('aria-controls'),'panel');assert.equal(toggle.textContent,'收起侧栏');
    await new Promise(resolve=>win.requestAnimationFrame(resolve));
    const before=JSON.parse(JSON.stringify({image:app.getState(),study:app.studyState()}));
    const beforePixels=hash(pixels()),beforeWidth=parseFloat(doc.getElementById('canvasWrap').style.width);
    click('studyTogglePanel');await new Promise(resolve=>win.requestAnimationFrame(resolve));
    assert.equal(panel.hidden,true);assert.equal(doc.body.classList.contains('study-sidebar-collapsed'),true);
    assert.equal(toggle.getAttribute('aria-expanded'),'false');assert.equal(toggle.textContent,'展开侧栏');
    assert.ok(parseFloat(doc.getElementById('canvasWrap').style.width)>beforeWidth,'The fitted canvas should use the extra available width');
    assert.deepEqual(JSON.parse(JSON.stringify({image:app.getState(),study:app.studyState()})),before);
    assert.equal(hash(pixels()),beforePixels);
    click('studyTogglePanel');await new Promise(resolve=>win.requestAnimationFrame(resolve));
    assert.equal(panel.hidden,false);assert.equal(doc.body.classList.contains('study-sidebar-collapsed'),false);
    assert.equal(toggle.getAttribute('aria-expanded'),'true');assert.equal(toggle.textContent,'收起侧栏');
    assert.equal(parseFloat(doc.getElementById('canvasWrap').style.width),beforeWidth);
    assert.deepEqual(JSON.parse(JSON.stringify({image:app.getState(),study:app.studyState()})),before);
    assert.equal(hash(pixels()),beforePixels);
  });

  await test('Batch values use selected value count and current L* thresholds',async()=>{
    api.setMode('value');api.values(5,55,90);
    const source=synthetic(128,96);await app.loadDataURL(source,'batch-values.png');
    app.setParams({blur:0,minRegion:0,smooth:0});api.settle();
    const expected=Buffer.from(pixels());
    const batch=await timeout(app.batchFromDataURLs([source],['batch-values.png'],{gray:true,line:false,k:2,maxSide:128,paletteTxt:false}));
    assert.equal(batch.count,1);assert.equal(batch.skipped.length,0);assert.equal(batch.items[0].palette.length,5);
    const images=storedZipImages(batch.zipBase64);assert.equal(images.length,1);
    const image=await decodePNG(images[0].data);assert.equal(image.w,128);assert.equal(image.h,96);
    assert.deepEqual(image.pixels,expected,'Batch must apply the current 5-group thresholds, independent of old batch k');
  });

  await test('Batch black-only excludes edges and never transfers local brush edits',async()=>{
    api.setMode('black');const source=synthetic(128,96);await app.loadDataURL(source,'batch-black.png');
    app.setBlack({enabled:true,threshold:25,protectSkin:false});
    const blackOnly=doc.getElementById('blackOnly');blackOnly.checked=true;blackOnly.dispatchEvent(new win.Event('change',{bubbles:true}));
    api.settle();const candidate=Buffer.from(pixels());
    api.stroke({tool:'black',radius:.1,points:[[.6,.25]]});
    const edited=Buffer.from(pixels());assert.notDeepEqual(edited,candidate,'Local stroke must affect the open image');
    let batch=await timeout(app.batchFromDataURLs([source],['batch-black.png'],{line:true,maxSide:128,paletteTxt:false}));
    assert.equal(batch.count,1);assert.equal(batch.skipped.length,0);
    let images=storedZipImages(batch.zipBase64);assert.equal(images.length,1);
    let result=await decodePNG(images[0].data);
    assert.deepEqual(result.pixels,candidate,'Black-only batch must equal unedited threshold candidates');
    assert.notDeepEqual(result.pixels,edited,'Manual strokes must not transfer to other batch images');
    blackOnly.checked=false;blackOnly.dispatchEvent(new win.Event('change',{bubbles:true}));
    batch=await timeout(app.batchFromDataURLs([source],['batch-with-edges.png'],{line:true,maxSide:128,paletteTxt:false}));
    images=storedZipImages(batch.zipBase64);result=await decodePNG(images[0].data);
    assert.notDeepEqual(result.pixels,candidate,'Disabling black-only must include line candidates');
  });

  assert.deepEqual(errors,[],'No DOM script errors');
  assert.deepEqual(Array.from(app.getErrors()),[],'No app errors');
  console.log(`${passed} integration tests passed. DOM + native canvas; no browser was launched.`);
  dom.window.close();
}

main().catch(err=>{console.error('FAIL '+(err.stack||err));if(errors.length)console.error(errors.join('\n'));process.exitCode=1;}).finally(()=>setTimeout(()=>process.exit(process.exitCode||0),20));
