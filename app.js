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
