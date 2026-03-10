// js/auth.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { 
    getAuth, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";

import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

// ==========================================
// 1. CONFIGURAÇÃO DO FIREBASE
// ==========================================
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
const db = getFirestore(app);
window.db = db;

// ==========================================
// 2. LÓGICA DE ALTERNAR TELAS (LOGIN/REGISTRO)
// ==========================================
const cardLogin = document.getElementById('cardLogin');
const cardRegister = document.getElementById('cardRegister');
const btnShowRegister = document.getElementById('btnShowRegister');
const btnShowLogin = document.getElementById('btnShowLogin');

if (btnShowRegister && btnShowLogin) {
    btnShowRegister.addEventListener('click', () => {
        cardLogin.classList.add('hidden-card');
        cardRegister.classList.remove('hidden-card');
    });

    btnShowLogin.addEventListener('click', () => {
        cardRegister.classList.add('hidden-card');
        cardLogin.classList.remove('hidden-card');
    });
}

// ==========================================
// 3. SINCRONIZAÇÃO E PROTEÇÃO DE ROTAS (O CORAÇÃO DO FIX)
// ==========================================
onAuthStateChanged(auth, (user) => {
    const urlAtual = window.location.href;
    const isPaginaLogin = urlAtual.includes('login.html');
    
    if (user) {
        // ✅ LOGADO: Salva o e-mail no localStorage para a index.html reconhecer
        localStorage.setItem('gemsEliteLogin', user.email);
        
        // Se o cara está logado e tentou entrar na login.html, manda pra index
        if (isPaginaLogin) {
            window.location.href = 'index.html';
        }
    } else {
        // ❌ DESLOGADO: Limpa o rastro e manda pro login (se não estiver lá)
        localStorage.removeItem('gemsEliteLogin');
        if (!isPaginaLogin) {
            window.location.href = 'login.html';
        }
    }
});

// ==========================================
// 4. FUNÇÕES DE FORMULÁRIO
// ==========================================
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const msgBox = document.getElementById('loginMsg');

        msgBox.style.display = 'block';
        msgBox.innerText = '⏳ Autenticando...';

        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                localStorage.setItem('gemsEliteLogin', userCredential.user.email);
                window.location.href = "index.html";
            })
            .catch((error) => {
                msgBox.innerText = '❌ E-mail ou senha incorretos.';
                console.error(error.code);
            });
    });
}

const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('regEmail').value;
        const pass = document.getElementById('regPassword').value;
        const confirmPass = document.getElementById('regConfirmPassword').value;
        const msgBox = document.getElementById('regMsg');

        if (pass !== confirmPass) {
            msgBox.style.display = 'block';
            msgBox.innerText = '❌ As senhas não conferem.';
            return;
        }

        createUserWithEmailAndPassword(auth, email, pass)
            .then((userCredential) => {
                localStorage.setItem('gemsEliteLogin', userCredential.user.email);
                window.location.href = "index.html";
            })
            .catch((error) => {
                msgBox.style.display = 'block';
                msgBox.innerText = '❌ Erro ao criar conta (E-mail inválido ou já existe).';
            });
    });
}

export { auth };
