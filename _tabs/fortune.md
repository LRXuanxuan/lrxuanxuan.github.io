---
title: "照明之咪摇奖机"
icon: fas fa-moon
order: 5
permalink: /fortune/
---

<style>
#watchman-app{--bg:#13202d;--ink:#f5ead4;--gold:#d4b679;color:var(--ink);background:radial-gradient(ellipse at top right,#334457,#13202d 70%);border-radius:14px;padding:clamp(16px,3vw,36px);font-family:Georgia,"Noto Serif SC","Songti SC",serif}
#watchman-app *{box-sizing:border-box}#watchman-app .eyebrow{color:var(--gold);letter-spacing:.15em;font-size:.79rem}#watchman-app h2{font-size:1.9rem;letter-spacing:.05em;color:#fff0cf;margin:0}#watchman-app p{line-height:1.75}#watchman-app .muted{font-size:.84rem;color:#c4c9cb}
#watchman-app textarea{width:100%;min-height:74px;resize:vertical;border-radius:7px;border:1px solid #baae8a;color:#1d2b39;background:#f9f4ec;padding:12px;font:inherit}#watchman-app .modebar,#watchman-app .actions{display:flex;gap:9px;flex-wrap:wrap;margin:12px 0 15px}
#watchman-app button{border:1px solid var(--gold);border-radius:7px;padding:8px 14px;color:#f5edda;background:transparent;font:inherit;cursor:pointer}#watchman-app button[aria-pressed=true],#watchman-app .primary{background:#dac38e;color:#182430;font-weight:700}#watchman-app button:hover{filter:brightness(1.15)}#watchman-app button:focus-visible{outline:3px solid #f1dca9;outline-offset:3px}
#watchman-app .results{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,220px),1fr));gap:15px;margin-top:22px}
#watchman-app article{border:1px solid #847a63;background:#203244;border-radius:10px;overflow:hidden}#watchman-app article .head{padding:8px 12px;background:#172432;color:#d8bf87;font-size:.85rem}#watchman-app article .card-cover{width:100%;aspect-ratio:1;display:grid;place-items:center;background:#0b1724;position:relative;overflow:hidden}
#watchman-app article img{width:min(96%,290px);aspect-ratio:1;object-fit:contain;display:block;position:absolute;inset:2%;margin:auto}#watchman-app .card-glyph{display:flex;flex-direction:column;align-items:center;justify-content:center;border:2px solid #a48a5d;outline:1px solid #665838;outline-offset:-10px;width:80%;height:80%;color:#ead3a4;text-align:center;padding:12px;background:radial-gradient(ellipse,#30415a,#111e2b)}
#watchman-app .card-glyph b{font-size:1.5rem}#watchman-app .card-glyph small{font-size:.71rem;letter-spacing:.16em;color:#c4ad75}
#watchman-app .body{padding:13px 15px 17px}#watchman-app .body h3{color:#f6e7c6;font-size:1.26rem;margin:0}#watchman-app .face{color:#d9b981;font-size:.87rem;margin:.3em 0}
#watchman-app .meaning{font-size:.86rem;white-space:pre-line;color:#d6dbe0}#watchman-app details{border-top:1px solid #50606a;padding-top:9px;margin-top:11px;font-size:.84rem}#watchman-app summary{color:#eed09d;cursor:pointer}#watchman-app .rel{border-left:2px solid #d1ac76;padding-left:10px;color:#ded7c7;font-size:.81rem;margin-top:10px}
#watchman-app .divider{margin:26px 0 16px;height:1px;background:linear-gradient(90deg,transparent,#bda16d,transparent)}#watchman-app [hidden]{display:none!important}
</style>
<div id="watchman-app">
<p class="eyebrow">THE WATCHMAN'S DECK · 1.1.4β</p><h2>照明之咪摇奖机</h2><p class="muted">81 张牌、四种朝向。向守夜人提出问题，再抽取属于你的牌。</p>
<label for="wm-question">问题</label><textarea id="wm-question" maxlength="300" placeholder="今天会遇到什么事？"></textarea>
<p class="muted">选择牌阵</p><div class="modebar"><button data-mode="one">单抽</button><button data-mode="three" aria-pressed="true">三抽</button><button data-mode="season">四季牌</button><button data-mode="ritual">仪式牌阵</button></div>
<p id="wm-hint" class="muted"></p><button class="primary" id="wm-draw">✦ 请守夜人展示答案</button>
<section id="wm-output" hidden><div class="divider"></div><p class="eyebrow">THE READING</p><p id="wm-question-out"></p><p id="wm-n"></p><div class="results" id="wm-results"></div><p class="muted" id="wm-extra" hidden>特殊牌触发：逸法之时与影中自我</p><div class="actions"><button id="wm-add">＋ 再抽一张</button><button id="wm-copy">复制结果</button><button id="wm-again">重新摇牌</button></div></section>
<p class="muted" id="wm-status">正在检查完整图文牌库…</p><p class="muted">随机娱乐占卜，不应作为现实决策依据。</p>
</div>
<script>
(()=>{'use strict';
const R=document.getElementById('watchman-app'),$=s=>R.querySelector(s),btns=[...R.querySelectorAll('[data-mode]')];
const raw=["飞蛾|内患、更替、顶替、隐情、混沌的渴慕","瞳中之扉|指引前路，照明驱暗；理性、指引、考验","丝毧|覆盖、隐瞒、秘而不宣；尚不宜揭示之事","石绿|新生、繁荣、保护、奇想与变化","轰雷之皮|维系、活力、音乐、守护与规律","蚁母|开启、通行、指引与来自他人的帮助","双生巫女|结合、纠缠、分界点与昼夜交替","上校|忍耐、武力、统治、镇压与封闭","狮子匠|突破、考验、变革、抗争与创造","悼歌诗人|铭记、追忆与不复重现的事物","拾滩鸦|遗失之物、偶然所得、幸运与变化","弧月|平衡、揭示真相、协调与美","残阳|凄美终局；改变之后留下的影响","双角斧|守望、守护、分割、斩断与通行","昕旦|黎明、稳固、安静、公正与清醒","赤杯|诱惑、苦痛、欲望、妒忌与束缚","裂分之狼|旧日创痛、悔恨、屈辱、愤怒与分裂","浪游旅人|旅行、开端、信息传递与精力充沛","双生女巫|十字路口、分离与重新结合","制花人|贪婪、迷醉、精神愉悦与隐秘信息","白日铸炉|破坏与再生；有意识的根本改变","耀山|攀登、收容、赠礼与开启","白雪|缓慢、恒定、静默、停滞与凝固的美","黑骸|恐惧、茫然失措、惊恐、焦虑","扶摇蜘蛛|野心、统治、进取与不可阻挡","戴冠之孳|感染、影响、嬗变、生长与扩散","光明果|家园、照料、滋养、抚慰与复原","树中牝马|隐匿、欺诈、违背法则与秘密","见证人|不回避的注视，也可能是袖手旁观","制烛人|问题、燃料、引火之物与旁观","七蟠|纷乱、思想枷锁、复杂问题与多重面相","逆孵之卵|矛盾、起源、连续性与违背常理","浪潮|遴选、评判、分化、流动与周期","骄阳|凝滞、停滞、缺乏变化与转机","燧石|文明的开端，走向全新领域","转轮|循环往复、维系与潜在祸患","耀素|纯洁、纯净、闪耀与刺破黑暗","不仁梵咒|难以忍受却必须接受的真相","先见者|兆示、洞察、占卜与解读的不确定性","医师|追寻、分析、逻辑、真相与真知","骄盛夺目|昭然若揭的真相，理解却未必掌握","朱砂护身符|通往转变的契机","塑型之咏|改变来临时，以知识促进改变","重塑者|经由此人的手，天地大不相同","警探|兼顾两种身份、工作与生活","炽烈已极|剧烈改变、灼热、迅猛与天翻地覆","陨铁子弹|外来的细微钝痛，不应长期忽视","狻猊行动|危机四伏，须全神贯注","暗杀者|隐秘的干预、未知的影响","流亡者|逃逸、多次短途移动、险境与帮助","破局之力|激烈矛盾、动荡与绝境求变","骨笛|动荡落幕，平静状态的开端","落日行动|结束、尾声、理解并接纳陨落","唯余静默|不说不做，并非不知不能","食尸鬼|铭记过往，寻回记忆残片","无瑕的冰霜|无所进展、难以前行、死灰难燃","玫瑰色珍珠粉|保护柔软内在的外壳与防御","唤醒之咏|苏醒、活力、鼓励或痛苦回忆","蛊舞者|快乐、热情、艺术、舞蹈与音乐","有志青年|未知的新生活、青涩与无限可能","近在眉睫|即将到来、紧张与前夜","污迹手套|为了满足欲望而采取的手段","悦人的圣礼|甜言蜜语，糖衣包裹的牺牲","纵情者|极有魅力，无可阻挡","富家子弟|物质丰富、感官诱惑与兴趣使然","道成肉红身|来自环境的束缚和无法驱散的诱惑","有翼人偶|纷乱思绪、乱发纠结与躁动","蜕衣舞者的寓言|抛弃旧物、放下与暴露真我","易皮者|抛弃旧形体与旧限制，迎接蜕变","舞者|蜕变、情感表达、活力与美","旧日的渴慕|渴望、欲求与全然蜕变","拜占庭染剂|钥匙、畅通无阻与顺畅的流程","伤口通行权|以代价换得新的道路与知识","钥匙|洞察、间隙与开启道路","牧师|牺牲自己、服务他人与关闭门户","错误的门|路虽可通，却必须付出代价","矛盾的古董|矛盾、莫衷一是与细微选择","“论历史”|仔细拆解、分析与研究过往","悬而未定的模棱两可|难以抉择、多重选择与摇摆","巴尔多梅人|怀恋过往与学识渊博的指引者","午港奇闻|浓烈的回忆，已经远去但难以抹除"];
let D=raw.map((x,i)=>{const parts=x.split('|');return{id:i,name:parts[0],description:parts[1],full:false}});
let complete=false,mode='three',base=[],extra=[],question='';
const labels={one:['第一张牌'],three:['第一张牌','第二张牌','第三张牌'],season:['谁在看你','燃料','知识','人（一）','人（二）','影响'],ritual:['司辰','器具','秘传','信徒','角色','影响']};
const orient=[['正位','其本来的含义',0],['逆位','否定原本含义，或该要素不存在于事件之中',180],['右转','此要素过甚、正在增长，可参考下一张牌',90],['左转','此要素发展不足，或需要先处理前一步的问题',-90]],special=new Set([0,6,11,12,18]);
function rand(n){const a=new Uint32Array(1),max=4294967296-(4294967296%n);do{crypto.getRandomValues(a)}while(a[0]>=max);return a[0]%n}
function sample(g,seen){let pool=g.filter(i=>!seen.has(i));if(!pool.length)throw Error('已抽完');let id=pool[rand(pool.length)];seen.add(id);return{id,face:rand(4)}}
function neigh(i,f){if(f===3){if(i===36)return 70;if(i===0)return 35;if(i===71||i===76)return null;return i-1}if(f===2){if(i===35)return 0;if(i===70)return 36;if(i===75||i===80)return null;return i+1}return null}
const node=(tag,cls,txt)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(txt!==undefined)e.textContent=txt;return e};
function render(){let results=$('#wm-results');results.replaceChildren();let a=base.concat(extra);$('#wm-question-out').textContent=question?'所问：'+question:'未输入问题：由牌面自由解读';$('#wm-n').textContent='抽得 '+a.length+' 张牌';
a.forEach((c,i)=>{let d=D[c.id],o=orient[c.face],p=node('article'),header=node('div','head',(labels[mode][i]||'追加抽牌')+' · NO.'+String(c.id).padStart(2,'0')),art=node('div','card-cover');
let glyph=node('div','card-glyph'),g1=node('small','', 'THE WATCHMAN'),g2=node('b','',d.name),g3=node('small','', '✧ '+String(c.id).padStart(2,'0')+' ✧');glyph.append(g1,g2,g3);art.append(glyph);
if(complete){const im=node('img');im.src="{{ '/assets/fortune' | relative_url }}"+'/cards/'+String(c.id).padStart(2,'0')+'.webp';im.alt='牌面：'+d.name;im.loading='lazy';im.style.transform='rotate('+o[2]+'deg)';im.onerror=()=>im.remove();art.append(im)}
let body=node('div','body');body.append(node('h3','',d.name),node('p','face',o[0]),node('p','meaning',o[1]));let det=node('details'),sm=node('summary','',complete?'查看完整牌义':'查看牌义摘要');det.append(sm,node('p','meaning',d.description));body.append(det);let rel=neigh(c.id,c.face);if(rel!==null)body.append(node('div','rel','转向关联：'+D[rel].name+' · '+D[rel].description));p.append(header,art,body);results.append(p)});
$('#wm-extra').hidden=!base.some(x=>special.has(x.id));$('#wm-add').disabled=a.length>=81;$('#wm-output').hidden=false}
function draw(){question=$('#wm-question').value.trim();const seen=new Set,all=Array.from({length:81},(_,i)=>i);
base=labels[mode].map((_,i)=>{let g=(mode==='one'||mode==='three')?all:i===0?Array.from({length:35},(_,j)=>j+2):Array.from({length:9},(_,j)=>36+j*5+(i-1));return sample(g,seen)});
extra=[];if(mode!=='ritual'&&base.some(x=>special.has(x.id)))extra=[sample(all,seen)];render()}
function setMode(m){mode=m;btns.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mode===m)));$('#wm-hint').textContent={one:'单张牌占卜',three:'三张不重复的牌，特殊牌可能带来额外抽取',season:'司辰、燃料、知识、两个人与影响',ritual:'司辰、器具、秘传、信徒、角色、影响'}[m]}
btns.forEach(b=>b.onclick=()=>setMode(b.dataset.mode));$('#wm-draw').onclick=draw;$('#wm-again').onclick=draw;
$('#wm-add').onclick=()=>{extra.push(sample(Array.from({length:81},(_,i)=>i),new Set(base.concat(extra).map(x=>x.id))));render()};
$('#wm-copy').onclick=async()=>{let s=['照明之咪摇奖机',question||'未输入问题',...base.concat(extra).map((x,i)=>{let d=D[x.id],o=orient[x.face];return (labels[mode][i]||'追加抽牌')+'：'+d.name+' · '+o[0]+'\n'+d.description})].join('\n\n');try{await navigator.clipboard.writeText(s);$('#wm-copy').textContent='已复制'}catch(e){prompt('复制以下内容',s)}};
setMode('three');
fetch("{{ '/assets/fortune/cards.json' | relative_url }}").then(r=>{if(!r.ok)throw Error('no full data');return r.json()}).then(a=>{if(a.length!==81)throw Error('invalid');D=a;complete=true;$('#wm-status').textContent='完整版牌库：81 张牌面和完整牌义已加载。';if(base.length)render()}).catch(()=>{$('#wm-status').textContent='轻量版已可使用：当前显示 81 张牌的牌义摘要。完整牌图与全文将在素材上传后自动启用。'});
})();
</script>
