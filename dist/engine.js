import {docs,puzzles} from './content.js';
// Keep the key so existing installations migrate in place.
export const STORAGE='no-outside.save.v1';
export function fresh(){return {version:2,started:false,stage:0,seen:[],flags:[],notes:[],evidence:[],messages:[],history:[],ending:null,audio:false,rescue:0,hints:{},errors:{},idle:{},settings:{rescueMode:'pointer'},linkActive:false}}
export function hydrate(raw){
 try{
  const s=typeof raw==='string'?JSON.parse(raw):raw;
  if(!s||![1,2].includes(s.version)||!Number.isInteger(s.stage)||s.stage<0||s.stage>11)return fresh();
  const arr=(key,check)=>Array.isArray(s[key])?s[key].filter(check):[];
  return {...fresh(),...s,version:2,seen:arr('seen',x=>docs.some(d=>d.id===x)),flags:arr('flags',x=>typeof x==='string'),notes:arr('notes',x=>typeof x==='string'),messages:arr('messages',x=>x&&typeof x.text==='string'),history:arr('history',x=>x&&typeof x==='object'),evidence:arr('evidence',x=>x&&typeof x.id==='string'&&typeof x.text==='string').slice(0,8),hints:s.hints&&typeof s.hints==='object'?s.hints:{},errors:s.errors&&typeof s.errors==='object'?s.errors:{},idle:s.idle&&typeof s.idle==='object'?s.idle:{},settings:{rescueMode:'pointer',...s.settings},rescue:Number.isInteger(s.rescue)?Math.max(0,Math.min(3,s.rescue)):0,ending:['safe','safe-marked','bad','stop'].includes(s.ending)?s.ending:null};
 }catch{return fresh()}
}
export function flag(s,id){if(!s.flags.includes(id))s.flags.push(id)}
export function available(s,id){const d=docs.find(d=>d.id===id);return !!d&&(!d.release||s.stage>=d.release)&&!(id==='experiment'&&!known(s,'r03-unlocked'))}
export function visit(s,id){if(available(s,id)&&!s.seen.includes(id))s.seen.push(id)}
export function known(s,id){return s.seen.includes(id)||s.flags.includes(id)}
export function missing(s){return puzzles[s.stage].requires.filter(id=>!known(s,id))}
function gate(s){return s.ending?{ok:false,reason:'ending'}:missing(s).length?{ok:false,reason:'evidence',message:'还有记录没核过。'}:null}
function advance(s,answer,extra={}){const previous=s.stage,p=puzzles[previous];s.history.push({stage:previous,answer,...extra});s.stage=Math.min(previous+1,11);return {ok:true,previous,messages:p.message||[]}}
function wrong(s,messages){const n=s.errors[s.stage]||0;s.errors[s.stage]=n+1;if(n>=1)s.hints[s.stage]=Math.max(1,s.hints[s.stage]||0);return {ok:false,reason:'wrong',message:messages[n%messages.length]}}
export function collect(s,id,text){
 if(!id||!text)return {ok:false};
 if(s.evidence.some(x=>x.id===id))return {ok:true};
 if(s.evidence.length>=8)return {ok:false,message:'证物栏已满（8 条），先删去暂时不用的记录。'};
 s.evidence.push({id,text:String(text).trim().slice(0,600)});return {ok:true};
}
export function resolveCite(s,ids){
 const blocked=gate(s);if(blocked)return blocked;
 const p=puzzles[s.stage];if(!p.cite||p.type==='cup'&&!known(s,'cup-delay'))return {ok:false,reason:'no-cite',message:'先告诉我慢了多久。'};
 if(!Array.isArray(ids)||ids.length<1||ids.length>2||new Set(ids).size!==ids.length)return wrong(s,p.cite.wrong);
 if(ids.some(id=>!s.evidence.some(x=>x.id===id)))return {ok:false,reason:'evidence',message:'先把这条记录记入便签。'};
 if(!p.cite.need.every(group=>group.some(id=>ids.includes(id)))||ids.some(id=>!p.cite.need.some(group=>group.includes(id))))return wrong(s,p.cite.wrong);
 return advance(s,ids,{citations:ids.map(id=>({...s.evidence.find(x=>x.id===id)}))});
}
export function resolve(s,answer){
 const blocked=gate(s);if(blocked)return blocked;
 const p=puzzles[s.stage];
 if(!['timeline','assembly'].includes(p.type))return {ok:false,reason:'operation'};
 if(JSON.stringify(p.answer)!==JSON.stringify(answer))return wrong(s,['日期或栏目还没对上。','再看看每张卡的原文。']);
 return advance(s,answer);
}
export function mark(s,id){
 if(s.ending||s.stage!==0||!known(s,'room-viewed'))return {ok:false};
 if(!['far-lamp','far-towel','far-bag','far-burn'].includes(id))return {ok:false,message:'这处先记着。再看看窗里。'};
 flag(s,'mark:'+id);if(s.flags.filter(x=>x.startsWith('mark:')).length<3)return {ok:true,partial:true,messages:[]};
 flag(s,'inspect-window');return advance(s,s.flags.filter(x=>x.startsWith('mark:')));
}
export function match(s,ids){
 const blocked=gate(s);if(blocked)return blocked;
 if(s.stage!==5)return {ok:false};
 if(JSON.stringify([...ids].sort())!==JSON.stringify([0,1,2]))return wrong(s,['有一条只在其中一份记录里。','再把两份手簿对一下。']);
 flag(s,'matched');return advance(s,ids);
}
export function register(s,id){
 const blocked=gate(s);if(blocked)return blocked;
 if(s.stage!==6)return {ok:false};if(id!=='corridor')return wrong(s,['我眼前不是木门。','绿漆，横着一根推杠。']);
 flag(s,'registered');s.linkActive=true;return advance(s,id);
}
export function toggleLink(s){
 if(!known(s,'registered')||s.ending)return {ok:false};
 s.linkActive=!s.linkActive;
 if(!s.linkActive)flag(s,'trial-paused');
 else if(known(s,'trial-paused'))flag(s,'trial-active');
 return {ok:true,active:s.linkActive};
}
export function normalizeInput(t){return String(t??'').normalize('NFKC').toLowerCase().replace(/\s+/g,'')}
export function resolveInput(s,text){
 const blocked=gate(s);if(blocked)return blocked;
 const p=puzzles[s.stage];if(!p.input||p.type==='cup'&&known(s,'cup-delay'))return {ok:false,reason:'noinput'};
 const norm=normalizeInput(text).replace(/[。！？?!]+$/g,'');
 if(!p.input.accept.includes(norm))return wrong(s,p.input.wrong);
 if(p.type==='cup'){flag(s,'cup-delay');s.history.push({stage:4,answer:norm,partial:true});return {ok:true,partial:true,messages:['还有那只手。指给我看。']}}
 return advance(s,norm);
}
export function unlock(s,password){if(normalizeInput(password)!=='qingwei_1107')return {ok:false,message:'密码不匹配。提示：资料所有人的租住站账号。'};flag(s,'r03-unlocked');visit(s,'experiment');return {ok:true}}
export function canMarkRope(s){return ['trace','log','rope'].every(id=>known(s,id))}
export function rescue(s,answer){
 if(s.stage!==11||missing(s).length||s.ending)return {ok:false,message:'先核对器材与入口记录。'};
 if(answer!==[0,1,2][s.rescue])return {ok:false,message:['手里空了。回到器材扣。','这不是绳的方向。','等一下，外面还没确认。'][s.rescue]};
 if(s.rescue===2&&!known(s,'outside-confirmed'))return {ok:false,message:'我摸着门楔了。等外面确认。'};
 s.rescue++;return {ok:true,done:s.rescue===3};
}
export function finishRescue(s,marked=false){if(s.stage!==11||s.rescue!==3||s.ending||marked&&!canMarkRope(s))return {ok:false};s.ending=marked?'safe-marked':'safe';s.linkActive=false;return {ok:true}}
export function completeMap(s,count=1){if(!known(s,'registered')||s.ending)return {ok:false};s.checkpoint=structuredClone({...s,checkpoint:undefined});s.terminalCount=Math.max(1,count);s.ending='bad';s.endingAt=Date.now();s.linkActive=false;return {ok:true}}
export function search(query){
 const q=query.normalize('NFKC').toLowerCase().replace(/[，。？?、·_：:]/g,' ').trim();if(!q)return docs.filter(d=>d.kind==='web');
 const terms=q.split(/\s+/).filter(Boolean);
 return docs.map(d=>{const text=(d.title+' '+d.tags+' '+d.body.replace(/<[^>]*>/g,' ')).toLowerCase();let n=terms.reduce((n,t)=>n+(text.includes(t)?3:0),0);if(q.includes('hc')&&d.id==='company')n+=6;if(q.includes('r-03')&&d.id==='experiment')n+=10;for(const token of ['松亭','安顺','宽带','陈苇','陈小苇','青苇','沈屹','户型','外墙','榆宁','永新','测绳','撤回','窗外'])if(q.includes(token)&&text.includes(token))n+=4;return {d,n}}).filter(x=>x.n>0).sort((a,b)=>b.n-a.n).map(x=>x.d);
}
