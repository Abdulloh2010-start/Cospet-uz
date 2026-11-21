export const Stars = ({ value = 0, size = 18 }) => (
  <span className="stars" style={{ fontSize: size }} role="img" aria-label={`Оценка ${value} из 5`}>
    {[1, 2, 3, 4, 5].map((i) => <i key={i} className={i <= Math.round(value) ? 'on' : ''}>★</i>)}
  </span>
);
export const StarInput = ({ value, onChange }) => (
  <div className="stars input" role="radiogroup" aria-label="Ваша оценка">
    {[1, 2, 3, 4, 5].map((i) => <button type="button" key={i} role="radio" aria-checked={value === i} className={i <= value ? 'on' : ''} onClick={() => onChange(i)} aria-label={`${i} из 5`}>★</button>)}
  </div>
);