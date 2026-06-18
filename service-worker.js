const CACHE_NAME='ikun-fund-v1-8-1';
const CORE_ASSETS=[
  '/',
  '/index.html',
  '/site.css',
  '/app.js',
  '/site-enhancements.js',
  '/runtime-optimizer.js',
  '/portfolio-pro.js',
  '/trade-editor.js',
  '/data-maintenance.js',
  '/ai-summary-rules.js',
  '/manager-board.js',
  '/hot-theme-shortcuts.js',
  '/sector-flow-board.js',
  '/sector-flow-board.css',
  '/section-guides.js',
  '/section-guides.css',
  '/portfolio-pro.css',
  '/ai-summary-rules.css',
  '/manager-board.css',
  '/favicon.svg',
  '/manifest.json',
  '/icon-192.svg',
  '/icon-512.svg'
];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(CORE_ASSETS)).catch(()=>{}));self.skipWaiting()});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k)))));self.clients.claim()});
self.addEventListener('fetch',event=>{const req=event.request;if(req.method!=='GET')return;const url=new URL(req.url);if(url.origin!==self.location.origin)return;if(url.pathname.startsWith('/api/'))return;event.respondWith(caches.match(req,{ignoreSearch:true}).then(cached=>cached||fetch(req).then(res=>{const copy=res.clone();caches.open(CACHE_NAME).then(cache=>cache.put(req,copy)).catch(()=>{});return res}).catch(()=>cached)))})
