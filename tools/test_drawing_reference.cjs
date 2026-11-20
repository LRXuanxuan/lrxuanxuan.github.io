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
  const reference=await environment('<!doctype html><script src="/assets/drawing-studio/palettes.js"></script><script src="/assets/drawing-studio/reference.js"></script>');
  const win=reference.window; let changed=0;const ref=new win.DrawingReference({onChange(){changed++;}});
  const source=native.createCanvas(72,48),ctx=source.getContext('2d');
  ctx.fillStyle='#d03020';ctx.fillRect(0,0,24,48);ctx.fillStyle='#20a060';ctx.fillRect(24,0,24,48);ctx.fillStyle='#3060d0';ctx.fillRect(48,0,24,48);ctx.clearRect(0,0,7,7);
  const file=new win.File([source.toBuffer('image/png')],'three.png',{type:'image/png'});
  await test('Default palettes have valid unique colors and three complete sixty-color sets',async()=>{
    assert.equal(win.DrawingPalettes.length,8);
    for(const palette of win.DrawingPalettes){assert.ok(palette.id&&palette.name);assert.ok(palette.colors.every(c=>/^#[a-f0-9]{6}$/i.test(c)));assert.equal(new Set(palette.colors).size,palette.colors.length);}
    for(const id of ['street','plants','anime'])assert.equal(win.DrawingPalettes.find(p=>p.id===id).colors.length,60);
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
