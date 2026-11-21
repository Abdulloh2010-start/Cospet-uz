import { lazy, Suspense, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore, money } from '../lib/store';
import { useSEO } from '../lib/seo';
import { createOrder, subscribeMyOrders } from '../lib/db';
import { useAuth } from '../lib/auth';
import { SkRows, SkGrid, Sk, SkLines } from '../components/Skeleton';
import { colorOf } from '../lib/colors';
import { tgUser } from '../lib/tg';
import Card, { Img } from '../components/Card';

export function Favorites() {
  const { products, favs, loading } = useStore();
  useSEO({ title: 'Избранное | Kospet.uz' });
  const list = products.filter((p) => favs.includes(p.id));
  return (
    <section className="wrap"><h1>Избранное</h1>
      {loading ? <SkGrid n={4} /> : list.length ? <div className="grid">{list.map((p) => <Card key={p.id} p={p} />)}</div> : <p className="empty">Здесь пока пусто. Нажмите ♥ на часах, которые понравились. <Link to="/">В каталог</Link></p>}
    </section>
  );
}

const AddressPicker = lazy(() => import('../components/AddressPicker'));

export function Cart() {
  const { items, total, setQty, clear, loading } = useStore();
  const { user, openLogin } = useAuth();
  const [f, setF] = useState({ name: '', phone: '+998', address: '', comment: '', lat: null, lng: null });
  const [st, setSt] = useState('idle'); const [map, setMap] = useState(false);
  useSEO({ title: 'Корзина | Kospet.uz' });
  useEffect(() => { const n = user?.displayName || tgUser()?.name; if (n) setF((x) => (x.name ? x : { ...x, name: n })); }, [user]);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault(); setSt('sending');
    try {
      await createOrder({ ...f, uid: user?.uid ?? null, tg: tgUser(), total,
        items: items.map(({ p, qty, color }) => ({ id: p.id, name: p.name, price: p.price, qty, color: color || null })) });
      clear(); setSt('done');
    } catch { setSt('error'); }
  }
  if (loading) return <section className="wrap cart"><div className="sk-col"><Sk w="40%" h={36} />{[0, 1].map((i) => <div className="line" key={i}><Sk w={72} h={72} r={0} /><div className="sk-col"><Sk w="70%" h={16} /><Sk w="40%" /></div><Sk w={100} h={38} /></div>)}</div><div className="panel"><SkLines n={5} /><Sk h={52} r={0} /></div></section>;
  if (st === 'done') return <section className="wrap"><p className="empty">Заказ принят. Мы свяжемся с вами для подтверждения. <Link to="/">Вернуться в каталог</Link></p></section>;
  if (!items.length) return <section className="wrap"><h1>Корзина</h1><p className="empty">В корзине пусто. <Link to="/">Выбрать часы</Link></p></section>;
  return (
    <section className="wrap cart">
      <div>
        <h1>Корзина</h1>
        {items.map(({ p, qty, key, color }) => (
          <div className="line" key={key}>
            <div className="pic sm"><Img p={p} /></div>
            <div><Link to={`/watch/${p.id}`}>{p.name}</Link>{color && <small className="cdot"><i style={{ background: colorOf(color)?.hex }} />{colorOf(color)?.name}</small>}<b>{money(p.price)}</b></div>
            <div className="qty"><button onClick={() => setQty(key, qty - 1)} aria-label="Меньше">−</button><span>{qty}</span><button onClick={() => setQty(key, Math.min(qty + 1, p.stock))} aria-label="Больше">+</button></div>
          </div>
        ))}
      </div>
      <form className="panel" onSubmit={submit}>
        <h2>Оформление</h2>
        {!user && <p className="hint">Войдите, чтобы заказ сохранился в профиле и можно было оставить отзыв после покупки. <button type="button" onClick={() => openLogin('client')}>Войти</button></p>}
        <label>Имя<input required value={f.name} onChange={set('name')} autoComplete="name" /></label>
        <label>Телефон<input required type="tel" inputMode="tel" pattern="\+998\d{9}" title="Формат: +998901234567" value={f.phone} onChange={set('phone')} autoComplete="tel" /></label>
        <label>Адрес доставки<textarea required rows="2" value={f.address} onChange={set('address')} placeholder="Улица, дом, квартира" /></label>
        {map ? <Suspense fallback={<Sk h={300} />}><AddressPicker onPick={(a) => setF((x) => ({ ...x, ...a }))} /></Suspense>
          : <button type="button" className="btn ghost" onClick={() => setMap(true)}>Выбрать на карте</button>}
        <label>Комментарий<textarea rows="2" value={f.comment} onChange={set('comment')} /></label>
        <div className="sum"><span>Итого</span><b>{money(total)}</b></div>
        {st === 'error' && <p className="no">Не удалось отправить заказ. Проверьте интернет и попробуйте снова.</p>}
        <button className="btn big" disabled={st === 'sending'}>{st === 'sending' ? 'Отправляем…' : 'Оформить заказ'}</button>
      </form>
    </section>
  );
}

const STATUS = { new: 'Новый', confirmed: 'Подтверждён', shipped: 'Отправлен', done: 'Выполнен', cancelled: 'Отменён' };

export function Orders() {
  const { user, loading, openLogin } = useAuth();
  const [orders, setOrders] = useState(null);
  useSEO({ title: 'Мои заказы | Kospet.uz' });
  useEffect(() => (user ? subscribeMyOrders(user.uid, setOrders) : undefined), [user]);
  if (loading) return <section className="wrap"><SkRows /></section>;
  if (!user) return <section className="wrap"><p className="empty">Войдите, чтобы увидеть свои заказы. <button className="linkbtn" onClick={() => openLogin('client')}>Войти</button></p></section>;
  return (
    <section className="wrap narrow"><h1>Мои заказы</h1>
      {orders === null ? <SkRows /> : !orders.length ? <p className="empty">Заказов пока нет. <Link to="/">В каталог</Link></p> : orders.map((o) => (
        <div className="panel order" key={o.id}>
          <div className="head"><b>Заказ #{o.id.slice(0, 6)}</b><span>{o.createdAt?.toDate?.().toLocaleDateString('ru-RU')}</span><span className={`st-tag ${o.status}`}>{STATUS[o.status]}</span></div>
          <ul>{o.items.map((i) => <li key={i.id}><Link to={`/watch/${i.id}`}>{i.name}</Link>{i.color && ` (${colorOf(i.color)?.name})`} × {i.qty}{['shipped', 'done'].includes(o.status) && <Link className="rev-link" to={`/watch/${i.id}#reviews`}>Оставить отзыв</Link>}</li>)}</ul>
          <b>Итого: {money(o.total)}</b>
        </div>
      ))}
    </section>
  );
};