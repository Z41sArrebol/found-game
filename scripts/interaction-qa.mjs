import {chromium} from 'playwright';
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {fresh} from '../dist/engine.js';
const base=process.env.QA_URL||'http://127.0.0.1:4178',key='no-outside.save.v1';
const browser=await chromium.launch({channel:'chrome',headless:true});
try{
 const context=await browser.newContext({viewport:{width:390,height:844}});const save={...fresh(),started:true,stage:6};await context.addInitScript(({key,save})=>{if(!localStorage.getItem(key))localStorage.setItem(key,JSON.stringify(save))},{key,save});
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.clock.install();await page.goto(base+'/case/pane.html?pane=chat');
 await page.clock.runFor(46000);assert.equal(await page.evaluate(()=>window.__game.ui.typing),true);assert.equal(await page.evaluate(()=>window.__game.state.messages.length),0);
 await page.clock.runFor(4000);assert.equal(await page.evaluate(()=>window.__game.ui.typing),false);
 await page.clock.runFor(43000);assert.deepEqual(await page.evaluate(()=>window.__game.state.messages.map(m=>m.text)),['我还在。']);
 await page.clock.runFor(180000);assert.deepEqual(await page.evaluate(()=>window.__game.state.messages.map(m=>m.text)),['我还在。','走廊好长。','……']);await page.clock.runFor(100000);assert.equal(await page.evaluate(()=>window.__game.state.messages.length),3);assert.equal(await page.evaluate(()=>window.__game.state.stage),6);
 await page.goto(base+'/case/pane.html?pane=notes');assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);await page.screenshot({path:'.shots/revision-notes-narrow.png'});
 // Free-text questions still reach sensory replies while an input puzzle is active.
 const c=await browser.newContext();const saved={...fresh(),started:true,stage:9};await c.addInitScript(({key,saved})=>localStorage.setItem(key,JSON.stringify(saved)),{key,saved});const p=await c.newPage();p.on('pageerror',e=>errors.push(e.message));await p.goto(base+'/case/pane.html?pane=chat');await p.getByRole('textbox',{name:'输入消息'}).fill('为什么');await p.locator('.wx-send').click();await p.locator('.wx-messages').getByText('日志你看到哪了？我这边灯一直闪。',{exact:true}).waitFor();assert.equal(await p.evaluate(()=>window.__game.state.stage),9);
 assert.deepEqual(errors,[]);fs.writeFileSync('.shots/revision-interaction-qa.json',JSON.stringify({success:true,checks:['four-second typing without message','90-second idle escalation capped at three','no time-driven progression or failure','390px notebook','sensory why response during input'],errors},null,2));console.log('Idle, narrow layout and sensory reply checks passed');await c.close();await context.close();
}finally{await browser.close()}
