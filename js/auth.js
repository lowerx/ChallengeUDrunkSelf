// SUPABASE AUTHENTICATION
console.log('[Auth] Script loading...');

var SUPABASE_URL  = 'https://oxcmhymldfvetradvmhq.supabase.co'; 
var SUPABASE_ANON = 'sb_publishable_FiVSP20-OjzLhjMCzyNZrQ_fPOBPy46';

// Rename this variable to avoid collision with the global 'supabase' library object
var sbClient = null;

function initSupabase() {
  console.log('[Auth] Initializing Supabase...');
  if (typeof updateNavAuth === 'function') updateNavAuth(null);

  try {
    // window.supabase is the library from the CDN
    if (window.supabase && typeof window.supabase.createClient === 'function') {
      sbClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON);
      console.log('[Auth] Supabase client created.');
      
      sbClient.auth.onAuthStateChange(function(event, session) {
        console.log('[Auth] State change:', event);
        if (typeof updateNavAuth === 'function') updateNavAuth(session ? session.user : null);
      });
      
      sbClient.auth.getSession().then(function(result) {
        var user = (result.data && result.data.session) ? result.data.session.user : null;
        if (typeof updateNavAuth === 'function') updateNavAuth(user);
      });
    } else {
      console.error('[Auth] Supabase library not found! Check CDN script tag.');
    }
  } catch (e) {
    console.error('[Auth] Initialization error:', e);
  }
}

function authSignUp() {
  console.log('[Auth] Sign up attempt');
  if (!sbClient) { alert('Auth not ready'); return; }
  
  var name = document.getElementById('signup-name').value.trim();
  var email = document.getElementById('signup-email').value.trim();
  var password = document.getElementById('signup-password').value;

  if (!name || !email || !password) {
    setAuthMsg('Fill all fields', 'error');
    return;
  }

  setAuthMsg('Creating account...', '');
  sbClient.auth.signUp({
    email: email,
    password: password,
    options: { data: { display_name: name } }
  }).then(function(res) {
    if (res.error) setAuthMsg(res.error.message, 'error');
    else {
      setAuthMsg('Check your email!', 'success');
      setTimeout(closeAuthModal, 2000);
    }
  });
}

function authLogin() {
  console.log('[Auth] Login attempt');
  if (!sbClient) { alert('Auth not ready'); return; }

  var email = document.getElementById('login-email').value.trim();
  var password = document.getElementById('login-password').value;

  if (!email || !password) {
    setAuthMsg('Enter email and password', 'error');
    return;
  }

  setAuthMsg('Logging in...', '');
  sbClient.auth.signInWithPassword({
    email: email,
    password: password
  }).then(function(res) {
    if (res.error) setAuthMsg(res.error.message, 'error');
    else {
      setAuthMsg('Welcome back!', 'success');
      setTimeout(closeAuthModal, 1000);
    }
  });
}

function authGoogle() {
  console.log('[Auth] Google attempt');
  if (!sbClient) return;
  
  // Redirection: always go to app.html in the current folder
  var dest = window.location.origin + window.location.pathname.replace(/\/[^\/]*$/, '/app.html');
  console.log('[Auth] Redirecting to Google, return to:', dest);

  sbClient.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: dest }
  });
}

function authSignOut() {
  if (!sbClient) return;
  sbClient.auth.signOut().then(function() {
    if (typeof updateNavAuth === 'function') updateNavAuth(null);
  });
}

function saveGameSession(scores, combinedLevel, combinedBadge) {
  if (!sbClient) return;
  sbClient.auth.getSession().then(function(res) {
    var user = (res.data && res.data.session) ? res.data.session.user : null;
    if (!user) return;

    var row = {
      user_id: user.id,
      reaction_avg: scores.reaction ? scores.reaction.avg : null,
      findtom_avg: scores.findtom ? scores.findtom.avg : null,
      stroop_avg: scores.stroop ? scores.stroop.avg : null,
      stroop_errors: scores.stroop ? scores.stroop.errors : null,
      combined_level: combinedLevel,
      combined_badge: combinedBadge
    };

    sbClient.from('game_sessions').insert(row).then(function(insertRes) {
      if (!insertRes.error) {
        var notice = document.getElementById('save-notice');
        if (notice) notice.style.display = 'block';
      }
    });
  });
}

// Initialize on load
document.addEventListener('DOMContentLoaded', initSupabase);

// Force global visibility
window.authSignUp = authSignUp;
window.authLogin = authLogin;
window.authGoogle = authGoogle;
window.authSignOut = authSignOut;
window.saveGameSession = saveGameSession;

console.log('[Auth] Script loaded.');
