// js/app.js

// 🛡️ ESCUDO DE PROTEÇÃO (Evita que um celular zerado apague a nuvem)
let escudoAtivado = false;
if (!localStorage.getItem('gemsEliteData')) {
    escudoAtivado = true; // Bloqueia o upload se a memória do celular estiver vazia
}

// ==========================================
// 1. BANCO DE DADOS LOCAL + CACHE INTELIGENTE
// ==========================================
function getData() {
    // Mantém o app rápido lendo do celular primeiro
    return JSON.parse(localStorage.getItem('gemsEliteData')) || {};
}

function saveData(data) {
    // Salva no celular instantaneamente
    localStorage.setItem('gemsEliteData', JSON.stringify(data));

    // Despacha para o Firebase APENAS se o escudo estiver desativado!
    if (!escudoAtivado) {
        sincronizarComFirebase(data);
    } else {
        console.log("🛡️ Upload bloqueado. O app está aguardando o download da nuvem primeiro...");
    }
}

function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

// ==========================================
// 2. MOTOR DE SINCRONIZAÇÃO (FIREBASE)
// ==========================================

async function sincronizarComFirebase(data) {
    if (!window.db) return;

    try {
        const { doc, setDoc } = await import("https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js");
        const docRef = doc(window.db, "sistema", "dados_casal");
        
        // Salva os dados como uma string JSON para manter a estrutura que você já usa
        await setDoc(docRef, { gemsEliteData: JSON.stringify(data) }, { merge: true });
        console.log("☁️ Nuvem atualizada!");
    } catch (error) {
        console.error("Erro ao sincronizar com nuvem:", error);
    }
}

// ==========================================
// 3. RADAR EM TEMPO REAL (ESCUTA O PARCEIRO)
// ==========================================

async function ligarRadarEmTempoReal() {
    try {
        const { doc, onSnapshot } = await import("https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js");
        
        const aguardarBanco = setInterval(() => {
            if (window.db) {
                clearInterval(aguardarBanco);
                
                const docRef = doc(window.db, "sistema", "dados_casal");
                
                // Ouve qualquer mudança vinda do outro aparelho
                onSnapshot(docRef, (snapshot) => {
                    if (snapshot.exists()) {
                        const dadosNuvem = snapshot.data().gemsEliteData;
                        const dadosLocais = localStorage.getItem('gemsEliteData');
                        
                        // Só recarrega se o dado da nuvem for realmente diferente do seu
                        if (dadosNuvem && dadosNuvem !== dadosLocais) {
                            localStorage.setItem('gemsEliteData', dadosNuvem);
                            console.log("🔄 Dados novos do parceiro detectados! Atualizando...");
                            
                            // 🔓 O celular recebeu os dados! Removemos o escudo.
                            if (escudoAtivado) {
                                escudoAtivado = false;
                                console.log("🔓 Escudo desativado. Celular liberado para enviar dados.");
                            }
                            
                            window.location.reload(); 
                        } else if (escudoAtivado && dadosNuvem) {
                            // Se a nuvem e o local são iguais, mas o escudo estava ativo, libera também.
                            escudoAtivado = false;
                        }
                    } else {
                        // Se a nuvem estiver realmente vazia e limpa, remove o escudo para poder criar dados
                        escudoAtivado = false;
                    }
                });
            }
        }, 500);
    } catch (error) {
        console.error("Erro ao ligar radar:", error);
    }
}

// Inicia a escuta assim que o app abre
ligarRadarEmTempoReal();

// ==========================================
// 4. MENU DINÂMICO (O "REACT DE POBRE")
// ==========================================
function injetarMenu() {
    const sidebarElement = document.querySelector('.sidebar');
    
    // Se a página não tiver a tag <nav class="sidebar">, ele aborta
    if (!sidebarElement) return;

    // Pega o nome do arquivo atual (ex: "transacoes.html" ou "")
    let paginaAtual = window.location.pathname.split('/').pop();
    if (paginaAtual === '' || paginaAtual === '/') paginaAtual = 'index.html';

    // O código central do Menu
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
    
    // Aqui nós re-injetamos a lógica de Logout e Resetar que ficava em outros arquivos
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

// Dispara a injeção do menu assim que o HTML carregar
document.addEventListener('DOMContentLoaded', injetarMenu);
