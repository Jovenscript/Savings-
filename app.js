// js/app.js

// 🛡️ IMPORTAÇÃO DA BIBLIOTECA DE CONFETES
const confettiScript = document.createElement('script');
confettiScript.src = "https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js";
document.head.appendChild(confettiScript);

window.dispararConfetes = function() {
    if (typeof confetti === 'function') {
        confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 }, colors: ['#9d4edd', '#00f5d4', '#f15bb5'] });
        if (navigator.vibrate) navigator.vibrate(50);
    }
};

// Tornando o escudo global para o index.html conseguir desativar depois do Onboarding
window.escudoAtivado = !localStorage.getItem('gemsEliteData'); 

function getData() {
    return JSON.parse(localStorage.getItem('gemsEliteData')) || {};
}

function saveData(data) {
    localStorage.setItem('gemsEliteData', JSON.stringify(data));
    // Se o escudo não estiver ativo, despacha pra nuvem!
    if (!window.escudoAtivado) {
        sincronizarComFirebase(data);
    } else {
        console.log("🛡️ Upload bloqueado. Aguardando a nuvem...");
    }
}

function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

async function sincronizarComFirebase(data) {
    if (!window.db) return;
    try {
        const { doc, setDoc } = await import("https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js");
        const docRef = doc(window.db, "sistema", "dados_casal"); 
        await setDoc(docRef, { gemsEliteData: JSON.stringify(data) }, { merge: true });
        console.log("☁️ Nuvem atualizada!");
    } catch (error) {
        console.error("Erro ao sincronizar:", error);
    }
}

async function ligarRadarEmTempoReal() {
    try {
        const { doc, onSnapshot } = await import("https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js");
        const aguardarBanco = setInterval(() => {
            if (window.db) {
                clearInterval(aguardarBanco);
                const docRef = doc(window.db, "sistema", "dados_casal");
                
                onSnapshot(docRef, (snapshot) => {
                    if (snapshot.exists()) {
                        const dadosNuvem = snapshot.data().gemsEliteData;
                        const dadosLocais = localStorage.getItem('gemsEliteData');
                        
                        if (dadosNuvem && dadosNuvem !== dadosLocais) {
                            localStorage.setItem('gemsEliteData', dadosNuvem);
                            if (window.escudoAtivado) window.escudoAtivado = false;
                            window.location.reload(); 
                        } else if (window.escudoAtivado && dadosNuvem) {
                            window.escudoAtivado = false;
                        }
                    } else {
                        window.escudoAtivado = false;
                    }
                });
            }
        }, 500);
    } catch (error) {
        console.error("Erro radar:", error);
    }
}
ligarRadarEmTempoReal();

// ==========================================
// MENU INTELIGENTE (RENDERIZAÇÃO POR MÓDULOS)
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

        // Módulo 1: FINANÇAS (Sempre ativo)
        menuHTML += `
            <li class="nav-category">📊 Rotina & Finanças</li>
            <li class="${paginaAtual === 'index.html' ? 'active' : ''}"><a href="index.html">🏠 Início (Visão Geral)</a></li>
            <li class="${paginaAtual === 'transacoes.html' ? 'active' : ''}"><a href="transacoes.html">💸 Lançar Transações</a></li>
            <li class="${paginaAtual === 'planejamento.html' ? 'active' : ''}"><a href="planejamento.html">📝 Planejamento Fixo</a></li>
            <li class="${paginaAtual === 'calendario-financeiro.html' ? 'active' : ''}"><a href="calendario-financeiro.html">📅 Calendário Completo</a></li>
        `;

        // Módulo 2: METAS
        if (modulos.includes('metas')) {
            menuHTML += `
                <li class="nav-category">🎯 Grandes Objetivos</li>
                <li class="${paginaAtual === 'metas.html' ? 'active' : ''}"><a href="metas.html">🏡 Amortização & Metas</a></li>
            `;
        }

        // Módulo 3: CASAMENTO
        if (modulos.includes('casamento')) {
            menuHTML += `
                <li class="nav-category">💍 Projeto Casamento</li>
                <li class="${paginaAtual === 'convidados.html' ? 'active' : ''}"><a href="convidados.html">💝 Match de Convidados</a></li>
                <li class="${paginaAtual === 'orcamento-casamento.html' ? 'active' : ''}"><a href="orcamento-casamento.html">💰 Orçamento Casamento</a></li>
            `;
        }

        // Rodapé de Sistema
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
        
        const btnLogout = document.getElementById('btnLogout');
        if(btnLogout) btnLogout.addEventListener('click', (e) => { e.preventDefault(); if(confirm("Tem certeza que deseja sair?")) { localStorage.removeItem('gemsEliteLogin'); window.location.href = 'login.html'; }});

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
