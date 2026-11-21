import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { SkRows } from '../components/Skeleton';
import Dropzone from '../components/Dropzone';
import { subscribeOrders, setOrderStatus, saveProduct, deleteProduct, seedDemo } from '../lib/db';
import { useStore, money } from '../lib/store';
import { COLORS, colorOf } from '../lib/colors';
import { useSEO } from '../lib/seo';

const STATUS = { new: 'Новый', confirmed: 'Подтверждён', shipped: 'Отправлен', done: 'Выполнен', cancelled: 'Отменён' };
const mapLink = (o) => `https://yandex.com/maps/?pt=${o.lng},${o.lat}&z=17&l=map`;

function Order({ o }) {
  const [open, setOpen] = useState(false);
  const qty = o.items.reduce((s, i) => s + i.qty, 0);
  return (
    <div className={`panel order acc-row ${open ? 'open' : ''} ${o.status === 'new' ? 'is-new' : ''}`}>
      <button className="head" onClick={() => setOpen(!open)} aria-expanded={open}>
        <span className="id"><b>#{o.id.slice(0, 6)}</b><small>{o.createdAt?.toDate?.().toLocaleString('ru-RU')}</small></span>
        <span className="who">{o.name}<small>{qty} шт. · {money(o.total)}</small></span>
        <span className={`st-tag ${o.status}`}>{STATUS[o.status]}</span>
        <span className="chev" aria-hidden="true">⌄</span>
      </button>
      {open && (
        <div className="detail">
          <div className="cols">
            <div><small>Клиент</small><b>{o.name}</b><a href={`tel:${o.phone}`}>{o.phone}</a>
              {o.tg?.username && <a href={`https://t.me/${o.tg.username}`} target="_blank" rel="noopener noreferrer">@{o.tg.username}</a>}
              {o.source === 'telegram' || o.tg ? <small>Заказ из Telegram</small> : null}</div>
            <div><small>Адрес</small><span>{o.address}</span>{o.lat && <a href={mapLink(o)} target="_blank" rel="noopener noreferrer">Открыть на карте</a>}</div>
            {o.comment && <div><small>Комментарий</small><i>{o.comment}</i></div>}
          </div>
          <ul>{o.items.map((i, n) => <li key={n}>{i.name}{i.color && <span className="cdot"><i style={{ background: colorOf(i.color)?.hex }} />{colorOf(i.color)?.name}</span>} × {i.qty} — {money(i.price * i.qty)}</li>)}</ul>
          <div className="foot-row"><b>Итого: {money(o.total)}</b>
            <label>Статус<select value={o.status} onChange={(e) => setOrderStatus(o.id, e.target.value)} className={`st ${o.status}`}>{Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></label></div>
        </div>
      )}
    </div>
  );
}

const Orders = ({ orders }) => orders === null ? <SkRows /> : !orders.length ? <p className="empty">Заказов пока нет. Новые появятся здесь сами.</p> : orders.map((o) => <Order key={o.id} o={o} />);

const EMPTY = { name: '', category: '', price: '', oldPrice: '', stock: '', images: [], colors: [], description: '', specs: '', published: true };

function Products() {
  const { allProducts } = useStore();
  const [f, setF] = useState(null); const [saving, setSaving] = useState(false);
  const edit = (p) => setF({ ...EMPTY, ...p, oldPrice: p.oldPrice || '', images: p.images?.length ? p.images : p.image ? [p.image] : [], colors: p.colors || [] });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });
  const toggle = (id) => setF({ ...f, colors: f.colors.includes(id) ? f.colors.filter((c) => c !== id) : [...f.colors, id] });
  const save = async (e) => {
    e.preventDefault(); setSaving(true);
    try { await saveProduct({ ...f, price: +f.price || 0, oldPrice: +f.oldPrice || 0, stock: +f.stock || 0, image: f.images[0] || '' }); setF(null); }
    catch (err) { alert('Не удалось сохранить: ' + err.message); } finally { setSaving(false); }
  };

  if (f) return (
    <form className="panel" onSubmit={save}>
      <h2>{f.id ? 'Изменить товар' : 'Новый товар'}</h2>
      <label>Название<input required value={f.name} onChange={set('name')} /></label>
      <label>Категория<input required value={f.category} onChange={set('category')} placeholder="Tank, Rugged, Sport…" /></label>
      <div className="two">
        <label>Цена, сум<input type="number" inputMode="numeric" min="0" required value={f.price} onChange={set('price')} placeholder="Например, 1890000" /></label>
        <label>Старая цена<input type="number" inputMode="numeric" min="0" value={f.oldPrice} onChange={set('oldPrice')} placeholder="Если есть скидка" /></label>
        <label>Остаток, шт.<input type="number" inputMode="numeric" min="0" required value={f.stock} onChange={set('stock')} placeholder="0" /></label>
      </div>
      <div className="field"><span className="lbl">Фото</span><Dropzone images={f.images} onChange={(images) => setF((x) => ({ ...x, images }))} /></div>
      <div className="field"><span className="lbl">Доступные цвета</span>
        <div className="color-pick">{COLORS.map((c) => <button type="button" key={c.id} className={f.colors.includes(c.id) ? 'on' : ''} onClick={() => toggle(c.id)} aria-pressed={f.colors.includes(c.id)}><i style={{ background: c.hex }} />{c.name}</button>)}</div>
        <small>Цвета, которых нет в списке, покупатель увидит серыми и не сможет выбрать.</small></div>
      <label>Описание<textarea rows="3" value={f.description} onChange={set('description')} /></label>
      <label>Характеристики (каждая с новой строки, «Название: значение»)<textarea rows="5" value={f.specs} onChange={set('specs')} /></label>
      <label className="chk"><input type="checkbox" checked={f.published} onChange={set('published')} /> Показывать в магазине</label>
      <div className="row"><button className="btn big" disabled={saving}>{saving ? 'Сохраняем…' : 'Сохранить'}</button><button type="button" className="btn ghost big" onClick={() => setF(null)}>Отмена</button></div>
    </form>
  );
  return (
    <>
      <div className="row"><button className="btn" onClick={() => setF(EMPTY)}>Добавить товар</button>{!allProducts.length && <button className="btn ghost" onClick={seedDemo}>Загрузить демо-товары</button>}</div>
      <div className="table">{allProducts.map((p) => (
        <div className="panel prow" key={p.id}>
          <div className="pthumb">{p.image ? <img src={p.image} alt="" /> : <span />}</div>
          <div><b>{p.name}</b><small>{p.category} · {money(p.price)} · остаток {p.stock}{p.published === false ? ' · скрыт' : ''}</small></div>
          <div className="row"><button className="btn ghost" onClick={() => edit(p)}>Изменить</button><button className="btn ghost danger" onClick={() => confirm(`Удалить «${p.name}»?`) && deleteProduct(p.id)}>Удалить</button></div>
        </div>))}</div>
    </>
  );
}

