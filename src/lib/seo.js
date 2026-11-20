import { useEffect } from 'react';
const SITE = import.meta.env.VITE_SITE_URL || '';

function meta(sel, attr, val) {
  let el = document.head.querySelector(sel);
  if (!el) { el = document.createElement('meta'); const [k, v] = sel.match(/\[(.+?)="(.+?)"\]/).slice(1); el.setAttribute(k, v); document.head.appendChild(el); }
  el.setAttribute(attr, val);
}
// Заголовок, описание, OG и JSON-LD для каждой страницы. Для полноценного SEO позже добавьте пререндер (см. README).
export function useSEO({ title, description, image, jsonLd }) {
  useEffect(() => {
    document.title = title;
    if (description) { meta('meta[name="description"]', 'content', description); meta('meta[property="og:description"]', 'content', description); }
    meta('meta[property="og:title"]', 'content', title);
    if (image) meta('meta[property="og:image"]', 'content', image);
    let link = document.head.querySelector('link[rel="canonical"]');
    if (!link) { link = document.createElement('link'); link.rel = 'canonical'; document.head.appendChild(link); }
    link.href = SITE + location.pathname;
    let s = document.getElementById('ld-json');
    if (jsonLd) { if (!s) { s = document.createElement('script'); s.id = 'ld-json'; s.type = 'application/ld+json'; document.head.appendChild(s); } s.textContent = JSON.stringify(jsonLd); }
    else s?.remove();
  }, [title, description, image, JSON.stringify(jsonLd)]);
}
