import { Link, useParams } from 'react-router-dom';
import { useStore, money } from '../lib/store';
import { useSEO } from '../lib/seo';
import { Img } from '../components/Card';

export default function Product() {
  const { id } = useParams();
  const { products, loading, add, isFav, toggleFav } = useStore();
  const p = products.find((x) => x.id === id);
  useSEO({
    title: p ? `${p.name} — купить в Узбекистане | Kospet.uz` : 'Часы Kospet',
    description: p?.description, image: p?.image,
    jsonLd: p && { '@context': 'https://schema.org', '@type': 'Product', name: p.name, description: p.description, image: p.image, brand: { '@type': 'Brand', name: 'Kospet' },
      offers: { '@type': 'Offer', priceCurrency: 'UZS', price: p.price, availability: p.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock' } },
  });
  if (loading) return <p className="empty">Загрузка…</p>;
  if (!p) return <p className="empty">Товар не найден. <Link to="/">В каталог</Link></p>;
  const specs = (p.specs || '').split('\n').map((l) => l.split(':')).filter((r) => r[1]);
  return (
    <section className="wrap product">
      <div className="pic big"><Img p={p} /></div>
      <div>
        <small>{p.category}</small>
        <h1>{p.name}</h1>
        <div className="price lg"><b>{money(p.price)}</b>{p.oldPrice > p.price && <s>{money(p.oldPrice)}</s>}</div>
        <p>{p.description}</p>
        <p className={p.stock > 0 ? 'ok' : 'no'}>{p.stock > 0 ? `В наличии: ${p.stock} шт.` : 'Нет в наличии'}</p>
        <div className="row">
          <button className="btn big" disabled={p.stock <= 0} onClick={() => add(p.id)}>В корзину</button>
          <button className={`btn ghost ${isFav(p.id) ? 'on' : ''}`} onClick={() => toggleFav(p.id)}>{isFav(p.id) ? 'В избранном' : 'В избранное'}</button>
        </div>
        {specs.length > 0 && <table className="specs"><tbody>{specs.map(([k, v]) => <tr key={k}><th>{k}</th><td>{v}</td></tr>)}</tbody></table>}
      </div>
    </section>
  );
}
