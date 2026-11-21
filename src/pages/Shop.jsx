import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../lib/store';
import { useSEO } from '../lib/seo';
import { subscribeLatestReviews } from '../lib/db';
import Card from '../components/Card';
import Dial from '../components/Dial';
import { Stars } from '../components/Stars';
import { SkGrid, Sk } from '../components/Skeleton';

const WHY = [
  { t: 'Оригинал', d: 'Только официальная продукция Kospet с проверкой при выдаче', i: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10zM9 12l2 2 4-4' },
  { t: 'Гарантия работы', d: 'Бесплатный ремонт или замена если есть гарантия', i: 'M12 8v4l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z' },
  { t: 'Доставка по стране', d: 'По Ташкенту за день, в регионы — 1–3 дня', i: 'M1 3h15v13H1zM16 8h4l3 3v5h-7zM5.5 21a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM18.5 21a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z' },
  { t: 'Оплата при получении', d: 'Проверьте часы и платите только когда всё устраивает', i: 'M2 6h20v12H2zM2 10h20' },
];
const FAQ = [
  ['Часы действительно защищённые?', 'Да. Модели серий Tank и Rugged выдерживают удары, воду (5ATM), пыль и перепады температур. Класс защиты указан в характеристиках каждой модели.'],
  ['Как быстро придёт заказ?', 'Оформите заказ, и мы свяжемся с вами для подтверждения. По Ташкенту доставляем в течение дня, в другие города Узбекистана — за 1–3 дня.'],
  ['Можно ли вернуть или обменять часы?', 'Да, в течение гарантийного срока. Если часы не подошли, обмен возможен при сохранении упаковки и товарного вида.'],
  ['Как оставить отзыв?', 'После того как заказ отправлен вам, в разделе «Мои заказы» появится кнопка «Оставить отзыв». Отзывы доступны только покупателям.'],
];

export default function Shop() {
  const { products, loading } = useStore();
  const [q, setQ] = useState(''); const [cat, setCat] = useState('Все'); const [sort, setSort] = useState('new'); const [reviews, setReviews] = useState(null);
  useSEO({ title: 'Kospet — умные часы в Узбекистане', description: 'Защищённые умные часы Kospet Tank, Rugged, Sport. Доставка по Узбекистану, гарантия 12 месяцев.' });
  useEffect(() => subscribeLatestReviews(setReviews), []);

  const cats = useMemo(() => ['Все', ...new Set(products.map((p) => p.category).filter(Boolean))], [products]);
  const hot = useMemo(() => { const sale = products.filter((p) => p.oldPrice > p.price); return { title: sale.length ? 'Выгодные предложения' : 'Новинки', list: (sale.length ? sale : products).slice(0, 8) }; }, [products]);
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
          <div className="specs-row"><span>5ATM</span><span>IP69K</span><span>до 25 дней</span><span>GPS</span></div>
          <a href="#catalog" className="btn big">Смотреть каталог</a>
        </div>
        <Dial />
      </section>

      <section className="why wrap-x">{WHY.map((w) => (
        <div key={w.t}><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={w.i} /></svg><b>{w.t}</b><span>{w.d}</span></div>
      ))}</section>

      <section id="catalog" className="wrap sec">
        <div className="sec-head"><h2>Каталог</h2></div>
        <div className="tools">
          <input type="search" placeholder="Поиск по названию" value={q} onChange={(e) => setQ(e.target.value)} />
          <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Сортировка">
            <option value="new">По умолчанию</option><option value="asc">Сначала дешевле</option><option value="desc">Сначала дороже</option>
          </select>
        </div>
        <div className="chips">{cats.map((c) => <button key={c} className={c === cat ? 'on' : ''} onClick={() => setCat(c)}>{c}</button>)}</div>
        {loading ? <SkGrid /> : list.length ? <div className="grid">{list.map((p) => <Card key={p.id} p={p} />)}</div> : <p className="empty">Ничего не найдено. Измените запрос или категорию.</p>}
      </section>

      <section className="wrap sec faq"><div className="sec-head"><h2>Частые вопросы</h2></div>
        {FAQ.map(([qq, a]) => <details key={qq}><summary>{qq}</summary><p>{a}</p></details>)}
      </section>
    </>
  );
};