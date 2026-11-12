import '/case/terminals.js';
const key='no-outside.save.v1',thread=document.querySelector('.thread'),base=[...thread.querySelectorAll(':scope > .floor')];
const live=document.createElement('div');live.id='live-floors';thread.insertBefore(live,thread.querySelector('.replybox'));
let page=1;
function floor(name,body,num,meta=''){return `<div class="floor"><div class="side"><div class="ava" style="background:#667a70">${name[0]}</div><div class="name">${name}</div><div class="meta">${meta}</div></div><div class="body"><p>${body}</p><div class="foot">#${num}</div></div></div>`}
function render(){
 let s={stage:0};try{s=JSON.parse(localStorage.getItem(key))||s}catch{}
 base.forEach(el=>el.hidden=page!==1);
 const posts=[['陆遥','更新：我拜托了一位做影像修复的老朋友远程帮我看硬盘，我下午去现场。进展更新在这楼。','2026-11-11 13:50']];
 if(s.stage>=2)posts.push(['栗子壳','户型图我也翻到了，西边那面墙……楼主你确定照片没 P 过？']);
 if(s.stage>=6)posts.push(['陆遥','我进来了。信号不太好。']);
 if(s.stage>=7)posts.push(['物业','该户现场无人。门开着。']);
 if(s.stage>=8)posts.push(['栗子壳','说明书里那个自动补齐我试了，确实能算出完整路线，挺准的',s.stage>=9?'最后在线：上一条回复时':'在线']);
 if(s.ending?.startsWith('safe'))posts.push(['陆遥','出来了。谢谢。']);
 if(s.ending==='safe-marked')posts.push(['物业','凌晨门楔动了一下，监控里没人。']);
 if(s.ending==='bad')posts.push(['新用户_041','楼主，你的电脑现在是不是也开着这个页面']);
 const total=base.length+posts.length;
 if(page===2)live.innerHTML=floor('hc_tmp_041','别补齐。',total+1,'注册 2019-11-22<br>帖子 1');
 else live.innerHTML=posts.map(([name,text,meta],i)=>floor(name,text,i+8,meta||'')).join('');
 const meta=document.querySelector('.thread-meta');
 if(meta)meta.textContent=meta.textContent.replace(/回复 \d+/,`回复 ${total}`);
 const bar=document.querySelector('.replybox .bar span');
 if(bar)bar.textContent=bar.textContent.replace(/共 \d+ 条回复/,`共 ${total} 条回复`);
}
document.querySelectorAll('[data-page]').forEach(button=>button.onclick=()=>{page=Number(button.dataset.page);document.querySelectorAll('[data-page]').forEach(b=>b.classList.toggle('on',Number(b.dataset.page)===page));render()});
addEventListener('storage',e=>{if(e.key===key)render()});render();
