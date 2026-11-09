// Ao publicar uma nova versão, altere VERSION para renovar os arquivos offline.
const VERSION='2026-11-09-cabecalho';
const PREFIX='jotabasso-offline-'+self.registration.scope;
const CACHE=PREFIX+VERSION;
const home=new URL('./index.html',self.location.href).href;
const assets=['./index.html','./manifest.webmanifest','./app-icon.png','./favicon.png'].map(p=>new URL(p,self.location.href).href);
self.addEventListener('install',event=>event.waitUntil((async()=>{
  const cache=await caches.open(CACHE);
  await cache.addAll(assets.map(url=>new Request(url,{cache:'reload'})));
  await self.skipWaiting();
})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
  for(const key of await caches.keys())if(key.startsWith(PREFIX)&&key!==CACHE)await caches.delete(key);
  await self.clients.claim();
})()));
self.addEventListener('fetch',event=>{
  const req=event.request,url=new URL(req.url);
  if(req.method!=='GET'||url.origin!==self.location.origin||!url.href.startsWith(self.registration.scope))return;
  if(req.mode==='navigate'){
    event.respondWith((async()=>{
      const cache=await caches.open(CACHE);
      // O HTML desta versão já foi baixado integralmente na instalação.
      const saved=await cache.match(home);
      return saved||fetch(req);
    })());
  }else if(assets.includes(url.origin+url.pathname))event.respondWith(caches.match(req,{ignoreSearch:true}).then(saved=>saved||fetch(req)));
});
