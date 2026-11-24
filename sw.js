// Offline-Cache fuer LifeCounterByTMB (The Magical Brick)
// Die Seite selbst kommt zuerst aus dem Netz (Updates sind sofort da), nach 3 s oder offline aus dem Cache.
// Icons, Manifest und Schriften kommen zuerst aus dem Cache.
const CACHE='tmb-lifecounter-v2';
const DATEIEN=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./icon-180.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(DATEIEN)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
function ausCache(req){return caches.match(req,{ignoreSearch:true}).then(r=>r||caches.match('./index.html'));}
function netzZuerst(req){
  return new Promise(resolve=>{
    let fertig=false;
    const ende=r=>{if(!fertig&&r){fertig=true;resolve(r);}};
    const uhr=setTimeout(()=>{ausCache(req).then(ende);},3000);
    fetch(req).then(n=>{
      clearTimeout(uhr);
      if(n.ok){const k=n.clone();caches.open(CACHE).then(c=>c.put(req.url.split('?')[0],k));}
      ende(n);
    }).catch(()=>{clearTimeout(uhr);ausCache(req).then(r=>ende(r||Response.error()));});
  });
}
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  if(e.request.mode==='navigate'){e.respondWith(netzZuerst(e.request));return;}
  e.respondWith(caches.match(e.request,{ignoreSearch:true}).then(r=>r||fetch(e.request).then(n=>{
    if(n.ok&&(e.request.url.startsWith(self.location.origin)||e.request.url.includes('fonts.g'))){const k=n.clone();caches.open(CACHE).then(c=>c.put(e.request,k));}
    return n;}).catch(()=>caches.match('./index.html'))));
});
