const CACHE='cuentas-taxi-v9';
const ARCHIVOS=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./apple-touch-icon.png'];
/* Al instalar: se descargan los archivos saltándose la caché del navegador */
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>Promise.all(ARCHIVOS.map(u=>fetch(new Request(u,{cache:'reload'})).then(r=>{ if(r.ok) return c.put(u,r); }).catch(()=>{})))).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE).map(x=>caches.delete(x)))).then(()=>self.clients.claim()));
});
/* Con conexión: siempre la versión más nueva. Sin conexión: la guardada. */
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET') return;
  const url=new URL(e.request.url);
  if(url.origin!==location.origin) return;
  e.respondWith(
    fetch(e.request.url,{cache:'no-cache'}).then(res=>{
      if(res&&res.ok){ const copia=res.clone(); caches.open(CACHE).then(c=>c.put(e.request,copia)); }
      return res;
    }).catch(()=>caches.match(e.request).then(r=>r||caches.match('./index.html')))
  );
});
