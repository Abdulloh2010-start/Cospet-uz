import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { COLORS } from '../lib/colors';
import { useStore, money } from '../lib/store';
import { useAuth } from '../lib/auth';
import { useSEO } from '../lib/seo';
import { subscribeReviews, subscribeMyOrders, addReview, deleteReview } from '../lib/db';
import { Img } from '../components/Card';
import { Stars, StarInput } from '../components/Stars';
import { SkProduct, SkLines } from '../components/Skeleton';

function Reviews({ p }) {
  const { user, admin, openLogin } = useAuth();
  const [list, setList] = useState(null); const [orders, setOrders] = useState([]);
  const [rating, setRating] = useState(5); const [text, setText] = useState(''); const [busy, setBusy] = useState(false); const [err, setErr] = useState('');
  useEffect(() => subscribeReviews(p.id, setList), [p.id]);
  useEffect(() => (user ? subscribeMyOrders(user.uid, setOrders) : undefined), [user]);

  const avg = list?.length ? list.reduce((s, r) => s + r.rating, 0) / list.length : 0;
  const has = (o) => (o.productIds || o.items?.map((i) => i.id) || []).includes(p.id);
  const mine = user ? orders.filter(has) : [];
  const ready = mine.filter((o) => ['shipped', 'done'].includes(o.status));
  const order = list && ready.find((o) => !list.some((r) => r.id === `${o.id}_${p.id}`));
  const why = !user ? 'login' : !mine.length ? 'none' : !ready.length ? 'wait' : 'done';

  async function send(e) {
    e.preventDefault(); setBusy(true); setErr('');
    try { await addReview({ productId: p.id, orderId: order.id, uid: user.uid, name: user.displayName || 'Клиент', rating, text: text.trim() }); setText(''); setRating(5); }
    catch { setErr('Не удалось отправить отзыв. Попробуйте ещё раз.'); } finally { setBusy(false); }
  }
  return (
    <section id="reviews" className="reviews">
      <div className="rev-head"><h2>Отзывы</h2>{list?.length > 0 && <div className="avg"><b>{avg.toFixed(1)}</b><Stars value={avg} /><small>{list.length} шт.</small></div>}</div>
      {order ? (
        <form className="panel" onSubmit={send}>
          <b>Вы купили эти часы — поделитесь впечатлением</b>
          <StarInput value={rating} onChange={setRating} />
          <textarea rows="3" required maxLength={1000} placeholder="Что понравилось, как часы в носке?" value={text} onChange={(e) => setText(e.target.value)} />
          {err && <p className="no">{err}</p>}
          <button className="btn" disabled={busy}>{busy ? 'Отправляем…' : 'Отправить отзыв'}</button>
        </form>
      ) : list && (
        <p className="hint">
          {why === 'login' && <>Отзыв могут оставить покупатели после получения заказа. <button onClick={() => openLogin('client')}>Войти</button></>}
          {why === 'none' && 'На вашем аккаунте нет заказа с этими часами. Заказ должен быть оформлен, когда вы уже вошли в аккаунт.'}
          {why === 'wait' && 'Заказ с этими часами ещё не отправлен. Форма откроется, когда админ поставит статус «Отправлен» или «Выполнен».'}
          {why === 'done' && 'Вы уже оставили отзыв на эти часы.'}
        </p>
      )}
      {list === null ? <SkLines n={4} /> : !list.length ? <p className="empty sm">Пока нет отзывов. Станьте первым после покупки.</p> : list.map((r) => (
        <article className="review" key={r.id}>
          <div className="top"><b>{r.name}</b><Stars value={r.rating} size={15} /><small>{r.createdAt?.toDate?.().toLocaleDateString('ru-RU')}</small>
            {admin && <button className="linkbtn danger" onClick={() => confirm('Удалить отзыв?') && deleteReview(r.id)}>Удалить</button>}</div>
          <p>{r.text}</p>
        </article>
      ))}
    </section>
  );
}

export default function Product() {
  const { id } = useParams();
  const { products, loading, add, isFav, toggleFav } = useStore();
  const p = products.find((x) => x.id === id);
  const [color, setColor] = useState(null); const [img, setImg] = useState(0); const [added, setAdded] = useState(false);
  useEffect(() => { setColor(p?.colors?.[0] || null); setImg(0); }, [p?.id]);
  const images = p ? (p.images?.length ? p.images : p.image ? [p.image] : []) : [];
  useSEO({
    title: p ? `${p.name} — купить в Узбекистане | Kospet.uz` : 'Часы Kospet',
    description: p?.description, image: images[0],
    jsonLd: p && { '@context': 'https://schema.org', '@type': 'Product', name: p.name, description: p.description, image: images[0], brand: { '@type': 'Brand', name: 'Kospet' },
      offers: { '@type': 'Offer', priceCurrency: 'UZS', price: p.price, availability: p.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock' } },
  });
  if (loading) return <SkProduct />;
  if (!p) return <p className="empty">Товар не найден. <Link to="/">В каталог</Link></p>;
  const specs = (p.specs || '').split('\n').map((l) => l.split(':')).filter((r) => r[1]);
  const buy = () => { add(p.id, color); setAdded(true); setTimeout(() => setAdded(false), 1600); };
  return (
    <div className="wrap">
      <section className="product">
        <div className="gallery">
          <div className="pic big"><Img p={{ ...p, image: images[img] }} /></div>
          {images.length > 1 && <div className="thumbs">{images.map((src, i) => <button key={i} className={i === img ? 'on' : ''} onClick={() => setImg(i)} aria-label={`Фото ${i + 1}`}><img src={src} alt="" /></button>)}</div>}
        </div>
        <div>
          <small>{p.category}</small>
          <h1>{p.name}</h1>
          <div className="colors" role="radiogroup" aria-label="Цвет">
            <span className="lbl">Цвет: <b>{COLORS.find((c) => c.id === color)?.name || 'нет в наличии'}</b></span>
            <div>{COLORS.map((c) => { const ok = p.colors?.includes(c.id); return (
              <button key={c.id} role="radio" aria-checked={color === c.id} disabled={!ok} className={`sw ${color === c.id ? 'on' : ''} ${ok ? '' : 'off'}`} title={ok ? c.name : `${c.name} — нет в наличии`} onClick={() => setColor(c.id)} style={ok ? { '--c': c.hex } : undefined}><span /></button>
            ); })}</div>
          </div>
          <div className="price lg"><b>{money(p.price)}</b>{p.oldPrice > p.price && <s>{money(p.oldPrice)}</s>}</div>
          <p>{p.description}</p>
          <p className={p.stock > 0 ? 'ok' : 'no'}>{p.stock > 0 ? `В наличии: ${p.stock} шт.` : 'Нет в наличии'}</p>
          <div className="row buy">
            <button className="btn big" disabled={p.stock <= 0} onClick={buy}>{added ? 'Добавлено ✓' : 'В корзину'}</button>
            <button className={`btn ghost big ${isFav(p.id) ? 'on' : ''}`} onClick={() => toggleFav(p.id)}>{isFav(p.id) ? 'В избранном' : 'В избранное'}</button>
          </div>
          {specs.length > 0 && <table className="specs"><tbody>{specs.map(([k, v]) => <tr key={k}><th>{k}</th><td>{v}</td></tr>)}</tbody></table>}
        </div>
      </section>
      <div className="sticky-buy"><div><b>{money(p.price)}</b><small>{p.name}</small></div><button className="btn" disabled={p.stock <= 0} onClick={buy}>{added ? 'Добавлено ✓' : 'В корзину'}</button></div>
      <Reviews p={p} />
    </div>
  );
};