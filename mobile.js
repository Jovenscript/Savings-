// js/mobile.js

document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Garante que o Overlay sempre exista no Body
    let overlay = document.getElementById('mobileOverlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'mobileOverlay';
        document.body.appendChild(overlay);
    }

    // 2. Função Blindada de Toggle
    window.toggleMenuGems = function() {
        const sidebar = document.querySelector('.sidebar');
        const overlayBox = document.getElementById('mobileOverlay');
        
        if (sidebar) sidebar.classList.toggle('active');
        if (overlayBox) overlayBox.classList.toggle('active');
    };

    // 3. Event Delegation (A Grande Correção)
    // Invés de tentar achar o botão na hora que a página carrega, 
    // ele escuta qualquer clique no documento inteiro. Se o clique for no botão, ele age.
    document.addEventListener('click', (e) => {
        // Se clicou no Botão Hambúrguer (ou dentro dele)
        if (e.target.id === 'hamburgerBtn' || e.target.closest('#hamburgerBtn')) {
            e.preventDefault();
            e.stopPropagation();
            window.toggleMenuGems();
            return; // Para a execução aqui
        }

        // Se clicou no Overlay Escuro (para fechar)
        if (e.target.id === 'mobileOverlay') {
            window.toggleMenuGems();
            return;
        }

        // Se estiver no mobile e clicar em um link real do menu (para fechar e ir pra página)
        if (window.innerWidth <= 768) {
            const sidebarAtiva = document.querySelector('.sidebar.active');
            const ehUmLinkDoMenu = e.target.closest('.nav-links a');
            
            if (sidebarAtiva && ehUmLinkDoMenu) {
                // Não previne o default aqui, para a página poder carregar
                window.toggleMenuGems();
            }
        }
    });

});
