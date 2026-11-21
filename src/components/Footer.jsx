import { Link } from 'react-router-dom';
import { SITE } from '../config';

const S = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' };
const links = [
  { href: SITE.instagram, label: 'Instagram', icon: <svg width="22" height="22" viewBox="0 0 24 24" {...S}><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r=".6" fill="currentColor" /></svg> },
  { href: SITE.telegram, label: 'Telegram', icon: <svg width="22" height="22" viewBox="0 0 24 24" {...S}><path d="M22 2 11 13M22 2l-7 20-4-9-9-4z" /></svg> },
  { href: `tel:${SITE.phone.replace(/\s/g, '')}`, label: 'Позвонить', icon: <svg width="22" height="22" viewBox="0 0 24 24" {...S}><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z" /></svg> },
];
export default function Footer() {
  return (
    <footer className="foot">
      <div className="foot-in">
        <div><Link to="/" className="logo">KOSPET<span>.uz</span></Link><p>Защищённые умные часы с гарантией и доставкой по Узбекистану.</p></div>
        <div><b>Покупателям</b><Link to="/">Каталог</Link><Link to="/favorites">Избранное</Link><Link to="/cart">Корзина</Link><Link to="/orders">Мои заказы</Link></div>
        <div><b>Связь</b><a href={`tel:${SITE.phone.replace(/\s/g, '')}`}>{SITE.phone}</a><span>{SITE.hours}</span><span>{SITE.city}</span></div>
        <div><b>Мы в соцсетях</b><div className="socials">{links.map((l) => <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer" aria-label={l.label} title={l.label}>{l.icon}</a>)}</div></div>
      </div>
      <p className="copy">© {new Date().getFullYear()} {SITE.name} · Доставка по Узбекистану · Гарантия 12 месяцев</p>
    </footer>
  );
};