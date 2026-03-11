// auth.js
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

// 🛡️ A REGRA DE OURO: REDIRECIONAMENTO ÚNICO
onAuthStateChanged(auth, (user) => {
    const naLogin = window.location.href.includes('login.html');
    if (user) {
        localStorage.setItem('gemsEliteLogin', user.email);
        if (naLogin) window.location.href = 'index.html';
    } else {
        localStorage.removeItem('gemsEliteLogin');
        if (!naLogin) window.location.href = 'login.html';
    }
});

// 🚀 FUNÇÃO GLOBAL DE SAIR (Para o app.js usar)
window.logoutDoSistema = function() {
    if(confirm("Deseja realmente sair do Império?")) {
        signOut(auth).then(() => {
            localStorage.clear();
            window.location.href = 'login.html';
        });
    }
};

// 🖱️ LÓGICA DE TROCA DE TELAS (LOGIN / CADASTRO)
window.alternarAuth = function(tela) {
    const cardLogin = document.getElementById('cardLogin');
    const cardRegister = document.getElementById('cardRegister');
    if (tela === 'registro') {
        cardLogin.classList.add('hidden-card');
        cardRegister.classList.remove('hidden-card');
    } else {
        cardRegister.classList.add('hidden-card');
        cardLogin.classList.remove('hidden-card');
    }
};

// フォーム (FORMS)
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
        .catch(() => alert("Erro ao criar conta. Verifique o e-mail."));
});
