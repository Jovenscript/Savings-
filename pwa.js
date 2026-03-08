// Registra o Service Worker no navegador
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(registration => {
                console.log('Gems Elite PWA: ServiceWorker registrado com sucesso!', registration.scope);
            })
            .catch(error => {
                console.log('Gems Elite PWA: Falha ao registrar o ServiceWorker:', error);
            });
    });
}