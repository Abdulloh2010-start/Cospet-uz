import { useMemo, useState } from 'react';
import { useStore } from '../lib/store';
import { useSEO } from '../lib/seo';
import Card from '../components/Card';
import Dial from '../components/Dial';

export default function Shop() {
  const { products, loading } = useStore();
  const [q, setQ] = useState(''); const [cat, setCat] = useState('Все'); const [sort, setSort] = useState('new');
  useSEO({ title: 'Kospet — умные часы в Узбекистане', description: 'Защищённые умные часы Kospet Tank, Rugged, Sport. Доставка по Узбекистану, гарантия 12 месяцев.' });

  const cats = useMemo(() => ['Все', ...new Set(products.map((p) => p.category).filter(Boolean))], [products]);
  const list = useMemo(() => {
    let l = products.filter((p) => (cat === 'Все' || p.category === cat) && p.name.toLowerCase().includes(q.toLowerCase()));
    if (sort === 'asc') l = [...l].sort((a, b) => a.price - b.price);
    if (sort === 'desc') l = [...l].sort((a, b) => b.price - a.price);
    return l;
  }, [products, q, cat, sort]);

  return (
    <>
      <section className="hero">
        <div>
          <h1>Часы, которые выдерживают всё</h1>
          <p>Защищённые смарт-часы Kospet: удар, вода, пыль, мороз. Оригинал с гарантией и доставкой по Узбекистану.</p>
          <a href="#catalog" className="btn big">Смотреть каталог</a>
        </div>
        <Dial />
      </section>
      <section id="catalog" className="wrap">
        <div className="tools">
          <input type="search" placeholder="Поиск по названию" value={q} onChange={(e) => setQ(e.target.value)} />
          <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Сортировка">
            <option value="new">По умолчанию</option><option value="asc">Сначала дешевле</option><option value="desc">Сначала дороже</option>
          </select>
        </div>
        <div className="chips">{cats.map((c) => <button key={c} className={c === cat ? 'on' : ''} onClick={() => setCat(c)}>{c}</button>)}</div>
        {loading ? <p className="empty">Загрузка…</p> : list.length ? <div className="grid">{list.map((p) => <Card key={p.id} p={p} />)}</div> : <p className="empty">Ничего не найдено. Измените запрос или категорию.</p>}
      </section>
    </>
  );
}
