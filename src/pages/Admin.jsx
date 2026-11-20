import { useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { isAdmin, subscribeOrders, setOrderStatus, saveProduct, deleteProduct, uploadImage, seedDemo } from '../lib/db';
import { useStore, money } from '../lib/store';
import { useSEO } from '../lib/seo';
import { Link } from 'react-router-dom';

const STATUS = { new: 'Новый', confirmed: 'Подтверждён', shipped: 'Отправлен', done: 'Выполнен', cancelled: 'Отменён' };

function Login({ error }) {
  const [e, setE] = useState(''); const [p, setP] = useState(''); const [err, setErr] = useState(error);
  const go = async (ev) => { ev.preventDefault(); try { await signInWithEmailAndPassword(auth, e, p); setErr(''); } catch { setErr('Неверная почта или пароль'); } };
  return (
    <form className="panel login" onSubmit={go}>
      <h1>Вход в админ-панель</h1>
      <label>Почта<input type="email" required value={e} onChange={(x) => setE(x.target.value)} /></label>
      <label>Пароль<input type="password" required value={p} onChange={(x) => setP(x.target.value)} /></label>
      {err && <p className="no">{err}</p>}
      <button className="btn big">Войти</button>
    </form>
  );
}

function Orders() {
  const [orders, setOrders] = useState([]);
  useEffect(() => subscribeOrders(setOrders), []);
  if (!orders.length) return <p className="empty">Заказов пока нет. Новые появятся здесь сами.</p>;
  return orders.map((o) => (
    <div className="panel order" key={o.id}>
      <div className="head"><b>#{o.id.slice(0, 6)}</b><span>{o.createdAt?.toDate?.().toLocaleString('ru-RU')}</span>
        <select value={o.status} onChange={(e) => setOrderStatus(o.id, e.target.value)} className={`st ${o.status}`}>{Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
      <p>{o.name} · <a href={`tel:${o.phone}`}>{o.phone}</a><br />{o.address}{o.comment && <><br /><i>{o.comment}</i></>}</p>
      <ul>{o.items.map((i) => <li key={i.id}>{i.name} × {i.qty} — {money(i.price * i.qty)}</li>)}</ul>
      <b>Итого: {money(o.total)}</b>
    </div>
  ));
}

const EMPTY = { name: '', category: '', price: 0, oldPrice: 0, stock: 0, image: '', description: '', specs: '', published: true };

function Products() {
  const { allProducts } = useStore();
  const [f, setF] = useState(null); const [busy, setBusy] = useState(false);
  const set = (k, num) => (e) => setF({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : num ? +e.target.value : e.target.value });
  const upload = async (e) => { const file = e.target.files[0]; if (!file) return; setBusy(true); try { setF({ ...f, image: await uploadImage(file) }); } finally { setBusy(false); } };
  const save = async (e) => { e.preventDefault(); await saveProduct(f); setF(null); };

  if (f) return (
    <form className="panel" onSubmit={save}>
      <h2>{f.id ? 'Изменить товар' : 'Новый товар'}</h2>
      <label>Название<input required value={f.name} onChange={set('name')} /></label>
      <label>Категория<input required value={f.category} onChange={set('category')} placeholder="Tank, Rugged, Sport…" /></label>
      <div className="two">
        <label>Цена, сум<input type="number" min="0" required value={f.price} onChange={set('price', 1)} /></label>
        <label>Старая цена<input type="number" min="0" value={f.oldPrice} onChange={set('oldPrice', 1)} /></label>
        <label>Остаток, шт.<input type="number" min="0" required value={f.stock} onChange={set('stock', 1)} /></label>
      </div>
      <label>Фото (ссылка или загрузка)<input value={f.image} onChange={set('image')} placeholder="https://…" /><input type="file" accept="image/*" onChange={upload} /></label>
      {busy && <p>Загружаем фото…</p>}
      <label>Описание<textarea rows="3" value={f.description} onChange={set('description')} /></label>
      <label>Характеристики (каждая с новой строки, «Название: значение»)<textarea rows="5" value={f.specs} onChange={set('specs')} /></label>
      <label className="chk"><input type="checkbox" checked={f.published} onChange={set('published')} /> Показывать в магазине</label>
      <div className="row"><button className="btn" disabled={busy}>Сохранить</button><button type="button" className="btn ghost" onClick={() => setF(null)}>Отмена</button></div>
    </form>
  );
  return (
    <>
      <div className="row"><button className="btn" onClick={() => setF(EMPTY)}>Добавить товар</button>{!allProducts.length && <button className="btn ghost" onClick={seedDemo}>Загрузить демо-товары</button>}</div>
      <div className="table">{allProducts.map((p) => (
        <div className="panel prow" key={p.id}>
          <div><b>{p.name}</b><small>{p.category} · {money(p.price)} · остаток {p.stock}{p.published === false ? ' · скрыт' : ''}</small></div>
          <div className="row"><button className="btn ghost" onClick={() => setF(p)}>Изменить</button><button className="btn ghost danger" onClick={() => confirm(`Удалить «${p.name}»?`) && deleteProduct(p.id)}>Удалить</button></div>
        </div>))}</div>
    </>
  );
}

export default function Admin() {
  useSEO({ title: 'Админ-панель' });
  const [user, setUser] = useState(undefined); const [ok, setOk] = useState(false); const [tab, setTab] = useState('orders');
  useEffect(() => onAuthStateChanged(auth, async (u) => { setUser(u); setOk(u ? await isAdmin(u.uid) : false); }), []);
  if (user === undefined) return <p className="empty">Загрузка…</p>;
  if (!user) return <div className="wrap"><Login /></div>;
  if (!ok) return <div className="wrap"><p className="empty">У аккаунта {user.email} нет прав администратора. Добавьте документ admins/{user.uid} в Firestore.</p><button className="btn ghost" onClick={() => signOut(auth)}>Выйти</button></div>;
  return (
    <div className="wrap admin">
      <header className="adm-top"><b>Kospet · Админ</b>
        <div className="chips"><button className={tab === 'orders' ? 'on' : ''} onClick={() => setTab('orders')}>Заказы</button><button className={tab === 'products' ? 'on' : ''} onClick={() => setTab('products')}>Товары</button></div>
        <span><Link to="/">Магазин</Link> · <a href="#" onClick={(e) => { e.preventDefault(); signOut(auth); }}>Выйти</a></span></header>
      {tab === 'orders' ? <Orders /> : <Products />}
    </div>
  );
}
