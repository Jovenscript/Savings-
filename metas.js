// metas.js

const metasFundadores = [
    {
        id: "casa",
        title: "Casa Luxuosa",
        desc: "Projeto Jaraguá do Sul · Alto Padrão",
        img: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1920&q=80",
        defaultS1: "R$ 850k", defaultS2: "12%", defaultS3: "2030"
    },
    {
        id: "bmw",
        title: "BMW 320i",
        desc: "M Sport · Portimão Blue",
        img: "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1920&q=80",
        defaultS1: "R$ 320k", defaultS2: "5%", defaultS3: "2028"
    },
    {
        id: "casamento",
        title: "O Casamento",
        desc: "29 de Agosto de 2026 · Marlon & Carol",
        img: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1920&q=80",
        defaultS1: "R$ 85k", defaultS2: "45%", defaultS3: "Agosto/26"
    }
];

let baseMetas = []; 
let valoresSalvos = {};
let swiperMetas = null;

function initMetas() {
    const dadosGerais = typeof getData === 'function' ? getData() : {};
    
    if (dadosGerais.apresentacaoMetas && dadosGerais.apresentacaoMetas.length > 0) {
        baseMetas = dadosGerais.apresentacaoMetas;
    } else {
        baseMetas = metasFundadores;
    }

    if (dadosGerais.valoresMetas) {
        valoresSalvos = dadosGerais.valoresMetas;
    } else {
        baseMetas.forEach(m => {
            valoresSalvos[m.id] = { s1: m.defaultS1, s2: m.defaultS2, s3: m.defaultS3 };
        });
        dadosGerais.valoresMetas = valoresSalvos;
        if (typeof saveData === 'function') saveData(dadosGerais);
    }

    renderizarCubo();
    iniciarMotor3D();
}

function renderizarCubo() {
    const cuboContainer = document.getElementById('cuboMetas');
    if (!cuboContainer) return;

    let html = '';

    // Imagem Coringa universal (Mansão minimalista à noite) caso a IA trave feio.
    const fotoSeguraGlobal = "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1920&q=80";

    baseMetas.forEach((meta) => {
        const meusValores = valoresSalvos[meta.id] || { s1: meta.defaultS1 || "R$ 0", s2: meta.defaultS2 || "0%", s3: meta.defaultS3 || "Definir" };

        html += `
            <div class="swiper-slide" style="background-color: #050110; position: relative;">
                
                <div style="position: absolute; top:0; left:0; width:100%; height:100%; background: linear-gradient(135deg, rgba(13,2,33,0.9), rgba(157,78,221,0.5)); z-index: 0;"></div>

                <img src="${meta.img}" 
                     alt="${meta.title}" 
                     style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; z-index: 1; opacity: 0.85;" 
                     onerror="this.onerror=null; this.src='${fotoSeguraGlobal}';">
                
                <div class="meta-overlay" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(to top, rgba(0,0,0,0.95) 5%, transparent 60%, rgba(13, 2, 33, 0.4) 100%); z-index: 2;"></div>
                
                <div class="meta-content" style="position: relative; z-index: 3; width: 100%;">
                    <div>
                        <h1 class="meta-title">${meta.title}</h1>
                        <button class="btn-edit-meta" onclick="editarValoresCofre('${meta.id}')" title="Editar Valores">✏️</button>
                    </div>
                    <p class="meta-desc">${meta.desc || 'Objetivo Gems Elite'}</p>
                    
                    <div class="meta-stats">
                        <div class="stat-box"><span class="stat-number">${meusValores.s1}</span><span class="stat-label">ALVO</span></div>
                        <div class="stat-box"><span class="stat-number">${meusValores.s2}</span><span class="stat-label">PROGRESSO</span></div>
                        <div class="stat-box"><span class="stat-number">${meusValores.s3}</span><span class="stat-label">PREVISÃO</span></div>
                    </div>
                </div>

            </div>
        `;
    });

    cuboContainer.innerHTML = html;
}

function iniciarMotor3D() {
    swiperMetas = new Swiper(".metasSwiper", {
        effect: "cube",
        grabCursor: true,
        cubeEffect: { shadow: true, slideShadows: true, shadowOffset: 40, shadowScale: 0.9 },
        pagination: { el: ".swiper-pagination", clickable: true },
        autoplay: { delay: 5000, disableOnInteraction: false },
        loop: baseMetas.length > 1 
    });
}

window.editarValoresCofre = function(idDaMeta) {
    if (swiperMetas && swiperMetas.autoplay) swiperMetas.autoplay.stop();
    
    const metaInfo = baseMetas.find(m => m.id === idDaMeta);
    const valoresAtuais = valoresSalvos[idDaMeta] || {s1:'', s2:'', s3:''};

    const novoS1 = prompt(`Cofre: ${metaInfo.title}\n\nQual o valor ALVO? (Ex: R$ 850k):`, valoresAtuais.s1) || valoresAtuais.s1;
    const novoS2 = prompt(`Qual o PROGRESSO atual? (Ex: 12%):`, valoresAtuais.s2) || valoresAtuais.s2;
    const novoS3 = prompt(`Qual a PREVISÃO para realizar? (Ex: 2030):`, valoresAtuais.s3) || valoresAtuais.s3;

    valoresSalvos[idDaMeta] = { s1: novoS1, s2: novoS2, s3: novoS3 };

    const dadosGerais = typeof getData === 'function' ? getData() : {};
    dadosGerais.valoresMetas = valoresSalvos;
    if (typeof saveData === 'function') saveData(dadosGerais);

    const slideAtual = swiperMetas.realIndex;
    swiperMetas.destroy(true, true);
    
    renderizarCubo();
    iniciarMotor3D();
    
    if(baseMetas.length > 1) {
        swiperMetas.slideToLoop(slideAtual, 0, false);
    }
    
    if (typeof dispararConfetes === 'function') dispararConfetes();
};

window.onload = () => {
    initMetas();
};
