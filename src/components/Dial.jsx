import { useEffect, useState } from 'react';
export default function Dial() {
  const [t, setT] = useState(new Date());
  useEffect(() => { const i = setInterval(() => setT(new Date()), 1000); return () => clearInterval(i); }, []);
  const s = t.getSeconds() * 6, m = t.getMinutes() * 6 + t.getSeconds() / 10, h = (t.getHours() % 12) * 30 + t.getMinutes() / 2;
  return (
    <svg className="dial" viewBox="0 0 200 200" role="img" aria-label="Циферблат">
      <circle cx="100" cy="100" r="96" className="bezel" />
      {[...Array(60)].map((_, i) => <line key={i} x1="100" y1={i % 5 ? 12 : 8} x2="100" y2="16" className={i % 5 ? 'tick' : 'tick big'} transform={`rotate(${i * 6} 100 100)`} />)}
      <line x1="100" y1="100" x2="100" y2="52" className="hand" style={{ transform: `rotate(${h}deg)`, transformOrigin: '100px 100px' }} />
      <line x1="100" y1="100" x2="100" y2="34" className="hand thin" style={{ transform: `rotate(${m}deg)`, transformOrigin: '100px 100px' }} />
      <line x1="100" y1="112" x2="100" y2="22" className="sec" style={{ transform: `rotate(${s}deg)`, transformOrigin: '100px 100px' }} />
      <circle cx="100" cy="100" r="4" className="sec-dot" />
    </svg>
  );
};