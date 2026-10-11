import {readdir,readFile,writeFile} from 'node:fs/promises';
import {join,relative} from 'node:path';
import {createHash} from 'node:crypto';
const root='dist';
async function walk(dir){const paths=[];for(const e of await readdir(dir,{withFileTypes:true})){const path=join(dir,e.name);if(e.isDirectory())paths.push(...await walk(path));else if(e.name!=='sw.js')paths.push(path)}return paths}
const files=await walk(root);const hash=createHash('sha256');for(const f of files)hash.update(await readFile(f));const version=hash.digest('hex').slice(0,16);
const paths=['./',...files.map(p=>'./'+relative(root,p).replaceAll('\\','/'))];
await writeFile(join(root,'sw.js'),`const CACHE='firered-${version}';const FILES=${JSON.stringify(paths)};
self.addEventListener('install',event=>event.waitUntil((async()=>{const cache=await caches.open(CACHE);for(let i=0;i<FILES.length;i+=20)await cache.addAll(FILES.slice(i,i+20));await self.skipWaiting()})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{for(const key of await caches.keys())if(key.startsWith('firered-')&&key!==CACHE)await caches.delete(key);await self.clients.claim()})()));
self.addEventListener('fetch',event=>{if(event.request.method!=='GET'||new URL(event.request.url).origin!==location.origin)return;event.respondWith((async()=>{const cached=await caches.match(event.request,{ignoreSearch:true});if(cached)return cached;try{return await fetch(event.request)}catch(error){if(event.request.mode==='navigate')return await caches.match(new URL('./index.html',self.registration.scope).href);throw error}})())});
`);
console.log(`Offline cache: ${paths.length} resources, version ${version}`);
