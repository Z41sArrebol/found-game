// Count top-level game tabs only. Application iframes are not extra terminals.
if(window.top===window&&!window.__noOutsideTerminals){
 window.__noOutsideTerminals=true;
 const id=crypto.randomUUID(),peers=new Map(),channel=typeof BroadcastChannel==='function'?new BroadcastChannel('no-outside'):null;
 const announce=()=>channel?.postMessage({type:'heartbeat',id});
 const publish=()=>{const now=Date.now();for(const [key,time] of peers)if(now-time>12000)peers.delete(key);const count=1+peers.size;window.noOutsideTerminalCount=count;document.querySelectorAll('[data-terminal-count]').forEach(el=>el.textContent=count);document.querySelectorAll('iframe').forEach(f=>f.contentWindow?.postMessage({type:'no-outside:terminals',count},location.origin))};
 if(channel)channel.onmessage=({data})=>{if(!data||data.id===id||typeof data.id!=='string')return;if(data.type==='bye')peers.delete(data.id);else if(data.type==='heartbeat'){const isNew=!peers.has(data.id);peers.set(data.id,Date.now());if(isNew)announce()}publish()};
 const timer=setInterval(()=>{announce();publish()},2000);announce();publish();
 addEventListener('pagehide',()=>{channel?.postMessage({type:'bye',id});clearInterval(timer);channel?.close()});
}
