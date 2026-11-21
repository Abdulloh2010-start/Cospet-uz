import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { subscribeProducts } from './db';

const Ctx = createContext(null);
export const useStore = () => useContext(Ctx);
export const money = (n) => `${Number(n || 0).toLocaleString('ru-RU')} сум`;

const load = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };

export function StoreProvider({ children }) {
  const [theme, setTheme] = useState(() => document.documentElement.dataset.theme || 'dark');
  const [cart, setCart] = useState(() => load('cart', {}));   // { productId: qty }
  const [favs, setFavs] = useState(() => load('favs', []));
  const [products, setProducts] = useState(null);

  useEffect(() => { document.documentElement.dataset.theme = theme; localStorage.setItem('theme', theme); }, [theme]);
  useEffect(() => localStorage.setItem('cart', JSON.stringify(cart)), [cart]);
  useEffect(() => localStorage.setItem('favs', JSON.stringify(favs)), [favs]);
  useEffect(() => subscribeProducts(setProducts), []);

  const value = useMemo(() => {
    const list = (products || []).filter((p) => p.published !== false);
    // ключ корзины: id или id~цвет
    const items = Object.entries(cart).map(([key, qty]) => { const [id, color] = key.split('~'); return { key, color, p: list.find((x) => x.id === id), qty }; }).filter((x) => x.p);
    return {
      theme, toggleTheme: () => setTheme((t) => (t === 'dark' ? 'light' : 'dark')),
      products: list, allProducts: products || [], loading: products === null,
      cart, items, count: items.reduce((s, x) => s + x.qty, 0), total: items.reduce((s, x) => s + x.p.price * x.qty, 0),
      add: (id, color) => setCart((c) => { const k = color ? `${id}~${color}` : id; return { ...c, [k]: (c[k] || 0) + 1 }; }),
      setQty: (id, q) => setCart((c) => { const n = { ...c }; q <= 0 ? delete n[id] : (n[id] = q); return n; }),
      clear: () => setCart({}),
      favs, isFav: (id) => favs.includes(id),
      toggleFav: (id) => setFavs((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id])),
    };
  }, [theme, cart, favs, products]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};