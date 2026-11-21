export const tgApp = () => window.Telegram?.WebApp;
export const inTelegram = () => !!tgApp()?.initData;

export function initTg() {
  const w = tgApp();
  if (!w?.initData) return;
  w.ready(); w.expand();
  document.documentElement.classList.add('in-tg');
  if (!localStorage.getItem('theme')) document.documentElement.dataset.theme = w.colorScheme === 'light' ? 'light' : 'dark';
}
export const tgUser = () => {
  const u = tgApp()?.initDataUnsafe?.user;
  return u ? { id: u.id, username: u.username || '', name: [u.first_name, u.last_name].filter(Boolean).join(' ') } : null;
};