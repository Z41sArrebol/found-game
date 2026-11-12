import './terminals.js';
let overlay;
function cloneDesktop(){
 const source=document.querySelector('#__next')||document.body,copy=source.cloneNode(true);
 const originalFrames=source.querySelectorAll('iframe');
 copy.querySelectorAll('iframe').forEach((frame,i)=>{
  const panel=document.createElement('div');panel.style.cssText='width:100%;height:100%;overflow:hidden;background:#edf0ee';
  try{
   const doc=originalFrames[i].contentDocument,content=doc?.querySelector('#app');
   if(content){
    const shadow=panel.attachShadow({mode:'open'}),staticContent=content.cloneNode(true);
    // A cloned iframe no longer has its original base URL or stylesheet scope.
    doc.querySelectorAll('link[rel="stylesheet"]').forEach(link=>{const style=document.createElement('link');style.rel='stylesheet';style.href=link.href;shadow.append(style)});
    staticContent.querySelectorAll('[src]').forEach(el=>el.setAttribute('src',new URL(el.getAttribute('src'),doc.baseURI).href));
    staticContent.querySelectorAll('[style]').forEach(el=>{el.style.cssText=el.style.cssText.replace(/url\(["']?([^"')]+)["']?\)/g,(_,url)=>`url("${new URL(url,doc.baseURI).href}")`)});
    shadow.append(staticContent);
   }
  }catch{ /* A missing or closing app remains an empty pane in the snapshot. */ }
  frame.replaceWith(panel);
 });
 copy.querySelectorAll('script,video,audio').forEach(el=>el.remove());copy.querySelectorAll('[id]').forEach(el=>el.removeAttribute('id'));return copy;
}
function recursive(){
 if(overlay)return;overlay=document.createElement('section');overlay.style.cssText='position:fixed;inset:5%;z-index:2147483647;background:#050807;border:1px solid #6e8179;overflow:hidden;pointer-events:none;color:#c8d5cf';
 overlay.innerHTML='<header style="padding:10px;background:#283a32">新视点 · 041-R-07</header>';
 let mount=overlay;for(let i=0;i<3;i++){const copy=cloneDesktop();copy.style.cssText='position:absolute;inset:35px 0 0;transform:scale(.72);transform-origin:top left;width:139%;height:139%;overflow:hidden;filter:brightness(.7)';mount.append(copy);const next=document.createElement('div');next.style.cssText='position:absolute;left:32%;top:26%;width:50%;height:55%;background:#030504;border:1px solid #7a8980;overflow:hidden';next.innerHTML='<header style="padding:8px">新视点 · 041-R-07</header>';copy.append(next);mount=next}document.body.append(overlay);const snapshot=overlay;setTimeout(()=>{snapshot.remove();if(overlay===snapshot)overlay=null},2000);
}
addEventListener('message',event=>{
 if(event.origin!==location.origin||![...document.querySelectorAll('iframe')].some(f=>f.contentWindow===event.source))return;
 if(event.data?.type==='no-outside:recursive')recursive();
 if(event.data?.type==='no-outside:rescue-open'&&overlay?.tagName==='SECTION'){overlay.remove();overlay=null}
 if(event.data?.type==='no-outside:rescue-open'&&!overlay){overlay=document.createElement('iframe');overlay.src='/case/pane.html?pane=notes&rescue=1';overlay.title='沿绳返回';overlay.style.cssText='position:fixed;inset:0;width:100%;height:100%;z-index:2147483646;border:0;background:#030505';document.body.append(overlay)}
 if(event.data?.type==='no-outside:rescue-close'&&overlay?.contentWindow===event.source){overlay.remove();overlay=null}
});
