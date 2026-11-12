import {chromium} from 'playwright';
import fs from 'node:fs';
import assert from 'node:assert/strict';
const base=process.env.QA_URL||'http://127.0.0.1:4178',key='no-outside.save.v1';
const browser=await chromium.launch({channel:'chrome',headless:true});
const errors=[];
function watch(page){page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400&&r.url().startsWith(base))errors.push(r.status()+' '+r.url())})}
const context=await browser.newContext({viewport:{width:1600,height:1000}});
try{
 const page=await context.newPage();watch(page);const started=Date.now();await page.goto(base);await page.frameLocator('iframe[title="回声"]').locator('.wx-messages').waitFor();
 await page.waitForFunction(()=>['--before-background','--after-background'].some(k=>document.documentElement.style.getPropertyValue(k).includes('url(')));const readyMs=Date.now()-started;
 await page.screenshot({path:'.shots/revision-desktop.png'});
 const forum=await context.newPage();watch(forum);await forum.goto(base+'/forum.html');await page.waitForFunction(()=>window.noOutsideTerminalCount===2);await forum.waitForFunction(()=>window.noOutsideTerminalCount===2);await forum.close();await page.waitForFunction(()=>window.noOutsideTerminalCount===1);
 // Verify the actual native reader window opens from a shortcut.
 await page.getByText('原始影像',{exact:true}).dblclick();await page.getByText(/客厅西窗\.jpg/).first().dblclick();await page.frameLocator('iframe[title="调查档案"]').locator('.photo-stage').waitFor();
 const reader=page.frameLocator('iframe[title="调查档案"]');for(let i=0;i<5;i++)await reader.locator('[data-action="zoom-in"]').click();for(const id of ['far-lamp','far-towel','far-bag']){const spot=reader.locator(`[data-action="photo-cite"][data-id="${id}"]`);await spot.focus();await spot.press('Enter');await reader.locator('[data-action="dismiss-cite"]').press('Enter')}
 await page.waitForFunction(k=>JSON.parse(localStorage.getItem(k)).stage===1,key);await page.frameLocator('iframe[title="回声"]').locator('.wx-messages').getByText('图收到了。是有点像反射。',{exact:true}).waitFor();
 await page.close();await context.close();
 const final=JSON.parse(fs.readFileSync('.shots/revision-final-save.json','utf8'));final.ending=null;final.rescue=0;final.flags=final.flags.filter(x=>x!=='outside-confirmed');final.settings.rescueMode='pointer';
 const c=await browser.newContext({viewport:{width:1600,height:1000}});await c.addInitScript(({key,save})=>{if(!localStorage.getItem(key))localStorage.setItem(key,JSON.stringify(save))},{key,save:final});const game=await c.newPage();watch(game);await game.goto(base);await game.frameLocator('iframe[title="回声"]').locator('.wx-messages').waitFor();await game.getByText('调查便签',{exact:true}).first().dblclick();const notes=game.frameLocator('iframe[title="调查便签"]');await notes.locator('[data-action="start-rescue"]').click();const rope=game.frameLocator('iframe[title="沿绳返回"]');await rope.locator('.tactile').waitFor();
 await game.mouse.move(192,780);await game.mouse.down();await game.mouse.move(700,900);await game.mouse.up();await rope.getByText('手里空了。回到上一个绳结。',{exact:true}).waitFor();
 await game.mouse.move(192,780);await game.mouse.down();for(const [x,y] of [[.24,.78],[.24,.56],[.42,.56],[.42,.34],[.62,.34],[.62,.18],[.83,.18]])await game.mouse.move(x*1600,y*1000,{steps:40});
 await rope.getByText('物业：门楔动了，我看见了。',{exact:true}).waitFor();await game.screenshot({path:'.shots/revision-rope.png'});await game.mouse.up();await game.locator('iframe[title="沿绳返回"]').waitFor({state:'detached'});await notes.locator('[data-action="finish-rescue"][data-id="marked"]').click();await notes.locator('.ending.safe-marked').waitFor();
 // Full-screen clone is a real desktop overlay, with three recursive layers.
 await notes.locator('[data-action="checkpoint"]').click();await game.getByText('空间复核',{exact:true}).first().dblclick();const space=game.frameLocator('iframe[title="空间复核"]');await space.locator('[data-action="complete-map"]').click();await space.locator('[data-action="complete-confirm"]').click();await game.getByText('新视点 · 041-R-07',{exact:true}).first().waitFor();await game.screenshot({path:'.shots/revision-recursive.png'});await notes.locator('.ending.bad').waitFor();
 // Direction-key mode follows the same checkpoints and can wait safely at blue tape.
 await notes.locator('[data-action="checkpoint"]').click();
 await notes.locator('[data-action="settings"]').click();await notes.locator('#rescue-mode').selectOption('keyboard');await notes.locator('[data-action="dialog-close"]').click();
 await notes.locator('[data-action="start-rescue"]').click();const keyboardRope=game.frameLocator('iframe[title="沿绳返回"]');await keyboardRope.locator('.tactile').focus();await game.keyboard.down('Space');
 for(const [tx,ty] of [[.24,.78],[.24,.56],[.42,.56],[.42,.34],[.62,.34],[.62,.18],[.83,.18]]){
   for(let step=0;step<80;step++){const [x,y]=await keyboardRope.locator('.rope-cursor').evaluate(el=>[parseFloat(el.style.left)/100,parseFloat(el.style.top)/100]);if(Math.abs(x-tx)<.002&&Math.abs(y-ty)<.002)break;await game.keyboard.press(Math.abs(tx-x)>Math.abs(ty-y)?tx>x?'ArrowRight':'ArrowLeft':ty>y?'ArrowDown':'ArrowUp');if(step===79)throw Error('Keyboard rope failed to reach checkpoint')}
 }
 await game.keyboard.up('Space');await keyboardRope.getByText('别松。外面还没确认。',{exact:true}).waitFor();await keyboardRope.getByText('物业：门楔动了，我看见了。',{exact:true}).waitFor();await game.keyboard.down('Space');await game.keyboard.up('Space');await game.locator('iframe[title="沿绳返回"]').waitFor({state:'detached'});await notes.locator('[data-action="finish-rescue"]').first().waitFor();
 assert.deepEqual(errors,[]);fs.writeFileSync('.shots/revision-desktop-qa.json',JSON.stringify({success:true,readyMs,checks:['cold desktop','static wallpaper','native shortcut and cross-window progress','two tabs then one terminal','pointer rescue recovery and complete route','outside confirmation','safe-marked','three-layer desktop clone','keyboard rescue and early release recovery'],errors},null,2));console.log(JSON.stringify({success:true,readyMs,errors}));await c.close();
}catch(e){console.error(errors);for(const c of browser.contexts())for(const p of c.pages()){console.error(p.url(),(await p.locator('body').innerText()).slice(0,1200));console.error(p.frames().map(f=>f.url()));await p.screenshot({path:'.shots/desktop-failure.png'})}throw e}finally{await browser.close()}

