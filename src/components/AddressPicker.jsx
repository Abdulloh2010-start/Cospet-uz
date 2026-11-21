import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const TASHKENT = [41.3111, 69.2797];
const NOM = 'https://nominatim.openstreetmap.org';
const short = (j) => {
  const a = j.address || {};
  const street = [a.road || a.pedestrian || a.neighbourhood, a.house_number].filter(Boolean).join(', ');
  return [street, a.suburb || a.city_district, a.city || a.town].filter(Boolean).join(', ') || j.display_name || '';
};

export default function AddressPicker({ onPick }) {
  const el = useRef(); const map = useRef(); const timer = useRef(); const touched = useRef(false);
  const [q, setQ] = useState(''); const [list, setList] = useState([]); const [loading, setLoading] = useState(false); const [geo, setGeo] = useState('');

  useEffect(() => {
    const m = (map.current = L.map(el.current, { zoomControl: false, attributionControl: true }).setView(TASHKENT, 12));
    L.control.zoom({ position: 'bottomright' }).addTo(m);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '© OpenStreetMap' }).addTo(m);
    m.on('movestart', () => { touched.current = true; });
    m.on('moveend', () => {
      if (!touched.current) return;
      clearTimeout(timer.current);
      timer.current = setTimeout(async () => {
        const { lat, lng } = m.getCenter(); setLoading(true);
        try {
          const j = await (await fetch(`${NOM}/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=ru`)).json();
          onPick({ address: short(j), lat, lng });
        } catch { onPick({ address: '', lat, lng }); } finally { setLoading(false); }
      }, 500);
    });
    return () => { clearTimeout(timer.current); m.remove(); };
  }, []);

  useEffect(() => {
    if (q.trim().length < 3) return setList([]);
    const t = setTimeout(async () => {
      try { setList(await (await fetch(`${NOM}/search?format=jsonv2&q=${encodeURIComponent(q)}&countrycodes=uz&addressdetails=1&limit=5&accept-language=ru`)).json()); } catch { setList([]); }
    }, 450);
    return () => clearTimeout(t);
  }, [q]);

  const fly = (lat, lng, z = 17) => { touched.current = true; map.current.flyTo([lat, lng], z, { duration: 0.8 }); };
  const locate = () => {
    setGeo('');
    if (!navigator.geolocation) return setGeo('Браузер не поддерживает геолокацию');
    navigator.geolocation.getCurrentPosition((p) => fly(p.coords.latitude, p.coords.longitude), () => setGeo('Не удалось определить местоположение. Разрешите доступ или найдите адрес поиском.'), { timeout: 8000 });
  };

  return (
    <div className="addr">
      <div className="addr-search">
        <input type="search" placeholder="Найти улицу или дом" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Поиск адреса" />
        <button type="button" className="btn ghost" onClick={locate}>Я здесь</button>
        {list.length > 0 && (
          <ul className="sug">{list.map((r) => <li key={r.place_id}><button type="button" onClick={() => { fly(+r.lat, +r.lon); setQ(''); setList([]); onPick({ address: short(r), lat: +r.lat, lng: +r.lon }); }}>{short(r)}</button></li>)}</ul>
        )}
      </div>
      {geo && <p className="no">{geo}</p>}
      <div className="map-box">
        <div ref={el} className="map" />
        <div className={`pin ${loading ? 'busy' : ''}`} aria-hidden="true"><svg width="36" height="46" viewBox="0 0 36 46"><path d="M18 45S3 28 3 17a15 15 0 0 1 30 0c0 11-15 28-15 28z" fill="var(--accent)" stroke="#fff" strokeWidth="2" /><circle cx="18" cy="17" r="5.5" fill="#fff" /></svg></div>
      </div>
      <small>Двигайте карту, чтобы булавка встала на ваш дом. Адрес подставится сам — его можно дописать (подъезд, этаж, квартира).</small>
    </div>
  );
};