// Normalized path: seven metres, from the waist clip to the outside anchor.
export const ROPE_PATH=[[.12,.78],[.24,.78],[.24,.56],[.42,.56],[.42,.34],[.62,.34],[.62,.18],[.83,.18]];
export function projectToSegment(p,a,b){const dx=b[0]-a[0],dy=b[1]-a[1],t=Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/(dx*dx+dy*dy)));return {t,distance:Math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dy)}}
export function startRescue({mode='pointer',sound,onKnot,onBlue,onFinish,onClose,confirmed}){
 const layer=document.createElement('section');layer.className='tactile';layer.setAttribute('role','dialog');layer.setAttribute('aria-label','沿绳返回');layer.tabIndex=0;
 layer.innerHTML='<div class="rope-chat"><b>陆遥</b><p role="status">从器材扣握住绳。缓慢移动，靠回声判断方向。</p></div><button class="rope-exit">返回便签 / 设置</button><div class="rope-origin">器材扣</div><div class="rope-door">门</div><div class="rope-cursor"></div><div class="rope-help">按住鼠标握绳 · 方向键模式使用空格握住、方向键移动 · Esc 返回</div><button class="rope-release" hidden>外面已确认，松手离开</button>';
 document.body.append(layer);layer.focus();
 let segment=0,holding=false,blue=false,closed=false,pos=[...ROPE_PATH[0]],lastProgress=0;
 const chat=layer.querySelector('[role=status]'),cursor=layer.querySelector('.rope-cursor');
 const label=t=>chat.textContent=t;
 const draw=()=>{cursor.style.left=pos[0]*100+'%';cursor.style.top=pos[1]*100+'%'};
 const cleanup=()=>{if(closed)return;closed=true;clearInterval(check);sound.link(false);layer.remove();document.removeEventListener('keydown',key);document.removeEventListener('keyup',keyup);window.removeEventListener('blur',release);};
 const release=()=>{if(!holding)return;holding=false;if(blue&&confirmed()){cleanup();onFinish();return}pos=[...ROPE_PATH[segment]];lastProgress=0;label(blue?'别松。外面还没确认。':'手里空了。回到上一个绳结。');sound.proximity(0);draw()};
 const move=next=>{
  if(!holding||blue||closed)return;
  // Prevent jumping over knots by moving the cursor to a distant segment.
  const hit=projectToSegment(next,ROPE_PATH[segment],ROPE_PATH[segment+1]);
  const brightBranch=segment>=2&&next[0]>.46&&next[1]>.50;
  if(hit.distance>.055||hit.t-lastProgress>.24||brightBranch){label(brightBranch?'这不是绳的方向。':'手里空了。回到上一个绳结。');holding=false;pos=[...ROPE_PATH[segment]];lastProgress=0;sound.proximity(0);draw();return}
  pos=next;lastProgress=hit.t;sound.proximity(1-hit.distance/.055);cursor.style.transform=`translate(${Math.sin(Date.now())*hit.distance*70}px,${Math.cos(Date.now())*hit.distance*70}px)`;draw();
  if(hit.t>.96){segment++;lastProgress=0;pos=[...ROPE_PATH[segment]];sound.pulse(segment===2);onKnot(segment);label(segment===2?'双结。五米。':segment===7?'蓝胶布。门楔在手边。':`${7-segment} 米。`);if(segment===7){blue=true;onBlue()}draw()}
 };
 const grab=()=>{holding=true;sound.link(true);sound.proximity(1);label(blue?'握住。等门外回报。':'握住了。')};
 layer.addEventListener('pointerdown',e=>{if(e.target.closest('button'))return;if(mode==='keyboard')return;const r=layer.getBoundingClientRect(),pt=[(e.clientX-r.left)/r.width,(e.clientY-r.top)/r.height];if(Math.hypot(pt[0]-pos[0],pt[1]-pos[1])<.065){grab();layer.setPointerCapture(e.pointerId)}});
 layer.addEventListener('pointermove',e=>{if(mode==='keyboard')return;const r=layer.getBoundingClientRect();move([(e.clientX-r.left)/r.width,(e.clientY-r.top)/r.height])});
 layer.addEventListener('pointerup',release);layer.addEventListener('pointercancel',release);window.addEventListener('blur',release);
 function key(e){if(e.key==='Escape'){cleanup();onClose();return}if(e.code==='Space'){e.preventDefault();if(!holding)grab();return}const dirs={ArrowUp:[0,-.008],ArrowDown:[0,.008],ArrowLeft:[-.008,0],ArrowRight:[.008,0]};if(dirs[e.key]){e.preventDefault();move([pos[0]+dirs[e.key][0],pos[1]+dirs[e.key][1]])}}
 function keyup(e){if(e.code==='Space')release()}
 document.addEventListener('keydown',key);document.addEventListener('keyup',keyup);
 layer.querySelector('.rope-exit').onclick=()=>{cleanup();onClose()};
 layer.querySelector('.rope-release').onclick=()=>{if(blue&&confirmed()){cleanup();onFinish()}};
 const check=setInterval(()=>{if(blue&&confirmed()){label('物业：门楔动了，我看见了。');layer.querySelector('.rope-release').hidden=false}},250);
 draw();return cleanup;
}
