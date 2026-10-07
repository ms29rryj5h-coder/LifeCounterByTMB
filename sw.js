// Offline-Cache fuer die Lebenspunkte-App (The Magical Brick)
const CACHE='tmb-lebenspunkte-v1';
const DATEIEN=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./icon-180.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(DATEIEN)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  e.respondWith(caches.match(e.request,{ignoreSearch:true}).then(r=>r||fetch(e.request).then(n=>{
    if(n.ok&&(e.request.url.startsWith(self.location.origin)||e.request.url.includes('fonts.g'))){const k=n.clone();caches.open(CACHE).then(c=>c.put(e.request,k));}
    return n;}).catch(()=>caches.match('./index.html'))));
});
