// js/mobile.js
document.addEventListener('DOMContentLoaded', () => {
    // 1. Cria o Botão Hambúrguer dinamicamente
    const hamburgerBtn = document.createElement('button');
    hamburgerBtn.id = 'hamburgerBtn';
    hamburgerBtn.innerHTML = '☰';
    document.body.appendChild(hamburgerBtn);

    // 2. Cria o Fundo Escuro (Overlay)
    const overlay = document.createElement('div');
    overlay.id = 'mobileOverlay';
    document.body.appendChild(overlay);

    const sidebar = document.querySelector('.sidebar');

    // 3. Função Mágica de Abrir/Fechar
    function toggleMenu() {
        sidebar.classList.toggle('active');
        overlay.classList.toggle('active');
    }

    // 4. Ativa os cliques
    hamburgerBtn.addEventListener('click', toggleMenu);
    overlay.addEventListener('click', toggleMenu);

    // 5. Fecha o menu automaticamente quando você clica em um link (opcional, mas melhora a experiência)
    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                toggleMenu();
            }
        });
    });
});