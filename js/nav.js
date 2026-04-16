// ─── SHARED NAV ───────────────────────────────────────────
// Injected into every page. Reads the current filename to set active link.

function injectNav() {
  const page = window.location.pathname.split('/').pop() || 'index.html';

  const isActive = (href) => page === href ? 'class="active"' : '';

  const navHTML = `
    <nav class="nav">
      <div class="nav-container">
        <a href="index.html" class="nav-logo">CU<span>DOS</span></a>

        <div class="nav-right">
          <ul class="nav-links">
            <li><a href="index.html" ${isActive('index.html')}>Home</a></li>
            <li><a href="about.html" ${isActive('about.html')}>About</a></li>
            <li><a href="contact.html" ${isActive('contact.html')}>Contact</a></li>
          </ul>

          <div class="nav-auth" id="nav-auth">
            <button class="nav-btn-login" onclick="openAuthModal('login')">Log in</button>
            <a href="app.html" class="nav-btn-play">Play Now</a>
          </div>

          <button class="nav-toggle" id="nav-toggle" onclick="toggleMobileMenu(event)">
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>

      <div class="nav-mobile-menu" id="nav-mobile-menu">
        <a href="index.html" ${isActive('index.html')} onclick="toggleMobileMenu()">Home</a>
        <a href="about.html" ${isActive('about.html')} onclick="toggleMobileMenu()">About</a>
        <a href="contact.html" ${isActive('contact.html')} onclick="toggleMobileMenu()">Contact</a>
        <div class="divider"></div>
        <div class="nav-mobile-auth" id="nav-mobile-auth">
           <button class="nav-btn-login" onclick="openAuthModal('login')">Log in</button>
           <a href="app.html" class="nav-btn-play">Play Now</a>
        </div>
      </div>
    </nav>
  `;

  // Insert at the very top of body
  document.body.insertAdjacentHTML('afterbegin', navHTML);
}

function toggleMobileMenu(e) {
  if (e) e.stopPropagation();
  const menu = document.getElementById('nav-mobile-menu');
  const toggle = document.getElementById('nav-toggle');
  menu?.classList.toggle('open');
  toggle?.classList.toggle('active');
}

// Called by auth.js whenever auth state changes
function updateNavAuth(user) {
  const navAuth = document.getElementById('nav-auth');
  const navMobileAuth = document.getElementById('nav-mobile-auth');
  const introAuth = document.getElementById('intro-auth-wrapper');
  
  if (introAuth) introAuth.style.display = user ? 'none' : 'block';
  
  const getAuthHTML = (isMobile) => {
    if (user) {
      // Handle both manual signup (display_name) and Google (full_name)
      const name = user.user_metadata?.display_name || user.user_metadata?.full_name || user.email.split('@')[0];
      const initials = name.split(' ').map(function(w) { return w[0]; }).join('').slice(0, 2).toUpperCase();
      const displayName = name.split(' ')[0]; // Show first name only in nav
      const menuId = isMobile ? 'user-menu-mobile' : 'user-menu-desktop';

      return `
        <div class="nav-user-wrap">
          <div class="nav-user" onclick="toggleUserMenu(event, '${menuId}')">
            <div class="nav-avatar">${initials}</div>
            <span class="nav-username">${displayName}</span>
          </div>
          <div class="user-menu" id="${menuId}">
            <a href="app.html" class="user-menu-item">🎮 Play</a>
            <button class="user-menu-item danger" onclick="authSignOut()">Sign out</button>
          </div>
        </div>
      `;
    } else {
      return `
        <button class="nav-btn-login" onclick="openAuthModal('login')">Log in</button>
        <a href="app.html" class="nav-btn-play">Play Now</a>
      `;
    }
  };

  if (navAuth) navAuth.innerHTML = getAuthHTML(false);
  if (navMobileAuth) navMobileAuth.innerHTML = getAuthHTML(true);
}

