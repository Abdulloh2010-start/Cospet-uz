import { lazy, Suspense } from 'react';
import { Routes, Route, Link, NavLink, useLocation } from 'react-router-dom';
import { useStore } from './lib/store';
import Shop from './pages/Shop';
import Product from './pages/Product';
import { Favorites, Cart, Orders } from './pages/Account';
import AccountMenu, { LoginModal } from './components/AccountMenu';
import { SkPage } from './components/Skeleton';
import Footer from './components/Footer';
import NotFound from './pages/NotFound';
const Admin = lazy(() => import('./pages/Admin'));

const Ico = ({ d }) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>;

export default function App() {
  const { theme, toggleTheme, count, favs } = useStore();
  const admin = useLocation().pathname.startsWith('/admin');
  return (
    <>
      {!admin && (
        <header className="top">
          <Link to="/" className="logo">KOSPET<span>.uz</span></Link>
          <nav>
            <NavLink to="/favorites" aria-label="Избранное"><Ico d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z" />{favs.length > 0 && <b>{favs.length}</b>}</NavLink>
            <NavLink to="/cart" aria-label="Корзина"><Ico d="M6 6h15l-1.5 9h-12zM6 6 5 2H2M9 20h.01M18 20h.01" />{count > 0 && <b>{count}</b>}</NavLink>
            <button className="iconbtn" onClick={toggleTheme} aria-label="Сменить тему">{theme === 'dark' ? <Ico d="M12 3v2M12 19v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M3 12h2M19 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" /> : <Ico d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />}</button>
            <AccountMenu />
          </nav>
        </header>
      )}
      <main>
        <Suspense fallback={<SkPage />}>
          <Routes>
            <Route path="/" element={<Shop />} />
            <Route path="/watch/:id" element={<Product />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/admin/*" element={<Admin />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      <LoginModal />
      {!admin && <Footer />}
    </>
  );
};