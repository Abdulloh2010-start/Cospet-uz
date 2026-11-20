import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore, money } from '../lib/store';
import { useSEO } from '../lib/seo';
import { createOrder } from '../lib/db';
import Card, { Img } from '../components/Card';

export function Favorites() {
  const { products, favs } = useStore();
  useSEO({ title: 'Избранное | Kospet.uz' });
  const list = products.filter((p) => favs.includes(p.id));
  return (
    <section className="wrap"><h1>Избранное</h1>
      {list.length ? <div className="grid">{list.map((p) => <Card key={p.id} p={p} />)}</div> : <p className="empty">Здесь пока пусто. Нажмите ♥ на часах, которые понравились. <Link to="/">В каталог</Link></p>}
    </section>
  );
}

export function Cart() {
  const { items, total, setQty, clear } = useStore();
  const [f, setF] = useState({ name: '', phone: '+998', address: '', comment: '' });
  const [st, setSt] = useState('idle');
  useSEO({ title: 'Корзина | Kospet.uz' });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault(); setSt('sending');
    try {
      await createOrder({ ...f, total, items: items.map(({ p, qty }) => ({ id: p.id, name: p.name, price: p.price, qty })) });
      clear(); setSt('done');
    } catch { setSt('error'); }
  }
  if (st === 'done') return <section className="wrap"><p className="empty">Заказ принят. Мы свяжемся с вами по телефону для подтверждения. <Link to="/">Вернуться в каталог</Link></p></section>;
  if (!items.length) return <section className="wrap"><h1>Корзина</h1><p className="empty">В корзине пусто. <Link to="/">Выбрать часы</Link></p></section>;
  return (
    <section className="wrap cart">
      <div>
        <h1>Корзина</h1>
        {items.map(({ p, qty }) => (
          <div className="line" key={p.id}>
            <div className="pic sm"><Img p={p} /></div>
            <div><Link to={`/watch/${p.id}`}>{p.name}</Link><b>{money(p.price)}</b></div>
            <div className="qty"><button onClick={() => setQty(p.id, qty - 1)} aria-label="Меньше">−</button><span>{qty}</span><button onClick={() => setQty(p.id, Math.min(qty + 1, p.stock))} aria-label="Больше">+</button></div>
          </div>
        ))}
      </div>
      <form className="panel" onSubmit={submit}>
        <h2>Оформление</h2>
        <label>Имя<input required value={f.name} onChange={set('name')} autoComplete="name" /></label>
        <label>Телефон<input required type="tel" pattern="\+998\d{9}" title="Формат: +998901234567" value={f.phone} onChange={set('phone')} autoComplete="tel" /></label>
        <label>Адрес доставки<textarea required rows="2" value={f.address} onChange={set('address')} /></label>
        <label>Комментарий<textarea rows="2" value={f.comment} onChange={set('comment')} /></label>
        <div className="sum"><span>Итого</span><b>{money(total)}</b></div>
        {st === 'error' && <p className="no">Не удалось отправить заказ. Проверьте интернет и попробуйте снова.</p>}
        <button className="btn big" disabled={st === 'sending'}>{st === 'sending' ? 'Отправляем…' : 'Оформить заказ'}</button>
      </form>
    </section>
  );
}
