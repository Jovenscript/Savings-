// metas.js

const metasData = [
    {
        title: "Casa Luxuosa",
        desc: "Projeto Jaraguá do Sul · Alto Padrão",
        // Imagem Premium de Mansão Noturna
        img: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1920&q=80",
        s1: "R$ 850k", s2: "12%", s3: "2030"
    },
    {
        title: "BMW 320i",
        desc: "M Sport · Portimão Blue",
        // Imagem Premium de uma BMW esportiva (focada na máquina)
        img: "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1920&q=80",
        s1: "R$ 320k", s2: "5%", s3: "2028"
    },
    {
        title: "O Casamento",
        desc: "29 de Agosto de 2026 · Marlon & Carol",
        // Imagem Premium de Alianças/Casamento Elegante
        img: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1920&q=80",
        s1: "R$ 85k", s2: "45%", s3: "Agosto/26"
    }
];

function changeMeta(index) {
    const data = metasData[index];
    const bgElement = document.getElementById('metaBackground');
    
    // Pequeno truque para reiniciar a animação suavemente ao trocar de tela
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

    // Atualiza Menu
    const items = document.querySelectorAll('.nav-item');
    items.forEach(el => el.classList.remove('active'));
    items[index].classList.add('active');
}

// Inicializa a primeira meta assim que carregar
window.onload = () => {
    changeMeta(0);
};