export default function Admin() {
  useSEO({ title: 'Админ-панель' });
  const { user, admin, loading, openLogin, logout } = useAuth();
  const [tab, setTab] = useState('orders'); const [orders, setOrders] = useState(null);
  useEffect(() => (admin ? subscribeOrders(setOrders) : undefined), [admin]);
  if (loading) return <div className="wrap"><SkRows /></div>;
  if (!user || !admin) return (
    <div className="wrap narrow"><div className="panel center">
      <h1>Админ-панель</h1>
      <p>{user ? `У аккаунта ${user.email} нет прав администратора.` : 'Войдите как администратор, чтобы управлять товарами и заказами.'}</p>
      <div className="row center"><button className="btn big" onClick={() => openLogin('admin')}>Войти как админ</button>{user && <button className="btn ghost big" onClick={logout}>Выйти</button>}</div>
    </div></div>
  );
  const fresh = orders?.filter((o) => o.status === 'new').length || 0;
  return (
    <div className="wrap admin">
      <header className="adm-top"><b>Kospet · Админ</b>
        <div className="chips"><button className={tab === 'orders' ? 'on' : ''} onClick={() => setTab('orders')}>Заказы{fresh > 0 && <em className="cnt">{fresh}</em>}</button><button className={tab === 'products' ? 'on' : ''} onClick={() => setTab('products')}>Товары</button></div>
        <span><Link to="/">Магазин</Link> · <button className="linkbtn" onClick={logout}>Выйти</button></span></header>
      {tab === 'orders' ? <Orders orders={orders} /> : <Products />}
    </div>
  );
};