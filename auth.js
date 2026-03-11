// js/auth.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { 
    getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut 
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCkm7cMFVbj-BpCJ8sz9SBnovui0bvfhfM",
  authDomain: "savings-a0221.firebaseapp.com",
  projectId: "savings-a0221",
  storageBucket: "savings-a0221.firebasestorage.app",
  messagingSenderId: "113856053059",
  appId: "1:113856053059:web:8421389a991130582c79f6"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
window.db = getFirestore(app);

// ==========================================
// 🛡️ REGRA DE OURO: REDIRECIONAMENTO ÚNICO
// ==========================================
// ==========================================
// 🛡️ REGRA DE OURO: REDIRECIONAMENTO E BLINDAGEM DE DADOS
// ==========================================
onAuthStateChanged(auth, (user) => {
    const url = window.location.href;
    const naLogin = url.includes('login.html');
    
    if (user) {
        const usuarioAnterior = localStorage.getItem('gemsEliteLogin');
        
        // Se é um usuário diferente (ou novo login na mesma máquina), limpa o cache antigo
        if (usuarioAnterior && usuarioAnterior !== user.email) {
            localStorage.removeItem('gemsEliteData'); 
        }
        
        localStorage.setItem('gemsEliteLogin', user.email);
        if (naLogin) window.location.href = 'index.html';
    } else {
        // Logout completo: destrói a sessão e os dados locais
        localStorage.removeItem('gemsEliteLogin');
        localStorage.removeItem('gemsEliteData'); 
        if (!naLogin) window.location.href = 'login.html';
    }
});

// Funções globais para os botões do HTML
window.alternarAuth = (tela) => {
    const cL = document.getElementById('cardLogin');
    const cR = document.getElementById('cardRegister');
    if(tela === 'registro') { cL.classList.add('hidden-card'); cR.classList.remove('hidden-card'); }
    else { cR.classList.add('hidden-card'); cL.classList.remove('hidden-card'); }
};

window.logoutDoSistema = () => {
    if(confirm("Deseja realmente sair?")) {
        signOut(auth).then(() => {
            localStorage.clear();
            window.location.href = 'login.html';
        });
    }
};

// Forms
document.getElementById('loginForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    signInWithEmailAndPassword(auth, document.getElementById('loginEmail').value, document.getElementById('loginPassword').value)
        .catch(() => alert("E-mail ou senha incorretos."));
});

document.getElementById('registerForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const p1 = document.getElementById('regPassword').value;
    const p2 = document.getElementById('regConfirmPassword').value;
    if(p1 !== p2) return alert("Senhas não conferem!");
    createUserWithEmailAndPassword(auth, document.getElementById('regEmail').value, p1)
        .catch(() => alert("Erro ao criar conta."));
});

export { auth };

