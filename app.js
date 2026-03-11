// js/app.js

const confettiScript = document.createElement('script');
confettiScript.src = "https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js";
document.head.appendChild(confettiScript);

window.dispararConfetes = function() {
    if (typeof confetti === 'function') {
        confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 }, colors: ['#9d4edd', '#00f5d4', '#f15bb5'] });
        if (navigator.vibrate) navigator.vibrate(50);
    }
};

window.escudoAtivado = !localStorage.getItem('gemsEliteData'); 

function getData() {
    return JSON.parse(localStorage.getItem('gemsEliteData')) || {};
}

function saveData(data) {
    localStorage.setItem('gemsEliteData', JSON.stringify(data));
    if (!window.escudoAtivado) sincronizarComFirebase(data);
}

function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

// 💎 O MOTOR DE TEMA DEFINITIVO (11 Combinações Imersivas) 💎
function aplicarCoresGlobais() {
    const dados = getData();
    if (dados && dados.config && dados.config.corPreferida) {
        const corEscolhida = dados.config.corPreferida;
        
        // Paletas de Cores Premium criadas para combinar perfeitamente
        const paletas = {
            // 1. Cyberpunk (O Padrão Original)
            '#00f5d4': { bgDark: '#0d0221', baseColor: '#9d4edd', popColor: '#00f5d4', mutedText: '#e0aaff' },
            // 2. Natureza
            '#57cc99': { bgDark: '#031f16', baseColor: '#2a9d8f', popColor: '#57cc99', mutedText: '#b3f0d4' },
            // 3. Ouro Imperial
            '#fee440': { bgDark: '#1f1a04', baseColor: '#e6aa68', popColor: '#fee440', mutedText: '#ffea99' },
            // 4. Miami Vice
            '#f15bb5': { bgDark: '#1f0312', baseColor: '#b5179e', popColor: '#f15bb5', mutedText: '#ffb6e6' },
            // 5. Fundo do Mar
            '#00bbf9': { bgDark: '#01171f', baseColor: '#0077b6', popColor: '#00bbf9', mutedText: '#ade8f4' },
            // 6. Drácula
            '#ff0a54': { bgDark: '#1a0105', baseColor: '#9e0031', popColor: '#ff0a54', mutedText: '#ffb3c6' },
            // 7. Vulcão
            '#ff7f51': { bgDark: '#1c0a00', baseColor: '#9c6644', popColor: '#ff7f51', mutedText: '#ffcdb2' },
            // 8. Galáxia
            '#b14aed': { bgDark: '#0b0217', baseColor: '#3a0ca3', popColor: '#b14aed', mutedText: '#d9a5fa' },
            // 9. Platina (Minimalista)
            '#e0e1dd': { bgDark: '#0d131a', baseColor: '#415a77', popColor: '#e0e1dd', mutedText: '#778da9' },
            // 10. Matrix (Hacker)
            '#00ff00': { bgDark: '#001400', baseColor: '#004b23', popColor: '#00ff00', mutedText: '#b3ffb3' },
            // 11. Bilionário (Ônix e Dourado)
            '#ffd700': { bgDark: '#0a0a0a', baseColor: '#594a00', popColor: '#ffd700', mutedText: '#ffeca8' }
        };

        // Pega a paleta da cor escolhida, ou volta pro Cyberpunk se der erro
        const tema = paletas[corEscolhida] || paletas['#00f5d4'];

        // Injeta as cores diretamente na raiz do CSS (O App inteiro muda de alma instantaneamente)
        document.documentElement.style.setProperty('--bg-dark', tema.bgDark);
        document.documentElement.style.setProperty('--primary-purple', tema.baseColor); 
        document.documentElement.style.setProperty('--primary-cyan', tema.popColor);   
        document.documentElement.style.setProperty('--text-muted', tema.mutedText);
        
        // Garante o fundo físico
        document.body.style.backgroundColor = tema.bgDark;
        document.body.style.backgroundImage = "none"; 
    }
}
aplicarCoresGlobais();

async function sincronizarComFirebase(data) {
    if (!window.db) return;
    const userEmail = localStorage.getItem('gemsEliteLogin');
    if (!userEmail) return;

    try {
        const { doc, setDoc } = await import("https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js");
        const docRef = doc(window.db, "usuarios", userEmail); 
        await setDoc(docRef, { gemsEliteData: JSON.stringify(data) }, { merge: true });
    } catch (error) { console.error("Erro nuvem:", error); }
}

async function ligarRadarEmTempoReal() {
    try {
        const { doc, onSnapshot } = await import("https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js");
        const aguardarBanco = setInterval(() => {
            const userEmail = localStorage.getItem('gemsEliteLogin');
            if (window.db && userEmail) {
                clearInterval(aguardarBanco);
                const docRef = doc(window.db, "usuarios", userEmail);
                onSnapshot(docRef, (snapshot) => {
                    if (snapshot.exists()) {
                        const dadosNuvem = snapshot.data().gemsEliteData;
                        if (dadosNuvem && dadosNuvem !== localStorage.getItem('gemsEliteData')) {
                            localStorage.setItem('gemsEliteData', dadosNuvem);
                            window.escudoAtivado = false;
                            window.location.reload(); 
                        } else if (window.escudoAtivado && dadosNuvem) window.escudoAtivado = false;
                    } else window.escudoAtivado = false;
                });
            }
        }, 500);
    } catch (error) { console.error("Erro radar:", error); }
}
ligarRadarEmTempoReal();

