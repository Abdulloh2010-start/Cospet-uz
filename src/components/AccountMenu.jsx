import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, authError } from '../lib/auth';

const I = ({ d, s = 20 }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>;
const P = { user: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z', box: 'M21 8l-9-5-9 5v8l9 5 9-5zM3 8l9 5 9-5M12 13v8', heart: 'M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z', shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z', out: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9', x: 'M18 6 6 18M6 6l12 12' };

const initial = (u) => (u.displayName || u.email || '?')[0].toUpperCase();

function Pass({ value, onChange, autoComplete }) {
  const [show, setShow] = useState(false);
  return (
    <span className="pass">
      <input type={show ? 'text' : 'password'} required minLength={6} value={value} onChange={onChange} autoComplete={autoComplete} />
      <button type="button" onClick={() => setShow(!show)} aria-label={show ? 'Скрыть пароль' : 'Показать пароль'} aria-pressed={show}>
        <I d={show ? 'M17.9 17.9A10.1 10.1 0 0 1 12 20c-7 0-11-8-11-8a18.5 18.5 0 0 1 5.1-5.9M9.9 4.2A9.1 9.1 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.2 3.2M14.1 14.1a3 3 0 1 1-4.2-4.2M1 1l22 22' : 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z'} />
      </button>
    </span>
  );
}

export function Avatar({ user, size = 36 }) {
  return user.photoURL ? <img className="ava" src={user.photoURL} alt="" width={size} height={size} referrerPolicy="no-referrer" /> : <span className="ava" style={{ width: size, height: size }}>{initial(user)}</span>;
}

export function LoginModal() {
  const { loginOpen, closeLogin, login, register, google, logout, checkAdmin } = useAuth();
  const nav = useNavigate();
  const [mode, setMode] = useState('client'); const [tab, setTab] = useState('in');
  const [f, setF] = useState({ name: '', email: '', pass: '' }); const [err, setErr] = useState(''); const [busy, setBusy] = useState(false);
  useEffect(() => { if (loginOpen) { setMode(loginOpen); setErr(''); } }, [loginOpen]);
  useEffect(() => { const k = (e) => e.key === 'Escape' && closeLogin(); if (loginOpen) { addEventListener('keydown', k); document.body.style.overflow = 'hidden'; } return () => { removeEventListener('keydown', k); document.body.style.overflow = ''; }; }, [loginOpen]);
  if (!loginOpen) return null;
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault(); setBusy(true); setErr('');
    try {
      if (mode === 'admin') {
        const c = await login(f.email, f.pass);
        if (await checkAdmin(c.user.uid)) { closeLogin(); nav('/admin'); }
        else { await logout(); setErr('У этого аккаунта нет прав администратора'); }
      } else {
        if (tab === 'up') await register(f.name, f.email, f.pass); else await login(f.email, f.pass);
        closeLogin();
      }
    } catch (x) { setErr(authError(x)); } finally { setBusy(false); }
  }
  async function viaGoogle() { setBusy(true); setErr(''); try { await google(); closeLogin(); } catch (x) { setErr(authError(x)); } finally { setBusy(false); } }

  return (
    <div className="backdrop" onMouseDown={(e) => e.target === e.currentTarget && closeLogin()}>
      <div className="modal" role="dialog" aria-modal="true" aria-label="Вход">
        <button className="x" onClick={closeLogin} aria-label="Закрыть"><I d={P.x} /></button>
        <h2>{mode === 'admin' ? 'Вход для администратора' : tab === 'up' ? 'Создать аккаунт' : 'Вход в аккаунт'}</h2>
        <div className="seg" role="tablist">
          <button role="tab" aria-selected={mode === 'client'} className={mode === 'client' ? 'on' : ''} onClick={() => { setMode('client'); setErr(''); }}>Я клиент</button>
          <button role="tab" aria-selected={mode === 'admin'} className={mode === 'admin' ? 'on' : ''} onClick={() => { setMode('admin'); setErr(''); }}>Я админ</button>
        </div>
        <form onSubmit={submit}>
          {mode === 'client' && tab === 'up' && <label>Имя<input required value={f.name} onChange={set('name')} autoComplete="name" /></label>}
          <label>Почта<input type="email" required value={f.email} onChange={set('email')} autoComplete="email" /></label>
          <label>Пароль<Pass value={f.pass} onChange={set('pass')} autoComplete={tab === 'up' && mode === 'client' ? 'new-password' : 'current-password'} /></label>
          {err && <p className="no" role="alert">{err}</p>}
          <button className="btn big" disabled={busy}>{busy ? 'Подождите…' : mode === 'admin' ? 'Войти в админ-панель' : tab === 'up' ? 'Зарегистрироваться' : 'Войти'}</button>
        </form>
        {mode === 'client' && (
          <>
            <div className="or"><span>или</span></div>
            <button className="btn ghost wide" onClick={viaGoogle} disabled={busy}>Продолжить с Google</button>
            <p className="swap">{tab === 'in' ? 'Нет аккаунта?' : 'Уже есть аккаунт?'} <button onClick={() => { setTab(tab === 'in' ? 'up' : 'in'); setErr(''); }}>{tab === 'in' ? 'Зарегистрироваться' : 'Войти'}</button></p>
          </>
        )}
      </div>
    </div>
  );
}

export default function AccountMenu() {
  const { user, admin, loading, openLogin, logout } = useAuth();
  const [open, setOpen] = useState(false); const box = useRef();
  useEffect(() => {
    if (!open) return;
    const c = (e) => !box.current?.contains(e.target) && setOpen(false); const k = (e) => e.key === 'Escape' && setOpen(false);
    addEventListener('mousedown', c); addEventListener('keydown', k);
    return () => { removeEventListener('mousedown', c); removeEventListener('keydown', k); };
  }, [open]);

  if (loading) return <span className="sk round" style={{ width: 40, height: 40 }} aria-hidden="true" />;
  if (!user) return <button className="iconbtn" onClick={() => openLogin('client')} aria-label="Войти"><I d={P.user} s={22} /></button>;
  const go = () => setOpen(false);
  return (
    <div className="acc" ref={box}>
      <button className="iconbtn ava-btn" onClick={() => setOpen(!open)} aria-expanded={open} aria-label="Аккаунт"><Avatar user={user} /></button>
      {open && (
        <div className="pop" role="menu">
          <div className="who"><Avatar user={user} size={44} /><div><b>{user.displayName || 'Клиент'}</b><small>{user.email}</small>{admin && <em className="tag">Админ</em>}</div></div>
          <Link to="/orders" onClick={go} role="menuitem"><I d={P.box} />Мои заказы</Link>
          <Link to="/favorites" onClick={go} role="menuitem"><I d={P.heart} />Избранное</Link>
          {admin && <Link to="/admin" onClick={go} role="menuitem"><I d={P.shield} />Админ-панель</Link>}
          <button onClick={() => { go(); logout(); }} role="menuitem" className="out"><I d={P.out} />Выйти</button>
        </div>
      )}
    </div>
  );
};