import { Link } from 'react-router-dom';
import { useStore, money } from '../lib/store';

export const Img = ({ p, ...r }) => p.image
  ? <img src={p.image} alt={p.name} loading="lazy" {...r} />
  : <div className="ph" {...r}><svg viewBox="0 0 100 100"><rect x="38" y="4" width="24" height="18" rx="4" /><rect x="38" y="78" width="24" height="18" rx="4" /><circle cx="50" cy="50" r="26" /><path d="M50 36v14l9 6" /></svg></div>;

export default function Card({ p }) {
  const { add, isFav, toggleFav } = useStore();
  const sale = p.oldPrice > p.price ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;
  return (
    <article className="card">
      <button className={`fav ${isFav(p.id) ? 'on' : ''}`} onClick={() => toggleFav(p.id)} aria-label="В избранное">♥</button>
      {sale > 0 && <span className="badge">−{sale}%</span>}
      <Link to={`/watch/${p.id}`} className="pic"><Img p={p} /></Link>
      <div className="info">
        <small>{p.category}</small>
        <Link to={`/watch/${p.id}`}><h3>{p.name}</h3></Link>
        <div className="price"><b>{money(p.price)}</b>{sale > 0 && <s>{money(p.oldPrice)}</s>}</div>
        <button className="btn" disabled={p.stock <= 0} onClick={() => add(p.id)}>{p.stock > 0 ? 'В корзину' : 'Нет в наличии'}</button>
      </div>
    </article>
  );
}
