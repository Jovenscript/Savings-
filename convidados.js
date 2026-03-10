// convidados.js

let tinderSwiper = null;

document.addEventListener('DOMContentLoaded', () => {
    const checkDados = setInterval(() => {
        if (typeof getData === 'function') {
            clearInterval(checkDados);
            renderCards();
        }
    }, 200);

    const form = document.getElementById('formManualGuest');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const input = document.getElementById('manualName');
            adicionarNomes([input.value]);
            input.value = '';
        });
    }
});

function renderCards() {
    const wrapper = document.getElementById('tinderWrapper');
    const dados = getData();
    if (!dados.casamento) dados.casamento = { convidados: [] };
    
    // Pega todos os pendentes para atualizar o contador
    const todosPendentes = dados.casamento.convidados.filter(g => g.status === 'pending');
    document.getElementById('counter').innerText = `${todosPendentes.length} aguardando decisão`;

    // 🚀 OTIMIZAÇÃO: Carrega um baralho de 100 cartas. (Fluidez máxima!)
    const pendentesRender = todosPendentes.slice(0, 100);

    wrapper.innerHTML = '';
    
    if (todosPendentes.length === 0) {
        wrapper.innerHTML = `<div class="swiper-slide guest-card"><h2>🎉 Fim da Lista!</h2><p>Tudo pronto para o grande dia.</p></div>`;
    } else {
        pendentesRender.forEach(g => {
            const slide = document.createElement('div');
            slide.className = 'swiper-slide guest-card';
            slide.dataset.id = g.id;
            slide.innerHTML = `<div class="guest-name">${g.name}</div><p style="color:var(--text-muted)">Vai estar presente?</p>`;
            wrapper.appendChild(slide);
        });
    }

    if (tinderSwiper) tinderSwiper.destroy(true, true);
    tinderSwiper = new Swiper(".tinderSwiper", { 
        effect: "cards", 
        grabCursor: true,
        cardsEffect: { perSlideOffset: 8, perSlideRotate: 2, rotate: true, slideShadows: false }
    });

    // Atualiza as listas lá embaixo
    renderListasDeStatus(dados.casamento.convidados);
}

// ==========================================
// 🧠 LÓGICA NINJA DE ANIMAÇÃO E REMOÇÃO
// ==========================================
window.decidirStatus = (status) => {
    if (!tinderSwiper || !tinderSwiper.slides.length) return;
    
    const activeIndex = tinderSwiper.activeIndex;
    const activeSlide = tinderSwiper.slides[activeIndex];
    const id = activeSlide ? activeSlide.dataset.id : null;
    
    if (id) {
        // 1. Atualiza no Banco de Dados
        const dados = getData();
        const g = dados.casamento.convidados.find(x => x.id === id);
        
        if (g) { 
            g.status = status; 
            saveData(dados); 
            
            // 2. Faz a carta "Voar" para o lado correspondente (Animação)
            activeSlide.style.transition = 'all 0.25s ease-out';
            activeSlide.style.transform = status === 'yes' ? 'translate(200px, -50px) rotate(30deg)' : 'translate(-200px, -50px) rotate(-30deg)';
            activeSlide.style.opacity = '0';
            
            // 3. Apaga a carta da memória e atualiza as listas em tempo real!
            setTimeout(() => {
                tinderSwiper.removeSlide(activeIndex);
                renderListasDeStatus(dados.casamento.convidados);
                
                // Atualiza o contador do topo
                const pendentes = dados.casamento.convidados.filter(x => x.status === 'pending');
                document.getElementById('counter').innerText = `${pendentes.length} aguardando decisão`;
                
                // Se zerar o baralho de 100, carrega as próximas automaticamente
                if (tinderSwiper.slides.length === 0) {
                    renderCards();
                }
            }, 250); 
        }
    }
};

// ==========================================
// LISTAS DE CONFIRMADOS E RECUSADOS
// ==========================================
function renderListasDeStatus(todosConvidados) {
    const confirmados = todosConvidados.filter(g => g.status === 'yes');
    const recusados = todosConvidados.filter(g => g.status === 'no');

    const countYes = document.getElementById('countYes');
    const countNo = document.getElementById('countNo');
    
    // Proteção caso os contadores não existam no HTML
    if(countYes) countYes.innerText = confirmados.length;
    if(countNo) countNo.innerText = recusados.length;

    const gerarHtmlLista = (lista) => {
        if (lista.length === 0) return '<p style="color: var(--text-muted); font-size: 0.85rem; text-align: center; margin-top: 20px;">Ninguém ainda.</p>';
        
        return lista.map(g => `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 5px; border-bottom: 1px solid rgba(255,255,255,0.05);">
                <span style="color: #fff; font-weight: bold; font-size: 0.95rem;">${g.name}</span>
                <button onclick="desfazerStatus('${g.id}')" style="background: none; border: none; color: var(--text-muted); cursor: pointer; font-size: 0.8rem; text-decoration: underline; transition: 0.3s;">Desfazer</button>
            </div>
        `).join('');
    };

    const divConf = document.getElementById('listaConfirmados');
    const divRec = document.getElementById('listaRecusados');
    
    if(divConf) divConf.innerHTML = gerarHtmlLista(confirmados);
    if(divRec) divRec.innerHTML = gerarHtmlLista(recusados);
}

window.desfazerStatus = (id) => {
    const dados = getData();
    const g = dados.casamento.convidados.find(x => x.id === id);
    if (g) {
        g.status = 'pending'; // Volta pra pilha pendente
        saveData(dados);
        renderCards(); // Recarrega o baralho para a pessoa voltar pro topo
    }
};

// ==========================================
// FUNÇÕES DE CADASTRO E EXCEL
// ==========================================
window.importarExcel = function() {
    const area = document.getElementById('excelPasteArea');
    const texto = area.value.trim();
    if (!texto) return;

    let novosNomes = [];
    const linhas = texto.split(/\r?\n/);
    linhas.forEach(l => {
        const colunas = l.split(/\t|;/);
        colunas.forEach(c => {
            const nome = c.trim();
            if (nome.length > 2) novosNomes.push(nome);
        });
    });
    
    const r = adicionarNomes(novosNomes);
    area.value = '';
    alert(`✅ ${r.novos} adicionados | ⚠️ ${r.velhos} duplicados pulados.`);
};

function adicionarNomes(lista) {
    const dados = getData();
    if (!dados.casamento) dados.casamento = { convidados: [] };
    let n = 0, v = 0;

    lista.forEach(nome => {
        const existe = dados.casamento.convidados.some(g => g.name.toLowerCase() === nome.toLowerCase());
        if (!existe) {
            dados.casamento.convidados.push({ id: 'g-'+Date.now()+Math.random(), name: nome, status: 'pending' });
            n++;
        } else { v++; }
    });

    if (n > 0) { saveData(dados); renderCards(); }
    return { novos: n, velhos: v };
}
