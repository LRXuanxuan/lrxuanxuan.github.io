/* Reference integration checks. Canvas/DOM fixture follows test_color_block_integration.cjs; no browser is launched. */
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
    if (!file.startsWith(ROOT + path.sep)) throw new Error('Out-of-project resource request');
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
    if(this.id==='viewer')return {x:0,y:0,left:0,top:0,width:1000,height:760,right:1000,bottom:760,toJSON(){}};
    if(this.id==='canvasWrap'){
      const width=parseFloat(this.style.width)||640,height=parseFloat(this.style.height)||480;
      return {x:0,y:0,left:0,top:0,width,height,right:width,bottom:height,toJSON(){}};
    }
    return originalRect.call(this);
  };
  Object.defineProperty(win.HTMLElement.prototype,'clientWidth',{get(){return this.id==='viewer'?1000:(parseInt(this.style.width)||0);}});
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


async function asDataURL(win, blob) {
  return new Promise((resolve,reject)=>{const reader=new win.FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(blob);});
}
function withBlobReader(win) {
  installShims(win);
  win.Blob.prototype.arrayBuffer=function(){return new Promise((resolve,reject)=>{const reader=new win.FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsArrayBuffer(this);});};
}
async function environment(html, page='drawing-studio.html') {
  const vc=new VirtualConsole();vc.on('jsdomError',err=>errors.push(err.stack||String(err)));
  const dom=new JSDOM(html,{url:'https://color-study.test/'+page,runScripts:'dangerously',resources:new LocalResources(),pretendToBeVisual:true,beforeParse:withBlobReader,virtualConsole:vc});
  await timeout(new Promise(resolve=>dom.window.addEventListener('load',resolve,{once:true})));
  return dom;
}
async function main(){
  await test('Reference bridge stores Blobs locally and tokens can be consumed only once',async()=>{
    const vm=require('node:vm'),{indexedDB}=require('fake-indexeddb');
    const sandbox={window:{indexedDB,crypto:require('node:crypto').webcrypto},Blob,Promise,Uint8Array,Date,Error,Array,Math};
    vm.runInNewContext(fs.readFileSync(path.join(ROOT,'assets/drawing-studio/bridge.js'),'utf8'),sandbox);
    const bridge=sandbox.window.DrawingBridge,bundle={version:1,name:'private.png',original:new Blob(['local pixels'],{type:'image/png'}),views:{}};
    const id=await bridge.put(bundle);assert.match(id,/^[a-f0-9]{32}$/);
    const found=await bridge.take(id);assert.equal(found.name,'private.png');assert.equal(await found.original.text(),'local pixels');
    await assert.rejects(bridge.take(id),/领取或已过期/);await assert.rejects(bridge.take('invalid'),/无效/);
  });
  const reference=await environment('<!doctype html><script src="/assets/drawing-studio/palettes.js"></script><script src="/assets/drawing-studio/palettes-supervision.js"></script><script src="/assets/drawing-studio/palettes-holbein.js"></script><script src="/assets/drawing-studio/palettes-pilot.js"></script><script src="/assets/drawing-studio/palette-map.js"></script><script src="/assets/drawing-studio/reference.js"></script>');
  const win=reference.window; let changed=0;const ref=new win.DrawingReference({onChange(){changed++;}});
  const source=native.createCanvas(72,48),ctx=source.getContext('2d');
  ctx.fillStyle='#d03020';ctx.fillRect(0,0,24,48);ctx.fillStyle='#20a060';ctx.fillRect(24,0,24,48);ctx.fillStyle='#3060d0';ctx.fillRect(48,0,24,48);ctx.clearRect(0,0,7,7);
  const file=new win.File([source.toBuffer('image/png')],'three.png',{type:'image/png'});
  await test('Official Sketch sets and the full chart preserve unique ink codes, names and product sources',async()=>{
    assert.equal(win.DrawingPalettes[0].id,'sketch36-set');
    assert.equal(new Set(win.DrawingPalettes.map(p=>p.id)).size,win.DrawingPalettes.length);
    for(const palette of win.DrawingPalettes.filter(p=>p.id.startsWith('sketch'))){assert.ok(palette.id&&palette.name);assert.ok(palette.colors.every(c=>/^#[a-f0-9]{6}$/i.test(c)));assert.equal(new Set(palette.colors).size,palette.colors.length);}
    for(const [id,size] of [['sketch36-set',36],['sketchcomic24-set',24],['sketch6-set-portrait',6],['sketch12cg-set',12],['sketch-chart',357]]){
      const palette=win.DrawingPalettes.find(p=>p.id===id);
      assert.equal(palette.colors.length,size);
      const grouped=Array.from(palette.groups).flatMap(group=>Array.from(group.swatches));
      assert.deepEqual(grouped.map(s=>s.hex),Array.from(palette.colors));
      assert.ok(grouped.every(s=>s.officialName&&s.name&&s.code&&s.code!=='0'));
      assert.equal(new Set(grouped.map(s=>s.code)).size,size);
    }
    assert.ok(win.DrawingPalettes.filter(p=>p.id.startsWith('sketch')).every(p=>p.source.startsWith('https://copic.jp/en/')));
    const portrait=win.DrawingPalettes.find(p=>p.id==='sketch6-set-portrait');
    assert.deepEqual(Array.from(portrait.swatches,s=>s.code),['E000','E00','E11','E15','E18','E93']);
  });
  await test('Image load produces original/color/gray reference and matching palettes without PDF loading',async()=>{
    await ref.load(file);assert.equal(changed,1);assert.equal(ref.getInfo().width,72);assert.equal(ref.getInfo().height,48);assert.equal(ref.getInfo().isPDF,false);
    assert.equal(ref.getSourceBlob(),file);assert.equal(ref.getInfo().palettes.color.length,3);
    for(const mode of ['original','gray','color','line']){
      ref.setMode(mode);const canvas=ref.getCanvas();assert.equal(canvas.width,72);assert.equal(canvas.height,48);
      const data=canvasPixels(canvas);assert.equal(data[3],0,'Transparent corner must survive '+mode);assert.equal(data[(30*72+30)*4+3],255);
      if(mode==='gray'||mode==='line')for(let i=0;i<data.length;i+=4){assert.equal(data[i],data[i+1]);assert.equal(data[i],data[i+2]);}
    }
  });
  await test('Color and gray swatches are actual pixel colors, count changes alter quantization',async()=>{
    await ref.setCount(2);const info=ref.getInfo();assert.equal(info.palettes.color.length,2);
    for(const mode of ['gray','color']){
      ref.setMode(mode);const data=canvasPixels(ref.getCanvas()),palette=new Set(info.palettes[mode].map(c=>c.toLowerCase()));
      for(let i=0;i<data.length;i+=4)if(data[i+3]){const color='#'+Array.from(data.subarray(i,i+3),v=>v.toString(16).padStart(2,'0')).join('');assert.ok(palette.has(color),'Unrepresented pixel '+color);}
    }
  });
  await test('Copic reference is lazy, preserves source and alpha, and uses only its selected inks plus black and white',async()=>{
    const limited=new win.DrawingReference({paletteId:'sketch6-set-portrait'});
    assert.equal(limited.getInfo().paletteId,'sketch6-set-portrait');
    assert.deepEqual(Array.from(limited.getInfo().palettes.copic).sort(),['#000000','#ffffff']);
    await limited.load(file);const original=hash(canvasPixels(limited.getCanvas()));
    assert.equal(limited.views.copic,undefined,'Original reference must not precompute the extra view');
    limited.setPalette('sketch12-set');assert.equal(limited.views.copic,undefined);
    limited.setMode('copic');assert.equal(limited.getInfo().paletteMethod,'color');
    const allowed=new Set(win.DrawingPaletteMap.describe(win.DrawingPalettes.find(p=>p.id==='sketch12-set')).swatches.map(s=>s.hex));
    const result=canvasPixels(limited.getCanvas());
    for(let i=0;i<result.length;i+=4)if(result[i+3]===255){const color='#'+Array.from(result.subarray(i,i+3),v=>v.toString(16).padStart(2,'0')).join('');assert.ok(allowed.has(color));}
    assert.equal(result[3],0);assert.equal(hash(canvasPixels(limited.views.original)),original);
    assert.ok(limited.getInfo().palettes.copic.includes('#000000'));assert.ok(limited.getInfo().palettes.copic.includes('#ffffff'));
    limited.setPalette('sketch6-set-portrait');assert.equal(limited.getInfo().paletteMethod,'gray');
    const alphaSource=native.createCanvas(5,1),alphaContext=alphaSource.getContext('2d'),alphaImage=alphaContext.createImageData(5,1);
    for(let i=0;i<5;i++)alphaImage.data.set([80+i*30,130,200-i*20,[0,64,128,192,255][i]],i*4);
    alphaContext.putImageData(alphaImage,0,0);
    await limited.load(new win.File([alphaSource.toBuffer('image/png')],'alpha.png',{type:'image/png'}));
    assert.deepEqual(Array.from(canvasPixels(limited.getCanvas())).filter((_,i)=>i%4===3),[0,64,128,192,255]);
    limited.destroy();
  });
  await test('Changing ordinary quantization count preserves the Copic view while switching its palette invalidates it',async()=>{
    const limited=new win.DrawingReference();await limited.load(file);limited.setMode('copic');
    const mapped=limited.getCanvas(),before=hash(canvasPixels(mapped)),colors=Array.from(limited.getInfo().palettes.copic);
    await limited.setCount(3);assert.equal(limited.getCanvas(),mapped);assert.equal(hash(canvasPixels(mapped)),before);
    assert.deepEqual(Array.from(limited.getInfo().palettes.copic),colors);
    limited.setMode('original');limited.setPalette('sketch6-set-seasky');assert.equal(limited.views.copic,undefined);
    limited.setMode('copic');assert.notEqual(limited.getCanvas(),mapped);assert.equal(limited.getInfo().paletteMethod,'gray');
    const active=limited.getCanvas();assert.equal(limited.setPalette('unknown-set'),false);
    assert.equal(limited.getCanvas(),active);assert.equal(limited.getInfo().paletteId,'sketch6-set-seasky');
    limited.destroy();
  });
  await test('Copic project round-trip saves only the palette ID and rebuilds its pixels; old and unknown IDs use basic 36',async()=>{
    const limited=new win.DrawingReference({paletteId:'sketch6-set-seasky'});await limited.load(file);limited.setMode('copic');
    const expected=hash(canvasPixels(limited.getCanvas())),bundle=await limited.exportBundle();
    assert.equal(bundle.paletteId,'sketch6-set-seasky');assert.equal(bundle.selectedMode,'copic');assert.equal(bundle.views.copic,undefined);assert.equal(bundle.palettes.copic,undefined);
    const restored=new win.DrawingReference();await restored.loadBundle(bundle);
    assert.equal(restored.getInfo().mode,'copic');assert.equal(restored.getInfo().paletteId,'sketch6-set-seasky');
    assert.equal(hash(canvasPixels(restored.getCanvas())),expected);
    await restored.loadBundle({...bundle,paletteId:'unknown-set'});assert.equal(restored.getInfo().paletteId,'sketch36-set');assert.equal(restored.getInfo().paletteMethod,'color');
    const legacy={...bundle,selectedMode:'original'};delete legacy.paletteId;
    await restored.loadBundle(legacy);assert.equal(restored.getInfo().paletteId,'sketch36-set');assert.equal(restored.views.copic,undefined);
    restored.destroy();limited.destroy();
  });
  await test('Mocked PDF navigation uses the newest page and palette without installing a stale Copic result',async()=>{
    const paged=new win.DrawingReference();await paged.load(file);paged.setMode('copic');
    const pendingPages=new Map(),rendered=[],cleaned=[];
    paged._pdf={getPage(number){return new Promise(resolve=>pendingPages.set(number,resolve));},loadingTask:{destroy(){return Promise.resolve();}}};paged.pageCount=3;
    function mockPage(number){return {cleanup(){cleaned.push(number);},getViewport({scale}){return {width:72*scale,height:48*scale};},render({canvasContext}){rendered.push(number);canvasContext.fillStyle=number===3?'#c0c0c0':'#101010';canvasContext.fillRect(0,0,144,96);return {promise:Promise.resolve(),cancel(){}};}};}
    const second=paged.setPage(2);paged.setPalette('sketch6-set-portrait');const third=paged.setPage(3);
    pendingPages.get(3)(mockPage(3));assert.equal(await third,true);
    const latest=hash(canvasPixels(paged.getCanvas()));assert.equal(paged.getInfo().page,3);assert.equal(paged.getInfo().paletteId,'sketch6-set-portrait');assert.equal(paged.getInfo().paletteMethod,'gray');
    assert.equal(paged.getCanvas(),paged.views.copic);pendingPages.get(2)(mockPage(2));assert.equal(await second,false);
    assert.equal(hash(canvasPixels(paged.getCanvas())),latest);assert.deepEqual(rendered,[3]);assert.ok(cleaned.includes(2));paged.destroy();
  });
  await test('Exported bundle restores each mode exactly and preserves hand-edited reference pixels',async()=>{
    ref.setMode('line');const line=ref.getCanvas().getContext('2d');line.fillStyle='#000000';line.fillRect(10,10,8,8);
    const hashes={};for(const mode of ['original','gray','color','line']){ref.setMode(mode);hashes[mode]=hash(canvasPixels(ref.getCanvas()));}
    const bundle=await ref.exportBundle(),restored=new win.DrawingReference();await restored.loadBundle(bundle);
    assert.equal(restored.getInfo().name,'three.png');
    for(const mode of ['original','gray','color','line']){restored.setMode(mode);assert.equal(hash(canvasPixels(restored.getCanvas())),hashes[mode]);}
    restored.destroy();assert.equal(restored.getCanvas(),null);
  });
  await test('Invalid image leaves previous reference and palette intact',async()=>{
    const before=hash(canvasPixels(ref.getCanvas())),name=ref.getInfo().name;
    await assert.rejects(ref.load(new win.File(['not an image'],'broken.png',{type:'image/png'})),/无法解码/);
    assert.equal(hash(canvasPixels(ref.getCanvas())),before);assert.equal(ref.getInfo().name,name);
  });
  await test('Detached PDF retains the current page and source identity through repeated saves without reading the original',async()=>{
    const bundle=await ref.exportBundle();
    const externalPDF={size:105000000,fingerprint:'32af'.repeat(8)};
    const detached=new win.DrawingReference();
    await detached.loadBundle({...bundle,name:'study.pdf',page:62,pageCount:100,externalPDF});
    assert.equal(detached.getInfo().externalPDF,true);
    assert.equal(detached.getInfo().isPDF,false);
    const saved=await detached.exportBundle();
    assert.equal(saved.page,62);assert.equal(saved.pageCount,100);assert.equal(saved.sourceFile,null);
    assert.equal(saved.externalPDF.fingerprint,externalPDF.fingerprint);
    const before=hash(canvasPixels(detached.getCanvas()));
    await assert.rejects(detached.load(new win.File(['wrong'],'other.pdf',{type:'application/pdf'}),true),/原先使用/);
    assert.equal(detached.getInfo().page,62);assert.equal(hash(canvasPixels(detached.getCanvas())),before);
    detached.destroy();
  });
  await test('Returning to the visible PDF page cancels an older unresolved getPage request',async()=>{
    const paged=new win.DrawingReference();await paged.load(file);
    let resolvePage,cleaned=0,destroyed=0;const prior=hash(canvasPixels(paged.getCanvas()));
    paged._pdf={getPage(){return new Promise(resolve=>{resolvePage=resolve;});},loadingTask:{destroy(){destroyed++;return Promise.resolve();}}};paged.pageCount=3;
    const pending=paged.setPage(2);await paged.setPage(1);
    resolvePage({cleanup(){cleaned++;},getViewport(){throw new Error('A stale page must never be rendered');}});
    assert.equal(await pending,false);assert.equal(paged.page,1);assert.equal(hash(canvasPixels(paged.getCanvas())),prior);assert.equal(cleaned,1);paged.destroy();assert.equal(destroyed,1,'PDF 6 uses loadingTask.destroy, not a document.destroy method');
  });
  const teaching=await environment(fs.readFileSync(path.join(ROOT,'color-block-studio.html'),'utf8'),'color-block-studio.html');
  const tw=teaching.window,doc=tw.document,app=tw.__APP,api=app.studyTest;
  await timeout(app.loadDataURL(synthetic(),'synthetic.png'));app.setParams({blur:0,minRegion:0,smooth:0});api.settle();
  await test('Teaching handoff preserves edited modes, alpha, A/B state and undo history without switching modes',async()=>{
    api.setMode('value');api.values(3,35,72);app.setPaletteMode(0,'clear');api.settle();
    const gray=hash(canvasPixels(doc.getElementById('resultCanvas'))),grayPalette=Array.from(app.getState().palette).slice(1);
    api.setMode('color');app.setPalette(['#102030','#f0c090','#406070']);api.settle();
    const color=hash(canvasPixels(doc.getElementById('resultCanvas'))),colorPalette=Array.from(app.getState().palette);
    api.setMode('line');api.stroke({radius:.035,points:[[.5,.5]],tool:'weaken'});api.settle();
    const line=hash(canvasPixels(doc.getElementById('resultCanvas')));
    doc.getElementById('saveAB').click();
    const before=JSON.stringify({state:app.getState(),study:app.studyState(),pixels:line});
    assert.equal(doc.getElementById('drawingReferenceBtn').disabled,false);
    const bundle=await api.reference();
    assert.equal(JSON.stringify({state:app.getState(),study:app.studyState(),pixels:hash(canvasPixels(doc.getElementById('resultCanvas')))}),before);
    assert.deepEqual(Array.from(bundle.palettes.color),colorPalette);assert.deepEqual(Array.from(bundle.palettes.gray),grayPalette);
    for(const [mode,expected] of [['gray',gray],['color',color],['line',line]])assert.equal(hash((await decodePNG(await asDataURL(tw,bundle.views[mode]))).pixels),expected,'Teaching '+mode+' exact pixels');
    doc.getElementById('showAB').click();assert.equal(doc.getElementById('drawingReferenceBtn').disabled,true);await assert.rejects(api.reference(),/返回 B/);doc.getElementById('showAB').click();
  });
  await test('Teaching handoff generates unvisited modes without adding undo steps or losing source state',async()=>{
    await timeout(app.loadDataURL(synthetic(),'fresh.png'));api.setMode('value');api.settle();
    const before=JSON.stringify({state:app.getState(),study:app.studyState()});
    const bundle=await api.reference();assert.ok(bundle.views.color&&bundle.views.gray&&bundle.views.line);
    assert.equal(JSON.stringify({state:app.getState(),study:app.studyState()}),before);assert.equal(bundle.selectedMode,'gray');
  });
  ref.destroy();reference.window.close();teaching.window.close();
  assert.deepEqual(errors,[],'No page-script errors');
  console.log('\n'+passed+' reference integration checks passed. PDF rendering requires the separate real PDF check.');
}
main().catch(error=>{console.error(error.stack||error);process.exitCode=1;});
