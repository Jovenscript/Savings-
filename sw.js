// sw.js - O Motor Offline do Gems Elite

const CACHE_NAME = 'gems-elite-v1';

// Lista de arquivos básicos para salvar na memória do celular
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './style.css',
    './app.js',
    './auth.js',
    './manifest.json',
    './pwa.js'
    // Se quiser, depois você pode adicionar as outras telas HTML aqui
];

// 1. INSTALAÇÃO (O app guarda os arquivos no celular)
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('📦 Service Worker: Salvando arquivos em cache...');
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

// 2. ATIVAÇÃO (Limpa lixos de versões antigas)
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('🧹 Service Worker: Limpando cache antigo...');
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// 3. INTERCEPTADOR (A mágica do Offline)
self.addEventListener('fetch', (event) => {
    // Tenta buscar da internet primeiro (para ter sempre o dado mais novo)
    // Se a internet cair, ele pega a versão salva no cache do celular!
    event.respondWith(
        fetch(event.request).catch(() => {
            return caches.match(event.request);
        })
    );
});