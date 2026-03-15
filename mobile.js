// js/mobile.js

document.addEventListener('DOMContentLoaded', () => {
    
    let overlay = document.getElementById('mobileOverlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'mobileOverlay';
        document.body.appendChild(overlay);
    }

    window.toggleMenuGems = function() {
        const sidebar = document.querySelector('.sidebar');
        const overlayBox = document.getElementById('mobileOverlay');
        
        if (sidebar) sidebar.classList.toggle('active');
        if (overlayBox) overlayBox.classList.toggle('active');
    };

    document.addEventListener('click', (e) => {
        if (e.target.id === 'hamburgerBtn' || e.target.closest('#hamburgerBtn')) {
            e.preventDefault();
            e.stopPropagation();
            window.toggleMenuGems();
            return;
        }

        if (e.target.id === 'mobileOverlay') {
            window.toggleMenuGems();
            return;
        }

        if (window.innerWidth <= 768) {
            const sidebarAtiva = document.querySelector('.sidebar.active');
            const ehUmLinkDoMenu = e.target.closest('.nav-links a');
            if (sidebarAtiva && ehUmLinkDoMenu) {
                window.toggleMenuGems();
            }
        }
    });

    // ==========================================
    // 🚀 MAGIC NAVIGATION BAR (MOBILE)
    // ==========================================
    function criarMagicNav() {
        if (document.getElementById('magicNavContainer') || window.innerWidth > 768) return;

        const dados = JSON.parse(localStorage.getItem('gemsEliteData')) || {};
        const modulos = (dados.config && dados.config.modulosAtivos) ? dados.config.modulosAtivos : ['financas', 'metas', 'casamento'];
        
        let paginaAtual = window.location.pathname.split('/').pop();
        if (paginaAtual === '' || paginaAtual === '/') paginaAtual = 'index.html';

        const navItems = [
            { url: 'index.html', icon: '🏠', base: ['index.html', 'planejamento.html', 'calendario-financeiro.html'] },
            { url: 'transacoes.html', icon: '💸', base: ['transacoes.html'] }
        ];

        if (modulos.includes('metas')) {
            navItems.push({ url: 'metas.html', icon: '🎯', base: ['metas.html'] });
        }
        if (modulos.includes('casamento')) {
            navItems.push({ url: 'orcamento-casamento.html', icon: '💍', base: ['orcamento-casamento.html', 'convidados.html'] });
        }

        const navContainer = document.createElement('div');
        navContainer.className = 'magic-nav';
        navContainer.id = 'magicNavContainer';

        const ul = document.createElement('ul');
        let activeIndex = 0;

        navItems.forEach((item, index) => {
            const li = document.createElement('li');
            
            if (item.base.includes(paginaAtual)) {
                li.className = 'active';
                activeIndex = index;
            }

            li.innerHTML = `<a href="${item.url}"><span class="icon">${item.icon}</span></a>`;
            
            li.addEventListener('click', function() {
                document.querySelectorAll('.magic-nav li').forEach(el => el.classList.remove('active'));
                this.classList.add('active');
                const indicator = document.querySelector('.magic-indicator');
                const liWidth = 100 / navItems.length;
                indicator.style.left = `calc(${index * liWidth}% + ${liWidth / 2}% - 30px)`;
            });

            ul.appendChild(li);
        });

        const indicator = document.createElement('div');
        indicator.className = 'magic-indicator';
        ul.appendChild(indicator);
        navContainer.appendChild(ul);
        document.body.appendChild(navContainer);

        setTimeout(() => {
            const liWidth = 100 / navItems.length;
            indicator.style.left = `calc(${activeIndex * liWidth}% + ${liWidth / 2}% - 30px)`;
        }, 50);
    }

    criarMagicNav();
});
