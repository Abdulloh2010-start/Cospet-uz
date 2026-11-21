import { useRef, useState } from 'react';
import { uploadImage } from '../lib/db';

export default function Dropzone({ images, onChange, max = 4 }) {
  const input = useRef(); const [over, setOver] = useState(false); const [busy, setBusy] = useState(0); const [err, setErr] = useState('');

  async function add(files) {
    setErr('');
    const list = [...files].filter((f) => f.type.startsWith('image/')).slice(0, max - images.length);
    if (!list.length) return setErr(files.length ? 'Нужны файлы-изображения' : '');
    setBusy(list.length);
    try { const done = await Promise.all(list.map((f) => uploadImage(f))); onChange([...images, ...done]); }
    catch (e) { setErr(e.message); } finally { setBusy(0); }
  }
  const drop = (e) => { e.preventDefault(); setOver(false); add(e.dataTransfer.files); };

  return (
    <div className="dz-wrap">
      {(images.length > 0 || busy > 0) && (
        <div className="dz-grid">
          {images.map((src, i) => (
            <div className="dz-item" key={i}>
              <img src={src} alt="" />{i === 0 && <span className="cover">Обложка</span>}
              <button type="button" onClick={() => onChange(images.filter((_, j) => j !== i))} aria-label="Удалить фото">×</button>
              {i > 0 && <button type="button" className="mk" onClick={() => onChange([src, ...images.filter((_, j) => j !== i)])}>Сделать главной</button>}
            </div>
          ))}
          {Array.from({ length: busy }, (_, i) => <div className="dz-item sk" key={`b${i}`} />)}
        </div>
      )}
      {images.length < max && (
        <div className={`dz ${over ? 'over' : ''}`} onDragOver={(e) => { e.preventDefault(); setOver(true); }} onDragLeave={() => setOver(false)} onDrop={drop}
          onClick={() => input.current.click()} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && input.current.click()} role="button" tabIndex={0}>
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" /></svg>
          <b>Перетащите фото сюда</b><span>или нажмите, чтобы выбрать · до {max} шт.</span>
          <input ref={input} type="file" accept="image/*" multiple hidden onChange={(e) => { add(e.target.files); e.target.value = ''; }} />
        </div>
      )}
      {err && <p className="no">{err}</p>}
    </div>
  );
};