function toggleUserMenu(e, menuId) {
  e.stopPropagation();
  // Close any other open menus first
  document.querySelectorAll('.user-menu').forEach(m => {
    if (m.id !== menuId) m.classList.remove('open');
  });
  document.getElementById(menuId)?.classList.toggle('open');
}

// Close all user menus when clicking outside
document.addEventListener('click', () => {
  document.querySelectorAll('.user-menu').forEach(m => m.classList.remove('open'));
});

// ─── AUTH MODAL ───────────────────────────────────────────
// The modal HTML is injected once, reused across all pages.

function injectAuthModal() {
  const modalHTML = `
    <div class="auth-overlay" id="auth-overlay" onclick="handleOverlayClick(event)">
      <div class="auth-modal">
        <button class="auth-close" onclick="closeAuthModal()">✕</button>

        <div class="auth-title" id="auth-modal-title">Welcome Back</div>
        <p class="auth-sub" id="auth-modal-sub">Log in to save your scores and compete with friends.</p>

        <div class="auth-tabs">
          <button class="auth-tab active" id="tab-login" onclick="switchAuthTab('login')">Log in</button>
          <button class="auth-tab" id="tab-signup" onclick="switchAuthTab('signup')">Sign up</button>
        </div>

        <div class="auth-form" id="auth-form-login">
          <div class="auth-field">
            <label>Email</label>
            <input type="email" id="login-email" placeholder="you@example.com" autocomplete="email">
          </div>
          <div class="auth-field">
            <label>Password</label>
            <input type="password" id="login-password" placeholder="••••••••" autocomplete="current-password">
          </div>
          <button class="auth-submit" onclick="authLogin()">Log in</button>
        </div>

        <div class="auth-form" id="auth-form-signup" style="display:none">
          <div class="auth-field">
            <label>Display Name</label>
            <input type="text" id="signup-name" placeholder="How you'll appear on the leaderboard">
          </div>
          <div class="auth-field">
            <label>Email</label>
            <input type="email" id="signup-email" placeholder="you@example.com" autocomplete="email">
          </div>
          <div class="auth-field">
            <label>Password</label>
            <input type="password" id="signup-password" placeholder="Min. 8 characters" autocomplete="new-password">
          </div>
          <button class="auth-submit" onclick="authSignUp()">Create account</button>
        </div>

        <div class="auth-divider">or</div>
        <button class="auth-google" onclick="authGoogle()">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        <div class="auth-msg" id="auth-msg"></div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function openAuthModal(tab) {
  switchAuthTab(tab || 'login');
  document.getElementById('auth-overlay')?.classList.add('open');
}

function closeAuthModal() {
  document.getElementById('auth-overlay')?.classList.remove('open');
  setAuthMsg('', '');
}

function handleOverlayClick(e) {
  if (e.target === document.getElementById('auth-overlay')) closeAuthModal();
}

function switchAuthTab(tab) {
  const isLogin = tab === 'login';
  document.getElementById('tab-login').classList.toggle('active', isLogin);
  document.getElementById('tab-signup').classList.toggle('active', !isLogin);
  document.getElementById('auth-form-login').style.display  = isLogin ? 'flex' : 'none';
  document.getElementById('auth-form-signup').style.display = isLogin ? 'none' : 'flex';
  document.getElementById('auth-modal-title').textContent   = isLogin ? 'Welcome Back' : 'Create Account';
  document.getElementById('auth-modal-sub').textContent     = isLogin
    ? 'Log in to save your scores and compete with friends.'
    : 'Join to track your scores and see how you compare.';
  setAuthMsg('', '');
}

function setAuthMsg(msg, type) {
  const el = document.getElementById('auth-msg');
  if (!el) return;
  el.textContent  = msg;
  el.className    = 'auth-msg' + (type ? ' ' + type : '');
}

// ─── INIT ─────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  injectNav();
  injectAuthModal();
  // auth.js will call updateNavAuth() once it checks the session
});
