// js/mobile.js
document.addEventListener('DOMContentLoaded', () => {
    // 1. Garante que o Botão Hambúrguer existe
    let hamburgerBtn = document.getElementById('hamburgerBtn');
    if (!hamburgerBtn) {
        hamburgerBtn = document.createElement('button');
        hamburgerBtn.id = 'hamburgerBtn';
        hamburgerBtn.innerHTML = '☰';
        document.body.appendChild(hamburgerBtn);
    }

    // 2. Garante que o Overlay existe
    let overlay = document.getElementById('mobileOverlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'mobileOverlay';
        document.body.appendChild(overlay);
    }

    // 3. Função Master de Abrir/Fechar (Puxa a classe 'active' da sidebar)
    window.toggleMenuGems = function() {
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.getElementById('mobileOverlay');
        
        if (sidebar && overlay) {
            sidebar.classList.toggle('active');
            overlay.classList.toggle('active');
        }
    };

    // 4. Ativa os eventos de clique
    hamburgerBtn.addEventListener('click', window.toggleMenuGems);
    overlay.addEventListener('click', window.toggleMenuGems);

    // 5. Inteligência de Fechamento: Clica em qualquer link do menu e ele fecha
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 768) {
            // Se clicou em um link dentro da sidebar
            if (e.target.closest('.nav-links a')) {
                window.toggleMenuGems();
            }
        }
    });
});
