import fs from 'node:fs/promises';
import path from 'node:path';
import {docs} from '../dist/content.js';
const root=path.resolve(import.meta.dirname,'../desktop');
const put=async(p,s)=>{await fs.mkdir(path.dirname(path.join(root,p)),{recursive:true});await fs.writeFile(path.join(root,p),s)};
const replace=async(p,a,b)=>{const file=path.join(root,p);let s=await fs.readFile(file,'utf8');if(!s.includes(a)){if(s.includes(b))return;throw Error('Missing anchor '+p)}await fs.writeFile(file,s.replace(a,b))};
await fs.mkdir(path.join(root,'public/case'),{recursive:true});
for(const file of ['content.js','engine.js','style.css','interface.css','sim.css','revision.css','rescue.js','sound.js','terminals.js','desktop-effects.js'])await fs.copyFile(path.resolve(import.meta.dirname,'../dist',file),path.join(root,'public/case',file));
await fs.cp(path.resolve(import.meta.dirname,'../dist/assets'),path.join(root,'public/case/assets'),{recursive:true});
for(const name of ['wallpaper','wallpaper-stage9']){await fs.mkdir(path.join(root,'public/System/Wallpapers'),{recursive:true});await fs.copyFile(path.resolve(import.meta.dirname,'../dist/assets/'+name+'.png'),path.join(root,'public/System/Wallpapers/'+name+'.png'))}
for(const size of ['16x16','32x32','48x48','96x96','144x144'])for(const name of ['echo','margin','compass'])await fs.copyFile(path.join(root,'public/System/Icons/'+name+'.svg'),path.join(root,'public/System/Icons/'+size+'/'+name+'.svg'));
let app=await fs.readFile(path.resolve(import.meta.dirname,'../dist/app.js'),'utf8');
app=app.replace("const $=s=>document.querySelector(s);",`const $=s=>document.querySelector(s);
const params=new URLSearchParams(location.search), pane=params.get('pane')||'notes';
const send=(app,doc)=>parent.postMessage({type:'no-outside:open',app,doc},location.origin);`);
app=app.replace(/function render\(\)\{[^\n]+\}/,`function render(){if(waitForEnding())return;if(state.ending){if(pane==='notes'){renderEnding();return}if(!ui.endingNotified){ui.endingNotified=true;send('notes')}}else ui.endingNotified=false;renderDesktop()}`);
app=app.replace("if(previous===6){ui.active=false;", "if(previous===6){ui.active=false;state.linkActive=false;");
app=app.replace("if(a==='register'){flag(state,'registered');ui.active=true;", "if(a==='register'){flag(state,'registered');ui.active=true;state.linkActive=true;");
app=app.replace("if(a==='toggle-link'){ui.active=!ui.active;", "if(a==='toggle-link'){ui.active=!ui.active;state.linkActive=ui.active;");
app=app.replace(/function renderDesktop\(\)\{[\s\S]*?\nfunction windowHTML/,`function renderDesktop(){
 const old=$('.window-content');const scroll=old?.scrollTop||0;
 const views={browser:browserView,chat:chatView,notes:notesView,reader:readerView,space:spaceView};
 $('#app').innerHTML='<main class="window-content pane-'+pane+'" data-win="'+pane+'">'+(views[pane]||notesView)()+'</main>';
 const current=$('.window-content');if(current)current.scrollTop=scroll;
 const chat=$('.wx-messages');if(chat)chat.scrollTop=chat.scrollHeight;
 bindWindowGestures();
}
function windowHTML`);
app=app.replace(/function focus\(id\)\{[^\n]+\}/,`function focus(id){if(!wins[id])return;wins[id].open=true;wins[id].min=false;if(id==='chat')ui.unread=0;if(id!==pane)send(id,ui.reader)}`);
app=app.replace(/function openDoc\(id\)\{[^\n]+\}/,`function openDoc(id){
 touch();if(id==='space'){openWindow('space');return}
 if(id==='room')flag(state,'room-viewed');else visit(state,id);
 ui.reader=id;ui.videoFrame=0;ui.zoom=1;ui.photoOrigin=[50,50];ui.observation='';save();
 if(pane!=='reader')send('reader',id);else parent.postMessage({type:'no-outside:title',title:id==='room'?'041-W03_客厅西窗.jpg':docs.find(d=>d.id===id)?.title||'影像查看器'},location.origin);
 render();
}`);
app=app.replace(/window.addEventListener\('resize',[^\n]+\);/,`window.addEventListener('resize',()=>render());`);
app=app.replace(/\nrender\(\);\s*$/,`
window.addEventListener('storage',e=>{if(e.key===TYPE_KEY){ui.typing=Boolean(e.newValue)&&Date.now()-Number(JSON.parse(e.newValue||'0'))<10000;if(pane==='chat')render()}if(e.key===STORAGE){state=hydrate(e.newValue);ui.active=Boolean(state.linkActive);render()}});
ui.active=Boolean(state.linkActive);
if(!state.started){state.started=true;seedIntro()}
if(pane==='reader'){openDoc(params.get('doc')||'room')}else render();
`);
await put('public/case/pane.js',app);
await put('public/case/pane.html',`<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>没有窗外</title><link rel="stylesheet" href="style.css"><link rel="stylesheet" href="interface.css"><link rel="stylesheet" href="pane.css"><link rel="stylesheet" href="sim.css"><link rel="stylesheet" href="revision.css"></head><body><div id="app"></div><div id="toast" role="status"></div><dialog id="dialog"></dialog><script type="module" src="pane.js"></script></body></html>`);
await put('public/case/pane.css',`
:root{color-scheme:light;--text:#252a30;--muted:#626a73;--line:#dce1e6;--accent:#0078d4;--serif:"Noto Serif SC","Songti SC",serif;--sans:"Segoe UI","Noto Sans SC","Microsoft YaHei",sans-serif}
html,body,#app{width:100%;height:100%;min-width:0;margin:0;background:#f7f8fa;overflow:hidden;font-family:var(--sans);font-size:15px;color:var(--text)}
*{box-sizing:border-box}button,input,select,textarea{font-family:inherit}button{cursor:default}button:focus-visible,input:focus-visible,textarea:focus-visible,select:focus-visible{outline:2px solid #0078d4;outline-offset:2px}input,textarea,.doc,.message p,.notebook{user-select:text}
#app>.window-content{position:static;width:100%;height:100%;max-height:none;overflow:auto;background:#f7f8fa;color:#252a30;border:0}
.toolbar{min-height:50px;background:#fff;border-bottom:1px solid #dce1e6;padding:10px 18px;gap:12px}.toolbar button,.compare-bar button{background:#edf1f5;border:1px solid #d3dce5;color:#345c81;border-radius:3px;padding:8px 12px}.toolbar input{color:#252a30}.searchbar{background:#fff;border:1px solid #b7bdc5;border-radius:3px;min-height:34px}.searchbar input{font-size:15px}.searchbar button{background:#0078d4;color:white;align-self:stretch;border-radius:0 2px 2px 0}
.doc{max-width:820px;padding:32px 38px 56px;margin:0 auto;font-family:var(--sans);font-size:16px;line-height:2;color:#2b3036}.doc h1{font-size:25px;line-height:1.5;margin-bottom:22px}.doc h2{font-size:19px;line-height:1.7}.doc p,.doc li{line-height:2}.doc img{border-radius:0}.doc blockquote{background:#eef1f5;border-left:3px solid #91a3b5;color:#3d4650}.doc .meta,.doc figcaption{font-size:13px;line-height:1.9;color:#68717a}.doc table{background:#fff}.doc td,.doc th{border-color:#dce1e6}.doc .notice,.notice{background:#edf3f9;color:#344e68;border-color:#d7e2ee}
.chat-body{height:100%;display:flex;flex-direction:column;background:#f5f5f5}.chat-head{background:#fff;min-height:76px;padding:18px 22px;border-bottom:1px solid #e3e4e6}.avatar{background:#758e7b;color:white;border-radius:5px}.chat-head small{font-size:13px;line-height:1.9;color:#81878d}.chat-messages{flex:1;min-height:0;padding:22px;overflow:auto}.message{margin-bottom:22px}.message p{background:#fff;color:#30353b;border:1px solid #e4e6e8;border-radius:5px;font-size:15px;line-height:1.95;padding:12px 15px;max-width:94%}.message.self p{background:#d8edc5;border-color:#cce3b8}.message time{color:#8b9097;font-size:13px;margin-bottom:8px}.attachment{background:white;border:1px solid #dce1e6;border-radius:4px;color:#3c5268;line-height:1.8;padding:12px}.chat-quick{background:#fff;border-top:1px solid #e4e6e8;padding:12px 18px;gap:8px}.chat-quick button{font-size:13px;line-height:1.8;padding:7px 10px;background:#f4f5f6;color:#46515c;border:1px solid #e4e6e8;border-radius:3px}.chat-footer{background:#fff;color:#9298a0;font-size:13px;padding:8px 18px 12px}
.notebook{padding:28px 30px 42px;max-width:790px;margin:auto}.notebook h3{font-size:21px;line-height:1.65;margin:22px 0 14px;color:#222b35}.case-phase,.case-lead{color:#78828d;font-size:13px;line-height:1.9}.case-progress i{background:#e1e5ea}.case-progress i.done{background:#0078d4}.open-case button,.rescue-options button{background:white;color:#37424e;border:1px solid #d8dee6;border-radius:3px;padding:14px 16px;font-size:15px;line-height:1.9;margin-bottom:10px;text-align:left}.open-case button:hover,.rescue-options button:hover{background:#eef5fd;border-color:#8cbce4}.hint{background:#edf3f9;color:#40566d;border:1px solid #d9e6f2;border-radius:3px;font-size:14px;line-height:1.95;padding:16px}.answer-feedback{color:#856340;font-size:14px;line-height:1.9}.text-button{color:#0078d4}.saving,.muted{color:#7e8791}.personal-notes textarea{background:white;color:#303b46;border:1px solid #d5dce4;border-radius:3px;font-size:15px;line-height:1.9}.evidence-pins button{color:#345b7e;font-size:14px;line-height:1.8}.timeline-item select{background:white;color:#2b3e50;border:1px solid #cad3de;line-height:2;padding:10px;font-size:14px}
.browser-home{padding:70px 28px;background:#fff;min-height:calc(100% - 54px)}.browser-logo{color:#416b84;font-size:37px;font-weight:500}.search-tagline{color:#929aa3}.search-results{padding:26px 36px 50px;background:white;min-height:calc(100% - 54px)}.search-result{margin-bottom:28px}.search-result>button{font-size:19px;color:#1459a0;line-height:1.7}.search-result p{font-size:15px;line-height:1.95;color:#54606b}.result-url,.search-count{font-size:13px;color:#78848f;line-height:1.8}.search-suggestions button{background:#edf2f7;color:#52677d;border:0;border-radius:3px;font-size:14px;padding:8px 12px}
.photo-body{height:100%;display:flex;flex-direction:column;background:#22272c}.photo-stage{flex:1;min-height:240px;background:#15191d;display:flex;align-items:center;justify-content:center;container-type:size}.photo-sheet{width:min(100cqw,calc(100cqh * 1.5));height:auto;aspect-ratio:3/2;flex:none}.photo-sheet>img{width:100%;height:100%;object-fit:contain}.photo-tools{color:#34404c}.photo-caption,.compare-bar{background:#f8f9fa;color:#66717c;padding:12px 18px;font-size:13px;line-height:1.8}.observation{background:#e8eff6;color:#354e67;font-size:15px;line-height:1.9;padding:14px 20px}.compare-bar button{color:#246295}.pane-reader>.toolbar .address{font-size:13px;color:#6f7a85}.photo-hotspot{color:white;background:#132a3dbd;border:1px solid #c5dced99}.maintenance-label{font-family:var(--sans)}
.video-body{background:#20262d;color:#e5e9ee;min-height:100%;padding-bottom:20px}.video-notes{font-size:15px;line-height:1.9}.video-step{font-size:14px;line-height:1.8}
.space-body{background:#171c22;color:#c8d1dd;min-height:100%;font-size:14px;line-height:1.8}.space-body button{font-size:14px}.space-sidebar{font-size:14px;line-height:1.9}.spatial-log{font-size:13px;line-height:1.9}.space-buttons{flex-wrap:wrap}.space-buttons button{min-height:40px;padding:9px 13px}.space-sidebar .text-button{color:#a7c6e6!important}
.primary{background:#0078d4;color:white;border:1px solid #0078d4;border-radius:3px}.secondary{background:#fff;color:#485868;border:1px solid #ccd5de;border-radius:3px}.ending{min-height:100%;height:auto;overflow:auto;padding:38px 28px;background:#f6f7f9;color:#29343e}.ending-inner{max-width:660px}.ending h1{font-size:34px;line-height:1.6}.ending-lines{font-size:16px;line-height:2}.ending-sub,.ending-note,.eyebrow{color:#687a8c}.ending button{margin:16px 8px 0 0}
#toast{position:fixed;bottom:16px;left:50%;transform:translateX(-50%);z-index:20;background:#263442;color:#fff;border:1px solid #41576c;border-radius:4px;font-size:14px;line-height:1.8;padding:12px 18px;width:max-content;max-width:90%}dialog{background:#fff;color:#303e4b;border:1px solid #bec8d3;border-radius:4px;padding:28px;max-width:520px;width:calc(100% - 40px);line-height:1.9}dialog::backdrop{background:#17222d70}dialog h3{font-size:21px;margin-bottom:14px}dialog p{font-size:15px;margin:12px 0}.dialog-actions{gap:10px;flex-wrap:wrap}.dialog-actions button{font-size:14px;padding:10px 16px}
@media(max-width:500px){.doc{padding:24px}.notebook{padding:24px}.search-results{padding:24px}.toolbar{padding:10px}.chat-messages{padding:16px}}
`);
const shortcut=(app,url,icon,comment='')=>`[InternetShortcut]\nBaseURL=${app}\nURL=${url}\nIconFile=/System/Icons/${icon}\nComment=${comment}\n`;
const desktop='public/Users/Public/Desktop';
for(const [name,app,url,icon] of [
 ['HC_ARCHIVE 移动硬盘','FileExplorer','/Users/Public/Documents/HC_ARCHIVE','mounted.webp'],
 ['陆遥','CaseChat','','echo.svg'],['芦苇搜索','CaseSearch','','compass.svg'],['调查便签','CaseNotes','','margin.svg'],['空间复核','CaseSpace','','executable.webp']
])await put(`${desktop}/${name}.url`,shortcut(app,url,icon));
const archive='public/Users/Public/Documents/HC_ARCHIVE';
await put(`${archive}/现场回传/desktop.ini`,'[ShellClassInfo]\nIconFile=/System/Icons/documents.webp\n');
await put(`${archive}/原始影像/041-W03_客厅西窗.jpg.url`,shortcut('CaseReader','room','photo.webp','原始记录，含局部放大观察'));
const received=[];
for(const d of docs.filter(d=>d.kind!=='web')){
 const name=d.title.replace(/[<>:"/\\|?*]/g,'_')+'.url';
 const body=shortcut('CaseReader',d.id,d.kind==='video'?'vlc.webp':'documents.webp');
 if(d.folder==='现场回传'){
  await fs.rm(path.join(root,`${archive}/${d.folder}/${name}`),{force:true});
  received.push({name,shortcut:body,stage:d.release||6});
 }else await put(`${archive}/${d.folder}/${name}`,body);
}
await put('public/case/received-files.json',JSON.stringify(received,null,2));
await fs.rm(path.join(root,`${archive}/开始之前.txt`),{force:true});
await put(`${archive}/开始之前.txt.url`,shortcut('CaseReader','welcome','documents.webp'));
await put(`${desktop}/开始之前.url`,shortcut('CaseReader','welcome','documents.webp'));
for(const [name,app,icon] of [['陆遥','CaseChat','echo.svg'],['芦苇搜索','CaseSearch','compass.svg'],['调查便签','CaseNotes','margin.svg'],['空间复核','CaseSpace','executable.webp']])await put(`public/Users/Public/Start Menu/调查工具/${name}.url`,shortcut(app,'',icon));
await put('public/session.json',JSON.stringify({aiEnabled:false,wallpaperImage:'/System/Wallpapers/wallpaper.png',themeName:'defaultTheme',windowStates:{}},null,2));
const directory=(await fs.readFile(path.join(root,'contexts/process/directory.ts'),'utf8')).replace(/^  Case(?:Chat|Notes|Search|Reader|Space):[^\n]*\n/gm,'');
const defs=[['CaseChat','陆遥','echo.svg',740,640],['CaseNotes','调查便签','margin.svg',640,760],['CaseSearch','芦苇搜索','compass.svg',880,640],['CaseReader','影像查看器','photo.webp',920,720],['CaseSpace','空间复核 · HC-19-041','executable.webp',1000,700]].map(([id,title,icon,width,height])=>`  ${id}: { Component: dynamic(() => import("components/apps/CaseApp")), defaultSize: {width:${width},height:${height}},icon:"/System/Icons/${icon}",title:"${title}",backgroundColor:"#f7f8fa",singleton:true },`).join('\n');
let dirSrc=directory.replace('const directory: Processes = {','const directory: Processes = {\n'+defs);
dirSrc=dirSrc.replace(/(FileExplorer: \{[\s\S]{0,220}?width: )\d+,/,'$1390,');
await put('contexts/process/directory.ts',dirSrc);
await replace('styles/defaultTheme/formats.ts',`"'Segoe UI', system-ui, Roboto, 'Helvetica Neue', sans-serif"`,`"'Segoe UI', 'Noto Sans SC', 'Microsoft YaHei', system-ui, sans-serif"`);
let sizes=await fs.readFile(path.join(root,'styles/defaultTheme/sizes.ts'),'utf8');
sizes=sizes.replaceAll('fontSize: "12px"','fontSize: "13px"').replace('maxIconTextDisplayWidth: 70','maxIconTextDisplayWidth: 90').replace('gridEntryWidth: "74px"','gridEntryWidth: "94px"').replace('gridEntryHeight: "70px"','gridEntryHeight: "80px"');
await put('styles/defaultTheme/sizes.ts',sizes);
await put('public/NO-OUTSIDE-CREDITS.txt','没有窗外\nDesktop environment: daedalOS by Dustin Brett, MIT License.\nhttps://github.com/DustinBrett/daedalOS\n\nOriginal game story, investigation logic and generated illustrations are in the parent no-outside project. See ASSETS.md.\n');
console.log('Native desktop integration prepared.');
