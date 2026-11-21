export const COLORS = [
  { id: 'black', name: 'Чёрный', hex: '#1a1d21' },
  { id: 'silver', name: 'Серебристый', hex: '#c3c9d0' },
];
export const colorOf = (id) => COLORS.find((c) => c.id === id);