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

// ==========================================
// 🎨 MOTOR GLOBAL DE CORES (Resolve o bug do verde/roxo)
// ==========================================
function aplicarCoresGlobais() {
    const dados = getData();
    if (dados && dados.config && dados.config.corPreferida) {
        const cor = dados.config.corPreferida;
        document.documentElement.style.setProperty('--primary-cyan', cor);
        document.documentElement.style.setProperty('--primary-purple', cor + '88');
    }
}
// Roda imediatamente para pintar a tela antes de você ver
aplicarCoresGlobais();

// ==========================================
// ☁️ CLOUD SAAS - SINCRONIZAÇÃO
// ==========================================
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

// ==========================================
// 💾 A LÓGICA DE BACKUP GLOBAL
// ==========================================
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
            if (Object.keys(todosOsDados).length === 0) return alert("Você ainda não tem dados para exportar!");
            
            const jsonString = JSON.stringify(todosOsDados, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `GemsElite_Backup_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        });
    }

    const btnImportar = document.getElementById('btnImportar');
    if (btnImportar) {
        btnImportar.addEventListener('change', function(e) {
            const arquivo = e.target.files[0];
            if (!arquivo) return;
            const leitor = new FileReader();
            leitor.onload = function(event) {
                try {
                    const dadosImportados = JSON.parse(event.target.result); 
                    if (confirm("Isso vai substituir TODOS os dados deste celular. Deseja continuar?")) {
                        localStorage.clear();
                        for (const chave in dadosImportados) {
                            localStorage.setItem(chave, dadosImportados[chave]);
                        }
                        alert("Dados sincronizados com sucesso! O sistema vai reiniciar.");
                        window.location.reload(); 
                    }
                } catch (erro) { alert("Erro: Arquivo de backup inválido."); }
            };
            leitor.readAsText(arquivo);
        });
    }

    window.migrarParaNuvem = async function() {
        if (!window.db) return alert("Banco não conectado.");
        const todosOsDados = {};
        for (let i = 0; i < localStorage.length; i++) {
            const chave = localStorage.key(i);
            todosOsDados[chave] = localStorage.getItem(chave);
        }
        if (Object.keys(todosOsDados).length === 0) return;

        try {
            const { doc, setDoc } = await import("https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js");
            const userEmail = localStorage.getItem('gemsEliteLogin');
            const referenciaBanco = doc(window.db, "usuarios", userEmail);
            await setDoc(referenciaBanco, todosOsDados);
            alert("✅ SUCESSO! Dados migrados para a nuvem.");
        } catch (erro) { console.error("Erro:", erro); }
    };
});

// ==========================================
// MENU INTELIGENTE
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
                <li class="${paginaAtual === 'metas.html' ? 'active' : ''}"><a href="metas.html">🏡 Amortização & Metas</a></li>
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
                    document.getElementById('appMainContainer').classList.remove('sidebar-active');
                    if(document.getElementById('mobileOverlay')) document.getElementById('mobileOverlay').classList.remove('active');
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
