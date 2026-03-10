// metas.js

// As imagens e textos padrões de fundo (caso seja a primeira vez abrindo o app)
const defaultMetas = [
    {
        title: "Casa Luxuosa",
        desc: "Projeto Jaraguá do Sul · Alto Padrão",
        img: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1920&q=80",
        s1: "R$ 850k", s2: "12%", s3: "2030"
    },
    {
        title: "BMW 320i",
        desc: "M Sport · Portimão Blue",
        img: "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1920&q=80",
        s1: "R$ 320k", s2: "5%", s3: "2028"
    },
    {
        title: "O Casamento",
        desc: "29 de Agosto de 2026 · Marlon & Carol",
        img: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1920&q=80",
        s1: "R$ 85k", s2: "45%", s3: "Agosto/26"
    }
];

let metasData = [];
let currentIndex = 0;
let carrosselTimer;

function initMetas() {
    // 1. Tenta carregar do banco de dados oficial (app.js)
    const dadosGerais = typeof getData === 'function' ? getData() : {};
    
    if (dadosGerais.apresentacaoMetas && dadosGerais.apresentacaoMetas.length > 0) {
        metasData = dadosGerais.apresentacaoMetas;
    } else {
        // Se não tiver, usa o padrão e salva
        metasData = defaultMetas;
        dadosGerais.apresentacaoMetas = metasData;
        if (typeof saveData === 'function') saveData(dadosGerais);
    }

    renderizarMenu();
    changeMeta(0, true);
}

function renderizarMenu() {
    const nav = document.getElementById('metaNav');
    if (!nav) return;
    
    // Pega só o primeiro nome para não quebrar o layout do menu
    nav.innerHTML = metasData.map((m, i) => {
        const nomeCurto = m.title.split(' ')[0]; 
        return `<li onclick="changeMeta(${i}, true)" class="nav-item ${i === currentIndex ? 'active' : ''}">${nomeCurto}</li>`;
    }).join('');
}

function changeMeta(index, clickManual = false) {
    currentIndex = index;
    const data = metasData[currentIndex];
    
    const bgElement = document.getElementById('metaBackground');
    
    // Pequeno truque para reiniciar a animação suavemente
    bgElement.style.animation = 'none';
    bgElement.offsetHeight; /* Trigger reflow */
    
    // Atualiza Fundo
    bgElement.style.backgroundImage = `url('${data.img}')`;
    bgElement.style.animation = 'cameraPan 40s infinite ease-in-out';
    
    // Atualiza Textos
    document.getElementById('metaTitle').innerText = data.title;
    document.getElementById('metaDesc').innerText = data.desc;
    document.getElementById('stat1').innerText = data.s1;
    document.getElementById('stat2').innerText = data.s2;
    document.getElementById('stat3').innerText = data.s3;

    // Atualiza classes do Menu
    const items = document.querySelectorAll('.nav-item');
    items.forEach((el, i) => {
        if (i === currentIndex) el.classList.add('active');
        else el.classList.remove('active');
    });

    // Se o usuário clicou, ou se está rodando normal, a gente reinicia o cronômetro
    iniciarCarrossel();
}

function iniciarCarrossel() {
    // Limpa o cronômetro antigo
    if (carrosselTimer) clearInterval(carrosselTimer);
    
    // Cria um novo para passar daqui a 5 segundos
    carrosselTimer = setInterval(() => {
        let proximo = (currentIndex + 1) % metasData.length;
        changeMeta(proximo, false);
    }, 5000);
}

function pararCarrossel() {
    if (carrosselTimer) clearInterval(carrosselTimer);
}

// ==========================================
// FUNÇÃO DE EDIÇÃO (Salva na Nuvem)
// ==========================================
window.editarMetaAtual = function() {
    pararCarrossel(); // Pausa a apresentação enquanto digita
    
    const meta = metasData[currentIndex];

    // Faz as perguntas
    const novoTitle = prompt("Nome da Meta (Ex: Casa Luxuosa):", meta.title) || meta.title;
    const novoDesc = prompt("Descrição (Ex: Alto Padrão):", meta.desc) || meta.desc;
    const novoS1 = prompt("Qual o valor ALVO? (Ex: R$ 850k):", meta.s1) || meta.s1;
    const novoS2 = prompt("Qual o PROGRESSO atual? (Ex: 12%):", meta.s2) || meta.s2;
    const novoS3 = prompt("Qual a PREVISÃO? (Ex: 2030):", meta.s3) || meta.s3;
    
    let novaImg = prompt("Link de uma nova imagem (Deixe em branco para manter):", meta.img) || meta.img;

    // Atualiza no array
    metasData[currentIndex] = {
        title: novoTitle,
        desc: novoDesc,
        s1: novoS1,
        s2: novoS2,
        s3: novoS3,
        img: novaImg
    };

    // Salva no banco de dados geral para sincronizar os celulares
    const dadosGerais = typeof getData === 'function' ? getData() : {};
    dadosGerais.apresentacaoMetas = metasData;
    if (typeof saveData === 'function') saveData(dadosGerais);

    // Recarrega a tela
    renderizarMenu();
    changeMeta(currentIndex, true);
    
    // Dispara o efeito de comemoração global! 🎉
    if (typeof dispararConfetes === 'function') {
        dispararConfetes();
    }
};

// Inicializa tudo quando o arquivo carregar
window.onload = () => {
    initMetas();
};
