// js/auth.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { 
    getAuth, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    onAuthStateChanged 
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
const db = getFirestore(app);
window.db = db;

// ==========================================
// 🛡️ A REGRA DE OURO: O PORTEIRO ÚNICO
// ==========================================
onAuthStateChanged(auth, (user) => {
    const urlAtual = window.location.href;
    const isPaginaLogin = urlAtual.includes('login.html');
    
    if (user) {
        // Se logou, anota no caderninho e garante que está na index
        localStorage.setItem('gemsEliteLogin', user.email);
        if (isPaginaLogin) window.location.href = 'index.html';
    } else {
        // Se deslogou, limpa o caderninho e garante que está no login
        localStorage.removeItem('gemsEliteLogin');
        if (!isPaginaLogin) window.location.href = 'login.html';
    }
});

// FUNÇÃO DE LOGIN
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const pass = document.getElementById('loginPassword').value;
        signInWithEmailAndPassword(auth, email, pass).catch(() => alert("E-mail ou senha incorretos."));
    });
}

// FUNÇÃO DE CADASTRO
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('regEmail').value;
        const pass = document.getElementById('regPassword').value;
        createUserWithEmailAndPassword(auth, email, pass).catch(() => alert("Erro ao criar conta."));
    });
}

export { auth };
