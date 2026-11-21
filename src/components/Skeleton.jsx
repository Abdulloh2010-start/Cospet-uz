export const Sk = ({ w = '100%', h = 14, r, className = '', style }) => <span className={`sk ${className}`} style={{ width: w, height: h, borderRadius: r, ...style }} aria-hidden="true" />;

export const SkCard = () => (
  <div className="card" aria-busy="true"><Sk className="pic" h="auto" r={0} style={{ aspectRatio: '1', display: 'block' }} />
    <div className="info"><Sk w="30%" h={10} /><Sk w="85%" h={18} /><Sk w="55%" h={16} /><Sk h={44} r={0} style={{ marginTop: 8 }} /></div></div>
);
export const SkGrid = ({ n = 8 }) => <div className="grid">{Array.from({ length: n }, (_, i) => <SkCard key={i} />)}</div>;

export const SkLines = ({ n = 3 }) => <div className="sk-lines">{Array.from({ length: n }, (_, i) => <Sk key={i} w={i === n - 1 ? '60%' : '100%'} />)}</div>;

export const SkProduct = () => (
  <section className="wrap product" aria-busy="true">
    <Sk h="auto" r={0} style={{ aspectRatio: '1', display: 'block' }} />
    <div className="sk-col"><Sk w="20%" h={12} /><Sk w="75%" h={40} /><Sk w="45%" h={30} /><SkLines n={4} /><Sk w="35%" h={14} /><Sk w="60%" h={52} r={0} /></div>
  </section>
);
export const SkRows = ({ n = 3 }) => Array.from({ length: n }, (_, i) => (
  <div className="panel" key={i}><Sk w="35%" h={16} /><Sk w="70%" /><Sk w="50%" /></div>
));
export const SkPage = () => <div className="wrap"><Sk w="40%" h={36} style={{ marginBottom: 24 }} /><SkGrid n={4} /></div>;