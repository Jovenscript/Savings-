let tinderSwiper = null;

document.addEventListener('DOMContentLoaded', () => {
    // Espera o banco de dados carregar
    const checkBD = setInterval(() => {
        if (typeof getData === 'function') {
            clearInterval(checkBD);
            renderCards();
        }
    }, 200);

    const formManual = document.getElementById('formManualGuest');
    if (formManual) {
        formManual.addEventListener('submit', (e) => {
            e.preventDefault();
            const input = document.getElementById('manualName');
            const nome = input.value.trim();
            if(nome) {
                adicionarNomes([nome]);
                input.value = '';
            }
        });
    }
});

function renderCards() {
    const wrapper = document.getElementById('tinderWrapper');
    const dados = getData();
    if (!dados.casamento) dados.casamento = { convidados: [] };
    
    const pendentes = dados.casamento.convidados.filter(g => g.status === 'pending');
    document.getElementById('counter').innerText = `${pendentes.length} pendentes`;

    wrapper.innerHTML = '';
    if (pendentes.length === 0) {
        wrapper.innerHTML = `<div class="swiper-slide guest-card"><h2>🎉 Fim da Lista!</h2><p>Tudo decidido.</p></div>`;
    } else {
        pendentes.forEach(g => {
            const slide = document.createElement('div');
            slide.className = 'swiper-slide guest-card';
            slide.dataset.id = g.id;
            slide.innerHTML = `<div class="guest-name">${g.name}</div><p style="color:var(--primary-purple)">Vem para o casamento?</p>`;
            wrapper.appendChild(slide);
        });
    }

    if (tinderSwiper) tinderSwiper.destroy(true, true);
    tinderSwiper = new Swiper(".tinderSwiper", { effect: "cards", grabCursor: true });
}

window.importarExcel = function() {
    const area = document.getElementById('excelPasteArea');
    const texto = area.value.trim();
    if (!texto) return;

    let nomesEncontrados = [];
    const linhas = texto.split(/\r?\n/);
    
    linhas.forEach(linha => {
        const colunas = linha.split(/\t|;/); // Separa por TAB ou ponto e vírgula
        colunas.forEach(col => {
            const nomeLimpo = col.trim();
            if (nomeLimpo.length > 2) nomesEncontrados.push(nomeLimpo);
        });
    });
    
    const r = adicionarNomes(nomesEncontrados);
    area.value = '';
    alert(`✅ ${r.novosAdicionados} novos | ⚠️ ${r.duplicadosIgnorados} duplicados pulados.`);
};

function adicionarNomes(listaNomes) {
    const dados = getData();
    if (!dados.casamento) dados.casamento = { convidados: [] };

    let novosAdicionados = 0;
    let duplicadosIgnorados = 0;

    listaNomes.forEach(nome => {
        const nomeFinal = nome.trim();
        const jaExiste = dados.casamento.convidados.some(g => g.name.toLowerCase() === nomeFinal.toLowerCase());

        if (!jaExiste) {
            dados.casamento.convidados.push({
                id: 'g-' + Math.random().toString(36).substr(2, 9),
                name: nomeFinal,
                status: 'pending'
            });
            novosAdicionados++;
        } else {
            duplicadosIgnorados++;
        }
    });

    if (novosAdicionados > 0) {
        saveData(dados);
        renderCards();
    }
    return { novosAdicionados, duplicadosIgnorados };
}

window.decidirStatus = function(status) {
    if (!tinderSwiper || !tinderSwiper.slides.length) return;
    const activeSlide = tinderSwiper.slides[tinderSwiper.activeIndex];
    const id = activeSlide ? activeSlide.dataset.id : null;
    
    if (id) {
        const dados = getData();
        const guest = dados.casamento.convidados.find(g => g.id === id);
        if (guest) {
            guest.status = status;
            saveData(dados);
            setTimeout(renderCards, 200);
        }
    }
};

window.resetarTudo = function() {
    if(confirm("Apagar todos os convidados?")) {
        const dados = getData();
        dados.casamento.convidados = [];
        saveData(dados);
        renderCards();
    }
};