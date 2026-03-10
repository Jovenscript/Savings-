// pwa.js
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(registration => {
                console.log('✅ Gems Elite PWA: ServiceWorker registrado com sucesso!', registration.scope);
            })
            .catch(error => {
                console.error('❌ Gems Elite PWA: Falha ao registrar o ServiceWorker:', error);
            });
    });
}

// Escuta o evento de instalação para permitir que o usuário instale pelo navegador
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    console.log('💎 Gems Elite pronto para instalação na tela inicial!');
});
