import {chromium} from 'playwright';
import fs from 'node:fs';
import assert from 'node:assert/strict';
const base=process.env.QA_URL||'http://127.0.0.1:4178';
const browser=await chromium.launch({channel:'chrome',headless:true});
const context=await browser.newContext({viewport:{width:1200,height:900}});
const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
const key='no-outside.save.v1';fs.mkdirSync('.shots',{recursive:true});
const action=(name,id)=>page.locator(`[data-action="${name}"]${id===undefined?'':`[data-id="${id}"]`}`);
async function view(pane,doc='room'){await page.goto(`${base}/case/pane.html?pane=${pane}&doc=${doc}`);await page.waitForFunction(()=>!!window.__game);}
async function stage(n){await page.waitForFunction(([key,n])=>JSON.parse(localStorage.getItem(key)).stage===n,[key,n]);}
async function collect(id){const item=page.locator(`[data-cite="${id}"]`);await item.focus();await item.press('Enter');await action('collect-cite').click();}
async function clearTray(){await view('notes');while(await action('remove-cite').count())await action('remove-cite').first().click();}
async function present(ids){await view('chat');await action('show-evidence').click();for(const id of ids)await page.locator(`[name="cite"][value="${id}"]`).check();await page.locator('[data-form="cite"] button.primary').click();}
async function say(text){await view('chat');await page.getByRole('textbox',{name:'输入消息'}).fill(text);await page.locator('.wx-send').click();}
async function inspect(id){if(id==='label'){const r=await page.locator('.photo-stage').boundingBox();await page.mouse.move(r.x+r.width*.5,r.y+r.height*.6);await page.mouse.down();await page.mouse.move(r.x+r.width*.5,r.y+r.height*.25,{steps:12});await page.mouse.up()}await action('photo-cite',id).click();await action('dismiss-cite').click();}
async function ending(name){await page.waitForSelector('.ending.'+name);assert.equal(await page.evaluate(k=>JSON.parse(localStorage.getItem(k)).ending,key),name)}
try{
 await view('reader');assert.equal(await action('photo-cite','far-lamp').isDisabled(),true);
 for(let i=0;i<5;i++)await action('zoom-in').click();
 for(const id of ['far-lamp','far-towel','far-bag'])await inspect(id);await stage(1);await inspect('label');
 await view('reader','ad');await say('二号楼');await stage(2);
 await view('reader','plan');await collect('plan:west-wall');
 await view('reader','exterior');await collect('exterior:caption');
 await present(['plan:west-wall']);await stage(2);
 await present(['plan:west-wall','exterior:caption']);await stage(3);await clearTray();
 await view('reader','notes');await view('reader','mail');await view('notes');
 for(const [i,value] of ['observe','bag','test','retreat','meeting','invoice'].entries())await page.locator(`[name="slot${i}"]`).selectOption(value);
 await page.locator('[data-form="timeline"] button').click();await stage(4);
 await view('reader','cup');await action('cup-frame','16').click();assert.match(await page.locator('.cup-pane.near').getAttribute('style'),/cup-hand/);assert.match(await page.locator('.cup-pane.far').getAttribute('style'),/room/);await action('cup-frame','48').click();await collect('cup:hand');await page.screenshot({path:'.shots/revision-cup.png'});
 await say('12秒');await stage(4);await say('约2秒');await stage(4);await present(['cup:hand']);await stage(5);await clearTray();
 for(const id of ['company','archives','manual'])await view('reader',id);
 await view('space');for(const id of [0,1,2])await action('anchor',id).click();await stage(6);
 await view('reader','entrance');await view('space');await action('register','clinic').click();await stage(6);await action('register','corridor').click();await stage(7);
 await view('reader','outside');await view('space');await action('toggle-link').click();await action('toggle-link').click();
 await view('reader','trial');await collect('trial:paused');await collect('trial:active');await present(['trial:paused','trial:active']);await stage(8);await clearTray();
 await view('reader','green');await collect('green:inspection');await view('reader','entrance');await collect('entrance:markers');await present(['green:inspection','entrance:markers']);await stage(9);
 await view('reader','log');await view('reader','ceiling');await action('video-frame','3').first().click();await say('11.20');await stage(10);
 await view('reader','experiment');await page.getByRole('textbox',{name:'R-03 密码'}).fill('wrong');await page.locator('[data-form="unlock"] button').click();assert.equal(await page.locator('[data-form="unlock"]').count(),1);await page.getByRole('textbox',{name:'R-03 密码'}).fill('qingwei_1107');await page.locator('[data-form="unlock"] button').click();await page.waitForSelector('[data-cite="experiment:return"]');
 await view('reader','rope');await view('notes');for(const [i,v] of ['return','broken','closed'].entries())await page.locator(`[name="slot${i}"]`).selectOption(v);await page.locator('[data-form="assembly"] button').click();await stage(11);
 // Bad ending and exact checkpoint restore, then both safe endings.
 await view('space');await action('complete-map').click();await action('complete-confirm').click();await view('notes');await ending('bad');await action('checkpoint').click();await stage(11);
 await action('settings').click();await page.locator('#rescue-mode').selectOption('simple');await action('dialog-close').click();
 await action('rescue',1).click();assert.equal(await page.evaluate(()=>window.__game.state.rescue),0);
 await action('rescue',0).click();await action('rescue',1).click();await action('rescue',2).click();assert.equal(await page.evaluate(()=>window.__game.state.rescue),2);await page.waitForFunction(()=>window.__game.state.flags.includes('outside-confirmed'));await action('rescue',2).click();assert.equal(await action('finish-rescue','marked').count(),0);await action('finish-rescue').click();await ending('safe');await page.screenshot({path:'.shots/revision-safe.png'});
 await action('checkpoint').click();await view('reader','trace');await view('notes');for(const id of [0,1])await action('rescue',id).click();await page.waitForFunction(()=>window.__game.state.flags.includes('outside-confirmed'));await action('rescue',2).click();await action('finish-rescue','marked').click();await ending('safe-marked');
 const forum=await context.newPage();forum.on('pageerror',e=>errors.push(e.message));await forum.goto(base+'/forum.html');await forum.getByText('凌晨门楔动了一下，监控里没人。',{exact:true}).waitFor();await forum.locator('[data-page="2"]').click();await forum.getByText('别补齐。',{exact:true}).waitFor();await forum.close();
 fs.writeFileSync('.shots/revision-final-save.json',await page.evaluate(k=>localStorage.getItem(k),key));
 assert.deepEqual(errors,[]);
 fs.writeFileSync('.shots/revision-qa.json',JSON.stringify({success:true,checks:['12 nodes via UI','evidence groups and wrong submission','frame offset and hand citation','password gate','photo selection','timeline and assembly','outside confirmation gate','safe/safe-marked/bad','forum second page'],errors},null,2));
 console.log('Revision UI path passed');
}catch(e){await page.screenshot({path:'.shots/revision-failure.png'});console.error(await page.evaluate(()=>({state:window.__game?.state,body:document.body.innerText.slice(-1500)})));throw e}finally{await context.close();await browser.close()}