document.addEventListener('DOMContentLoaded', () => {
    const btnExportar = document.getElementById('btnExportar');
    if (btnExportar) {
        btnExportar.addEventListener('click', (e) => {
            e.preventDefault();
            const todosOsDados = {};
            for (let i = 0; i < localStorage.length; i++) {
                const chave = localStorage.key(i);
                todosOsDados[chave] = localStorage.getItem(chave);
            }
            if (Object.keys(todosOsDados).length === 0) return alert("Sem dados!");
            const jsonString = JSON.stringify(todosOsDados, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = `GemsElite_Backup_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.json`;
            a.click();
        });
    }
});

// ==========================================
// MENU LATERAL DINÂMICO
// ==========================================
function injetarElementosGlobais() {
    const sidebarElement = document.querySelector('.sidebar');
    const dados = getData();
    const config = dados.config || {};
    const modulos = config.modulosAtivos || ['financas', 'metas', 'casamento']; 
    
    if (sidebarElement) {
        let paginaAtual = window.location.pathname.split('/').pop();
        if (paginaAtual === '' || paginaAtual === '/') paginaAtual = 'index.html';

        let menuHTML = `<div class="logo">GEMSELITE</div><ul class="nav-links">`;

        menuHTML += `
            <li class="nav-category">📊 Rotina & Finanças</li>
            <li class="${paginaAtual === 'index.html' ? 'active' : ''}"><a href="index.html">🏠 Início (Visão Geral)</a></li>
            <li class="${paginaAtual === 'transacoes.html' ? 'active' : ''}"><a href="transacoes.html">💸 Lançar Transações</a></li>
            <li class="${paginaAtual === 'planejamento.html' ? 'active' : ''}"><a href="planejamento.html">📝 Planejamento Fixo</a></li>
            <li class="${paginaAtual === 'calendario-financeiro.html' ? 'active' : ''}"><a href="calendario-financeiro.html">📅 Calendário Completo</a></li>
        `;

        if (modulos.includes('metas')) {
            menuHTML += `
                <li class="nav-category">🎯 Grandes Objetivos</li>
                <li class="${paginaAtual === 'metas.html' ? 'active' : ''}"><a href="metas.html">🏡 Sonhos & Metas</a></li>
            `;
        }

        if (modulos.includes('casamento')) {
            menuHTML += `
                <li class="nav-category">💍 Projeto Casamento</li>
                <li class="${paginaAtual === 'convidados.html' ? 'active' : ''}"><a href="convidados.html">💝 Match de Convidados</a></li>
                <li class="${paginaAtual === 'orcamento-casamento.html' ? 'active' : ''}"><a href="orcamento-casamento.html">💰 Orçamento Casamento</a></li>
            `;
        }

        menuHTML += `
                <li style="margin-top: 30px; border-top: 1px dashed rgba(255,255,255,0.2); padding-top: 15px;">
                    <a href="#" id="btnLogout" style="color: #ff4b4b; text-align: center;">Sair do Sistema</a>
                </li>
                <li style="margin-top: 10px;">
                    <a href="#" id="resetAppBtn" style="color: var(--danger-red); font-weight: bold; text-align: center;">🗑️ Resetar App</a>
                </li>
            </ul>
        `;

        sidebarElement.innerHTML = menuHTML;
        
        const links = sidebarElement.querySelectorAll('a');
        links.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                if (href === paginaAtual) {
                    e.preventDefault(); 
                    if(typeof window.toggleMenuGems === 'function') {
                        const sidebar = document.querySelector('.sidebar');
                        if(sidebar && sidebar.classList.contains('active')) window.toggleMenuGems();
                    }
                }
            });
        });

        const btnLogout = document.getElementById('btnLogout');
        if(btnLogout) btnLogout.addEventListener('click', (e) => { 
            e.preventDefault(); 
            if(typeof window.logoutDoSistema === 'function') window.logoutDoSistema();
            else if(confirm("Sair?")) { localStorage.removeItem('gemsEliteLogin'); window.location.href = 'login.html'; }
        });

        const resetBtn = document.getElementById('resetAppBtn');
        if (resetBtn) resetBtn.addEventListener('click', (e) => { e.preventDefault(); if(prompt("⚠️ Digite 'DESTRUIR':") === "DESTRUIR") { localStorage.removeItem('gemsEliteData'); alert("App resetado."); window.location.href = 'index.html'; }});
    }

    if (window.location.pathname.indexOf('login.html') === -1) {
        const fab = document.createElement('button');
        fab.id = 'fabLancar';
        fab.className = 'fab-button';
        fab.innerHTML = '+';
        document.body.appendChild(fab);
        fab.addEventListener('click', () => { window.location.href = 'transacoes.html'; });
    }
}
document.addEventListener('DOMContentLoaded', injetarElementosGlobais);
