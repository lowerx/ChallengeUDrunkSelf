// ═══════════════════════════════════════════════════════════
// AUTH.JS — Supabase Authentication
// ═══════════════════════════════════════════════════════════
//
// SETUP (one-time, ~5 minutes):
//
//  1. Go to https://supabase.com and create a free account
//  2. Create a new project (any name, pick a region close to France)
//  3. Go to Project Settings → API
//  4. Copy your "Project URL" and "anon public" key
//  5. Paste them below, replacing the placeholders
//  6. In Supabase → Authentication → URL Configuration:
//     Add your site URL (e.g. https://your-app.netlify.app)
//  7. (Optional) Enable Google OAuth in Authentication → Providers
//
// The app works without Supabase configured — auth is optional.
// Scores are just not saved when no user is logged in.
//
// DATABASE SETUP (run in Supabase SQL editor):
//
//   CREATE TABLE game_sessions (
//     id           uuid    DEFAULT gen_random_uuid() PRIMARY KEY,
//     user_id      uuid    REFERENCES auth.users ON DELETE CASCADE,
//     created_at   timestamptz DEFAULT now(),
//     reaction_avg int,
//     findtom_avg  int,
//     stroop_avg   int,
//     stroop_errors int,
//     combined_level int,
//     combined_badge text
//   );
//
//   ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;
//
//   CREATE POLICY "Users can insert own sessions"
//     ON game_sessions FOR INSERT
//     WITH CHECK (auth.uid() = user_id);
//
//   CREATE POLICY "Users can read own sessions"
//     ON game_sessions FOR SELECT
//     USING (auth.uid() = user_id);
//
// ═══════════════════════════════════════════════════════════

import { createClient } from '@supabase/supabase-js';
const SUPABASE_URL  = 'https://oxcmhymldfvetradvmhq.supabase.co';   // e.g. https://xyzxyz.supabase.co
const SUPABASE_ANON = process.env.SUPABASE_KEY;

// ─── CLIENT INIT ──────────────────────────────────────────
let supabase = null;

function initSupabase() {
  if (SUPABASE_URL === 'YOUR_SUPABASE_URL') {
    console.info('[Auth] Supabase not configured — auth disabled. See auth.js for setup instructions.');
    updateNavAuth(null);
    return;
  }
  try {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON);
    supabase.auth.onAuthStateChange((_event, session) => {
      updateNavAuth(session?.user || null);
    });
    supabase.auth.getSession().then(({ data }) => {
      updateNavAuth(data?.session?.user || null);
    });
  } catch (e) {
    console.warn('[Auth] Supabase init failed:', e.message);
    updateNavAuth(null);
  }
}

// ─── SIGN UP ──────────────────────────────────────────────
async function authSignUp() {
  if (!supabase) { setAuthMsg('Auth not configured yet.', 'error'); return; }

  const name     = document.getElementById('signup-name')?.value.trim();
  const email    = document.getElementById('signup-email')?.value.trim();
  const password = document.getElementById('signup-password')?.value;

  if (!name || !email || !password) {
    setAuthMsg('Please fill in all fields.', 'error'); return;
  }
  if (password.length < 8) {
    setAuthMsg('Password must be at least 8 characters.', 'error'); return;
  }

  setAuthMsg('Creating account...', '');

  const { error } = await supabase.auth.signUp({
    email, password,
    options: { data: { display_name: name } }
  });

  if (error) {
    setAuthMsg(error.message, 'error');
  } else {
    setAuthMsg('Check your email to confirm your account!', 'success');
    setTimeout(closeAuthModal, 2500);
  }
}

// ─── LOG IN ───────────────────────────────────────────────
async function authLogin() {
  if (!supabase) { setAuthMsg('Auth not configured yet.', 'error'); return; }

  const email    = document.getElementById('login-email')?.value.trim();
  const password = document.getElementById('login-password')?.value;

  if (!email || !password) {
    setAuthMsg('Please enter email and password.', 'error'); return;
  }

  setAuthMsg('Logging in...', '');

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    setAuthMsg(error.message, 'error');
  } else {
    setAuthMsg('Welcome back!', 'success');
    setTimeout(closeAuthModal, 800);
  }
}

// ─── GOOGLE OAUTH ──────────────────────────────────────────
async function authGoogle() {
  if (!supabase) { setAuthMsg('Auth not configured yet.', 'error'); return; }

  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin + '/app.html' }
  });

  if (error) setAuthMsg(error.message, 'error');
}

// ─── SIGN OUT ─────────────────────────────────────────────
async function authSignOut() {
  if (!supabase) return;
  await supabase.auth.signOut();
  updateNavAuth(null);
}

// ─── SAVE SESSION TO DB ────────────────────────────────────
// Call this after a game ends if the user is logged in.
// `scores` comes from session.js global state.
async function saveGameSession(scores, combinedLevel, combinedBadge) {
  if (!supabase) return;

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return; // not logged in — silent skip

  const row = {
    user_id:        session.user.id,
    reaction_avg:   scores.reaction?.avg   || null,
    findtom_avg:    scores.findtom?.avg    || null,
    stroop_avg:     scores.stroop?.avg     || null,
    stroop_errors:  scores.stroop?.errors  ?? null,
    combined_level: combinedLevel,
    combined_badge: combinedBadge
  };

  const { error } = await supabase.from('game_sessions').insert(row);
  if (error) console.warn('[Auth] Failed to save session:', error.message);
  else        console.info('[Auth] Session saved.');
}

// ─── GET CURRENT USER ──────────────────────────────────────
async function getCurrentUser() {
  if (!supabase) return null;
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user || null;
}

// ─── BOOT ─────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', initSupabase);
