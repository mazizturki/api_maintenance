// auth.js

const loginForm = document.getElementById('login-form');
const errorMsg = document.getElementById('error-msg');
const loginContainer = document.getElementById('login-container');
const mainContent = document.getElementById('main-content');
const logoutBtn = document.getElementById('logout-btn');

// Hash SHA-256 du mot de passe "VRadio@2025"
const PASSWORD_HASH = 'cd46c878b9d4c9f123fc7df206496180f09154ae5f87f85bb611ca64457390e2';

// Fonction pour hasher le mot de passe en SHA-256
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

// Fonction déconnexion
function logout() {
  sessionStorage.removeItem('authenticated');
  mainContent.style.display = 'none';
  loginContainer.style.display = 'block';
  errorMsg.textContent = '';
  document.getElementById('password').value = '';
  clearTimeout(logoutTimer);
}

// Événement clic sur bouton déconnexion
logoutBtn.addEventListener('click', logout);

// Gestion soumission formulaire login
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  errorMsg.textContent = '';

  const password = document.getElementById('password').value.trim();
  if (!password) {
    errorMsg.textContent = 'Veuillez entrer un mot de passe.';
    return;
  }

  try {
    const hash = await hashPassword(password);
    if (hash === PASSWORD_HASH) {
      sessionStorage.setItem('authenticated', 'true');
      loginContainer.style.display = 'none';
      mainContent.style.display = 'block';
      resetLogoutTimer();
    } else {
      errorMsg.textContent = 'Mot de passe incorrect.';
    }
  } catch (err) {
    errorMsg.textContent = 'Erreur lors de la vérification du mot de passe.';
    console.error('Erreur hash:', err);
  }
});

// Déconnexion automatique après 2 minutes d'inactivité
let logoutTimer;

function resetLogoutTimer() {
  clearTimeout(logoutTimer);
  logoutTimer = setTimeout(() => {
    alert('Session expirée pour cause d’inactivité.');
    logout();
  }, 120000); // 120000 ms = 2 minutes
}

// Réinitialiser timer à chaque action utilisateur
['mousemove', 'keydown', 'click', 'scroll'].forEach(event => {
  window.addEventListener(event, () => {
    if (sessionStorage.getItem('authenticated') === 'true') {
      resetLogoutTimer();
    }
  });
});

// Vérifier si déjà authentifié au chargement
document.addEventListener('DOMContentLoaded', () => {
  if (sessionStorage.getItem('authenticated') === 'true') {
    loginContainer.style.display = 'none';
    mainContent.style.display = 'block';
    resetLogoutTimer();
  } else {
    loginContainer.style.display = 'block';
    mainContent.style.display = 'none';
  }
});
