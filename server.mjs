import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const legacy=process.env.NO_OUTSIDE_LEGACY==='1';
const root=path.resolve(fileURLToPath(new URL(legacy?'./dist/':'./desktop/out/',import.meta.url)));
if(!fs.existsSync(path.join(root,'index.html')))throw new Error('桌面尚未构建，请先运行 npm run build:desktop。');
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.txt':'text/plain; charset=utf-8','.jpg':'image/jpeg','.jpeg':'image/jpeg','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.wasm':'application/wasm','.woff2':'font/woff2','.ico':'image/x-icon','.mp3':'audio/mpeg','.ogg':'audio/ogg','.mp4':'video/mp4'};
const server=http.createServer((req,res)=>{
  res.setHeader('Cross-Origin-Opener-Policy','same-origin');
  res.setHeader('Cross-Origin-Embedder-Policy','credentialless');
  if(req.url==='/health'){res.writeHead(200,{'Content-Type':'text/plain; charset=utf-8'}).end(legacy?'no-outside-v1':'no-outside-daedalos-v2');return}
  let name;try{name=decodeURIComponent(new URL(req.url,'http://localhost').pathname)}catch{res.writeHead(400).end();return}
  const filename=path.resolve(root,'.'+(name==='/'?'/index.html':name));
  if(!filename.startsWith(root+path.sep)){res.writeHead(403).end();return}
  fs.readFile(filename,(err,data)=>{if(err){res.writeHead(404).end('Not found');return}res.writeHead(200,{'Content-Type':mime[path.extname(filename)]||'application/octet-stream','Cache-Control':'no-cache'}).end(data)});
});
const port=Number(process.env.PORT||4178);
server.listen(port,'127.0.0.1',()=>console.log(`Local: http://127.0.0.1:${port}\nEntry: http://127.0.0.1:${port}/forum.html`));
