// js/app.js

// 🛡️ IMPORTAÇÃO DA BIBLIOTECA DE CONFETES (Gamificação)
const confettiScript = document.createElement('script');
confettiScript.src = "https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js";
document.head.appendChild(confettiScript);

// Função global de confetes (Pode chamar em qualquer tela)
window.dispararConfetes = function() {
    if (typeof confetti === 'function') {
        confetti({
            particleCount: 150,
            spread: 80,
            origin: { y: 0.6 },
            colors: ['#9d4edd', '#00f5d4', '#f15bb5']
        });
        if (navigator.vibrate) navigator.vibrate(50);
    }
};

let escudoAtivado = false;
if (!localStorage.getItem('gemsEliteData')) {
    escudoAtivado = true; 
}

function getData() {
    return JSON.parse(localStorage.getItem('gemsEliteData')) || {};
}

function saveData(data) {
    localStorage.setItem('gemsEliteData', JSON.stringify(data));
    if (!escudoAtivado) {
        sincronizarComFirebase(data);
    } else {
        console.log("🛡️ Upload bloqueado. O app está aguardando o download da nuvem primeiro...");
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
                            console.log("🔄 Dados novos do parceiro detectados! Atualizando...");
                            
                            if (escudoAtivado) {
                                escudoAtivado = false;
                                console.log("🔓 Escudo desativado. Celular liberado para enviar dados.");
                            }
                            window.location.reload(); 
                        } else if (escudoAtivado && dadosNuvem) {
                            escudoAtivado = false;
                        }
                    } else {
                        escudoAtivado = false;
                    }
                });
            }
        }, 500);
    } catch (error) {
        console.error("Erro ao ligar radar:", error);
    }
}

ligarRadarEmTempoReal();

function injetarElementosGlobais() {
    const sidebarElement = document.querySelector('.sidebar');
    
    if (sidebarElement) {
        let paginaAtual = window.location.pathname.split('/').pop();
        if (paginaAtual === '' || paginaAtual === '/') paginaAtual = 'index.html';

        sidebarElement.innerHTML = `
            <div class="logo">GEMSELITE</div>
            <ul class="nav-links">
                <li class="nav-category">📊 Rotina & Finanças</li>
                <li class="${paginaAtual === 'index.html' ? 'active' : ''}"><a href="index.html">🏠 Início (Visão Geral)</a></li>
                <li class="${paginaAtual === 'transacoes.html' ? 'active' : ''}"><a href="transacoes.html">💸 Lançar Transações</a></li>
                <li class="${paginaAtual === 'planejamento.html' ? 'active' : ''}"><a href="planejamento.html">📝 Planejamento Fixo</a></li>
                <li class="${paginaAtual === 'calendario-financeiro.html' ? 'active' : ''}"><a href="calendario-financeiro.html">📅 Calendário Completo</a></li>

                <li class="nav-category">🎯 Grandes Objetivos</li>
                <li class="${paginaAtual === 'metas.html' ? 'active' : ''}"><a href="metas.html">🏡 Amortização & Metas</a></li>

                <li class="nav-category">💍 Projeto 29/08/2026</li>
                <li class="${paginaAtual === 'convidados.html' ? 'active' : ''}"><a href="convidados.html">💝 Match de Convidados</a></li>
                <li class="${paginaAtual === 'orcamento-casamento.html' ? 'active' : ''}"><a href="orcamento-casamento.html">💰 Orçamento Casamento</a></li>
                
                <li style="margin-top: 30px; border-top: 1px dashed rgba(255,255,255,0.2); padding-top: 15px;">
                    <a href="#" id="btnLogout" style="color: #ff4b4b; text-align: center;">Sair do Sistema</a>
                </li>
                <li style="margin-top: 10px;">
                    <a href="#" id="resetAppBtn" style="color: var(--danger-red); font-weight: bold; text-align: center;">🗑️ Resetar App</a>
                </li>
            </ul>
        `;
        
        const btnLogout = document.getElementById('btnLogout');
        if(btnLogout) {
            btnLogout.addEventListener('click', (e) => {
                e.preventDefault();
                if(confirm("Tem certeza que deseja sair do sistema?")) {
                    localStorage.removeItem('gemsEliteLogin');
                    window.location.href = 'login.html';
                }
            });
        }

        const resetBtn = document.getElementById('resetAppBtn');
        if (resetBtn) {
            resetBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const senha = prompt("⚠️ ÁREA DE PERIGO ⚠️\nIsso apagará TODOS os seus dados!\nDigite 'DESTRUIR' para confirmar:");
                if (senha === "DESTRUIR") {
                    localStorage.removeItem('gemsEliteData');
                    alert("App resetado. A página será recarregada.");
                    window.location.reload();
                } else if (senha !== null) {
                    alert("Senha incorreta. Ação cancelada.");
                }
            });
        }
    }

    if (window.location.pathname.indexOf('login.html') === -1) {
        const fab = document.createElement('button');
        fab.id = 'fabLancar';
        fab.className = 'fab-button';
        fab.innerHTML = '+';
        document.body.appendChild(fab);

        fab.addEventListener('click', () => {
            let paginaAtual = window.location.pathname.split('/').pop();
            
            if (paginaAtual === 'transacoes.html') {
                const painelManual = document.getElementById('painelManual');
                if (painelManual) {
                    painelManual.scrollIntoView({ behavior: 'smooth' });
                    setTimeout(() => document.getElementById('descManual').focus(), 500);
                }
            } else {
                window.location.href = 'transacoes.html';
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', injetarElementosGlobais);
