import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSEO } from '../lib/seo';
import Dial from '../components/Dial';

export default function NotFound() {
  useSEO({ title: 'Страница не найдена | Kospet.uz' });
  useEffect(() => { const m = document.createElement('meta'); m.name = 'robots'; m.content = 'noindex'; document.head.appendChild(m); return () => m.remove(); }, []);
  return (
    <section className="wrap nf">
      <Dial />
      <div><h1>404</h1><h2>Время вышло: такой страницы нет</h2><p>Возможно, ссылка устарела или товар убрали из каталога.</p>
        <div className="row"><Link to="/" className="btn big">На главную</Link><Link to="/favorites" className="btn ghost big">Избранное</Link></div></div>
    </section>
  );
};