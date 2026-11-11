import {test} from 'node:test';
import assert from 'node:assert/strict';
import {fresh,hydrate,flag,visit,missing,resolve,search,rescue} from '../dist/engine.js';
import {docs,puzzles} from '../dist/content.js';

test('wrong conclusions and missing evidence cannot advance the investigation',()=>{
 const s=fresh();assert.equal(resolve(s,1).reason,'evidence');flag(s,'inspect-window');assert.equal(resolve(s,0).reason,'wrong');assert.equal(s.stage,0);assert.equal(resolve(s,1).ok,true);assert.equal(s.stage,1);
});
test('all main investigation nodes are reachable with their actual evidence requirements',()=>{
 const s=fresh();for(let i=0;i<11;i++){assert.equal(s.stage,i);for(const item of puzzles[i].requires){if(docs.some(d=>d.id===item))visit(s,item);else flag(s,item)}assert.equal(missing(s).length,0);const r=resolve(s,puzzles[i].answer);assert.equal(r.ok,true,'node '+i)}assert.equal(s.stage,11);for(const item of puzzles[11].requires)visit(s,item);assert.equal(rescue(s,0).ok,true);assert.equal(rescue(s,0).ok,false);assert.equal(s.rescue,1);assert.equal(rescue(s,1).ok,true);assert.equal(rescue(s,2).done,true);assert.equal(s.ending,'safe');assert.equal(resolve(s,1).reason,'ending');
});
test('progress and personal notes survive save/restore',()=>{
 const s=fresh();s.started=true;flag(s,'inspect-window');resolve(s,1);visit(s,'ad');s.personal='还不能判断窗外是什么';const restored=hydrate(JSON.stringify(s));assert.equal(restored.stage,1);assert.deepEqual(restored.seen,['ad']);assert.equal(restored.personal,s.personal);assert.ok(restored.flags.includes('inspect-window'));
});
test('invalid and damaged saves recover to a playable opening',()=>{
 for(const raw of ['{',null,'null','{"version":1,"stage":99}','{"version":8,"stage":2}'])assert.equal(hydrate(raw).stage,0);
 const s=hydrate({version:1,stage:3,seen:['nonexistent','mail'],flags:null,history:null,notes:null,messages:null});assert.deepEqual(s.seen,['mail']);assert.deepEqual(s.flags,[]);assert.deepEqual(s.messages,[]);
});
test('visible names and approximate compound searches find their intended sources',()=>{
 const cases=[['安顺宽带','ad'],['松亭 外墙','exterior'],['松亭户型','plan'],['陈苇','notes'],['沈屹 窗外','ceiling'],['HC-19-041','company'],['R-03','experiment'],['撤回 测绳','experiment']];for(const [q,id] of cases)assert.ok(search(q).slice(0,5).some(d=>d.id===id),q+' should find '+id);assert.deepEqual(search('不存在的煎饼宇宙'),[]);
});
test('save reloading does not duplicate evidence and flags',()=>{const s=fresh();visit(s,'mail');visit(s,'mail');flag(s,'matched');flag(s,'matched');assert.equal(s.seen.length,1);assert.equal(s.flags.length,1)});
test('each puzzle has available evidence and valid options',()=>{for(const p of puzzles){for(const id of p.requires)assert.ok(docs.some(d=>d.id===id)||['inspect-window','inspect-label','cup-played','matched','registered','trial-paused','trial-active','ceiling-played'].includes(id),id);if(p.options)assert.ok(p.answer>=0&&p.answer<p.options.length)}});
