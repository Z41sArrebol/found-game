import {chromium} from 'playwright';
import fs from 'node:fs';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'chrome',headless:true});
const context=await browser.newContext({viewport:{width:1440,height:1000},deviceScaleFactor:1});
const page=await context.newPage();
const errors=[];page.on('pageerror',err=>errors.push(err.message));
fs.mkdirSync('.shots',{recursive:true});
async function click(selector){await page.locator(selector).click()}
async function focus(id){await click(`.desktop-icon[data-id="${id}"]`)}
async function doc(id){await focus('files');await page.locator('[data-form="file-search"] input').fill('');await page.locator('[data-form="file-search"]').evaluate(f=>f.requestSubmit());await click(`.file-sidebar [data-id="全部文件"]`);await click(`.file-row[data-id="${id}"]`)}
async function answer(n){await focus('notes');await click(`[data-action="answer"][data-id="${n}"]`)}
async function stage(n){assert.equal(await page.evaluate(()=>window.__game.state.stage),n)}
async function searchFor(q,id){await focus('browser');await page.locator('[data-form="browser-search"] input').fill(q);await page.locator('[data-form="browser-search"]').evaluate(f=>f.requestSubmit());if(id)await click(`.search-result [data-id="${id}"]`)}
try{
 await page.goto('http://127.0.0.1:4178');await page.screenshot({path:'.shots/01-title.png'});
 await click('[data-action="start"]');await page.waitForSelector('.photo-stage');
 await page.evaluate(()=>document.fonts.ready);
 const typeReport=await page.evaluate(()=>{
  const selectors=['.window-title','.message p','.message time','.notebook h3','.case-lead','.open-case button','.photo-caption','.compare-bar button','.taskbar .task'];
  return selectors.map(selector=>{const el=document.querySelector(selector);const css=getComputedStyle(el);return {selector,size:parseFloat(css.fontSize),lineHeight:parseFloat(css.lineHeight),family:css.fontFamily,width:Math.round(el.getBoundingClientRect().width)}});
 });
 for(const item of typeReport){assert.ok(item.size>=13,JSON.stringify(item));assert.ok(item.family.includes('Evidence Sans'),JSON.stringify(item))}
 assert.ok(typeReport.find(x=>x.selector==='.message p').lineHeight>=28);
 fs.writeFileSync('.shots/typography-report.json',JSON.stringify(typeReport,null,2));
 assert.ok(await page.locator('.photo-sheet>img').evaluate(i=>i.complete&&i.naturalWidth>0));
 await page.screenshot({path:'.shots/02-desktop.png'});
 await click('[data-action="inspect"][data-id="window"]');await answer(0);await stage(0);await answer(1);await stage(1);
 await doc('room');await click('[data-action="inspect"][data-id="label"]');
 await searchFor('不存在的煎饼宇宙');assert.ok(await page.getByText('没有找到相关记录。',{exact:false}).count());
 await searchFor('安顺宽带','ad');await answer(0);await stage(2);
 await searchFor('松亭 户型','plan');await searchFor('松亭 外墙','exterior');await answer(1);await stage(3);
 await doc('notes');await doc('mail');await focus('notes');
 for(const [i,v] of ['observe','test','retreat'].entries())await page.locator(`[name="event${i}"]`).selectOption(v);
 await page.locator('[data-form="timeline"]').evaluate(f=>f.requestSubmit());await stage(4);
 await page.reload();await stage(4);assert.ok(await page.evaluate(()=>window.__game.state.seen.includes('mail')));
 await doc('cup');await click('[data-action="video-frame"][data-id="3"]');await answer(1);await stage(5);
 await searchFor('HC-19-041','company');await doc('archives');await doc('manual');await focus('space');
 for(const n of [0,1,2])await click(`[data-action="anchor"][data-id="${n}"]`);
 await click('[data-action="match"]');await answer(1);await stage(6);
 await doc('entrance');await focus('space');await click('[data-action="register"]');await answer(0);await stage(7);
 await doc('outside');await focus('space');await click('[data-action="toggle-link"]');await click('[data-action="toggle-link"]');
 assert.ok(await page.evaluate(()=>window.__game.state.flags.includes('trial-active')&&window.__game.state.flags.includes('trial-paused')));
 await answer(1);await stage(8);await doc('green');await answer(1);await stage(9);
 await doc('log');await doc('ceiling');await click('[data-action="video-frame"][data-id="3"]');await answer(1);await stage(10);
 await doc('experiment');await doc('rope');await answer(1);await stage(11);
 await focus('space');await click('[data-action="complete-map"]');await click('[data-action="dialog-close"]');assert.equal(await page.evaluate(()=>window.__game.state.ending),null);
 await click('[data-action="complete-map"]');await click('[data-action="complete-confirm"]');await page.waitForSelector('.ending.bad');await page.reload();await page.waitForSelector('.ending.bad');await click('[data-action="checkpoint"]');await stage(11);
 await focus('notes');await click('[data-action="rescue"][data-id="1"]');assert.equal(await page.evaluate(()=>window.__game.state.rescue),0);
 for(const n of [0,1,2])await click(`[data-action="rescue"][data-id="${n}"]`);
 await page.waitForSelector('.ending.safe');await page.screenshot({path:'.shots/03-ending.png'});
 assert.equal(await page.evaluate(()=>window.__game.state.ending),'safe');
 const mobile=await browser.newContext({viewport:{width:390,height:844}});const mp=await mobile.newPage();mp.on('pageerror',e=>errors.push(e.message));await mp.goto('http://127.0.0.1:4178');await mp.locator('[data-action="start"]').click();await mp.waitForSelector('.photo-stage');assert.equal(await mp.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);await mp.screenshot({path:'.shots/04-mobile.png'});await mobile.close();
 assert.deepEqual(errors,[]);console.log(JSON.stringify({success:true,checks:['12 investigation nodes','wrong answer recovery','empty search and retry','reload persistence','causal toggles','bad ending and checkpoint','safe ending','390px layout'],browserErrors:errors,screenshots:'.shots/'},null,2));
}finally{await context.close();await browser.close()}
