// sw.js - O Motor Offline do Gems Elite

const CACHE_NAME = 'gems-elite-v2';

// Lista de arquivos atualizada com o módulo de casamento
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './transacoes.html',
    './planejamento.html',
    './calendario-financeiro.html',
    './metas.html',
    './convidados.html',
    './orcamento-casamento.html',
    './style.css',
    './app.js',
    './auth.js',
    './pwa.js',
    './manifest.json',
    './icon-192.png',
    './icon-512.png'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('📦 Service Worker: Salvando arquivos em cache...');
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

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

self.addEventListener('fetch', (event) => {
    event.respondWith(
        fetch(event.request).catch(() => {
            return caches.match(event.request);
        })
    );
});
