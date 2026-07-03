import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './supabase';
import AuthModal from '../components/auth/AuthModal';

const AuthContext = createContext(null);

function authRedirectTo(path = '/') {
  if (typeof window === 'undefined') return undefined;
  const configured = import.meta.env.VITE_SITE_URL?.replace(/\/$/, '');
  const origin = configured || window.location.origin;
  return `${origin}${path.startsWith('/') ? path : `/${path}`}`;
}

/**
 * Wraps Supabase Auth (email/password) + the matching `user_profiles` row.
 * In mock mode (no .env configured) this is a no-op: session stays null,
 * nothing crashes, the rest of the app just behaves as a logged-out visitor.
 *
 * Also owns the sign-in/register modal's open state — every page reaches it
 * via `useAuth().openAuth('signin' | 'signup')` rather than each route
 * having to thread its own modal state through the Navbar.
 */
export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(!!supabase);
  const [authModalMode, setAuthModalMode] = useState(null); // null | 'signin' | 'signup'

  // Track the Supabase Auth session.
  useEffect(() => {
    if (!supabase) return undefined;

    supabase.auth.getSession().then(({ data }) => setSession(data.session));

    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => sub.subscription.unsubscribe();
  }, []);

  // Once we have a session, load the matching user_profiles row (role,
  // is_banned, xp, etc. — see supabase/schema.sql's handle_new_user trigger).
  useEffect(() => {
    if (!supabase || !session?.user) {
      setProfile(null);
      setLoading(false);
      return undefined;
    }
    let cancelled = false;
    setLoading(true);
    supabase
      .from('user_profiles')
      .select('*')
      .eq('auth_user_id', session.user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled) {
          setProfile(data);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [session]);

  const signUp = (email, password, fullName, options = {}) =>
    supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, ...(options.data ?? {}) },
        emailRedirectTo: options.emailRedirectTo ?? authRedirectTo('/'),
      },
    });

  const signIn = (email, password) => supabase.auth.signInWithPassword({ email, password });

  const signOut = () => supabase.auth.signOut();

  const isStaff = profile?.role === 'moderator' || profile?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        session,
        profile,
        loading,
        isStaff,
        signUp,
        signIn,
        signOut,
        openAuth: setAuthModalMode,
        authRedirectTo,
      }}
    >
      {children}
      <AuthModal open={!!authModalMode} mode={authModalMode ?? 'signin'} onClose={() => setAuthModalMode(null)} />
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
