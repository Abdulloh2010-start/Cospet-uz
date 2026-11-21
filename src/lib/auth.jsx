import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, signOut, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from './firebase';
import { isAdmin } from './db';

const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);

export const authError = (e) => ({
  'auth/invalid-credential': 'Неверная почта или пароль', 'auth/wrong-password': 'Неверная почта или пароль', 'auth/user-not-found': 'Неверная почта или пароль',
  'auth/email-already-in-use': 'Эта почта уже зарегистрирована', 'auth/weak-password': 'Пароль должен быть не короче 6 символов',
  'auth/invalid-email': 'Некорректная почта', 'auth/too-many-requests': 'Слишком много попыток. Попробуйте позже',
  'auth/popup-closed-by-user': 'Окно входа закрыто', 'auth/operation-not-allowed': 'Этот способ входа не включён в Firebase',
}[e.code] || 'Не удалось войти. Попробуйте ещё раз');

export function AuthProvider({ children }) {
  const [state, setState] = useState({ user: undefined, admin: false });
  const [loginOpen, setLoginOpen] = useState(false); 
  useEffect(() => onAuthStateChanged(auth, async (u) => setState({ user: u, admin: u ? await isAdmin(u.uid) : false })), []);
  const value = {
    ...state, loading: state.user === undefined, loginOpen, openLogin: (m = 'client') => setLoginOpen(m), closeLogin: () => setLoginOpen(false),
    login: (e, p) => signInWithEmailAndPassword(auth, e, p),
    google: () => signInWithPopup(auth, new GoogleAuthProvider()),
    register: async (name, e, p) => { const c = await createUserWithEmailAndPassword(auth, e, p); await updateProfile(c.user, { displayName: name }); setState((s) => ({ ...s, user: auth.currentUser })); },
    logout: () => signOut(auth),
    checkAdmin: isAdmin,
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};