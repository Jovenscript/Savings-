// Nome e versão do Cache. Se você mudar algo grande no app no futuro, mude para 'gems-elite-v2' para atualizar os celulares.
const CACHE_NAME = 'gems-elite-v1';

// Lista de todos os arquivos que precisam funcionar sem internet
const urlsToCache = [
    './',
    './index.html',
    './transacoes.html',
    './planejamento.html',
    './calendario-financeiro.html',
    './metas.html',
    './style.css',
    './app.js',
    './dashboard.js',
    './transacoes.js',
    './metas.js',
    './mobile.js',
    './sync.js',
    'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css',
    'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js',
    'https://cdn.jsdelivr.net/npm/chart.js'
];

// Instala o Service Worker e salva os arquivos no cache
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Cache aberto e arquivos salvos com sucesso!');
                return cache.addAll(urlsToCache);
            })
    );
});

// Intercepta as requisições (Se estiver sem internet, puxa do cache)
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Se o arquivo estiver no cache, retorna ele. Se não, busca na internet.
                return response || fetch(event.request);
            })
    );
});

// Limpa caches antigos quando o app for atualizado
self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});