// Synthesized locally; no microphone, media stream, or audio files.
export function createSound(){
 let ctx,osc,gain,enabled=false,linked=false,distance=1;
 const owner=crypto.randomUUID(),ownerKey='no-outside.sound-owner';
 const init=()=>{if(!ctx){ctx=new AudioContext();osc=ctx.createOscillator();gain=ctx.createGain();osc.frequency.value=48;gain.gain.value=0;osc.connect(gain).connect(ctx.destination);osc.start()}ctx.resume()};
 const update=()=>{if(!ctx)return;const owns=localStorage.getItem(ownerKey)===owner;gain.gain.setTargetAtTime(enabled&&linked&&owns?.025*distance:0,ctx.currentTime,.08)};
 const receive=e=>{if(e.key==='no-outside.save.v1'){try{enabled=Boolean(JSON.parse(e.newValue)?.audio)}catch{enabled=false}}if(e.key===ownerKey||e.key==='no-outside.save.v1')update()};
 window.addEventListener('storage',receive);
 return {
  enable(value){enabled=value;if(value)init();update()},
  link(value){linked=value;if(value&&enabled)localStorage.setItem(ownerKey,owner);update()},
  proximity(value){distance=Math.max(0,Math.min(1,value));update()},
  pulse(double=false){if(!enabled)return;init();for(let i=0;i<(double?2:1);i++){const o=ctx.createOscillator(),g=ctx.createGain(),t=ctx.currentTime+i*.12;o.type='triangle';o.frequency.value=150;o.connect(g).connect(ctx.destination);g.gain.setValueAtTime(.035,t);g.gain.exponentialRampToValueAtTime(.0001,t+.06);o.start(t);o.stop(t+.07)}},
  pauseBriefly(){if(!ctx)return;gain.gain.cancelScheduledValues(ctx.currentTime);gain.gain.setValueAtTime(0,ctx.currentTime);setTimeout(update,200)},
  close(){window.removeEventListener('storage',receive);ctx?.close()}
 };
}
