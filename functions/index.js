// Telegram-бот магазина: уведомления о заказах, кнопки смены статуса, Mini App.
// Нужен тариф Blaze. Секреты: BOT_TOKEN, ADMIN_CHAT_IDS (через запятую), WEBHOOK_SECRET.
const { onDocumentCreated, onDocumentUpdated } = require('firebase-functions/v2/firestore');
const { onRequest } = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/params');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

initializeApp();
const db = getFirestore('default');           // у вашего проекта база называется "default"
const SITE = 'https://cospet-uzbekistan.web.app'; // адрес сайта после деплоя (HTTPS обязателен для Mini App)

const BOT_TOKEN = defineSecret('BOT_TOKEN');
const ADMIN_CHAT_IDS = defineSecret('ADMIN_CHAT_IDS');
const WEBHOOK_SECRET = defineSecret('WEBHOOK_SECRET');
const secrets = [BOT_TOKEN, ADMIN_CHAT_IDS, WEBHOOK_SECRET];

const STATUS = { new: '🆕 Новый', confirmed: '✅ Подтверждён', shipped: '🚚 Отправлен', done: '🎉 Выполнен', cancelled: '❌ Отменён' };
const api = (method, body) => fetch(`https://api.telegram.org/bot${BOT_TOKEN.value()}/${method}`, {
  method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then((r) => r.json());
const admins = () => ADMIN_CHAT_IDS.value().split(',').map((s) => s.trim()).filter(Boolean);
const esc = (s = '') => String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

function orderText(id, o) {
  const items = o.items.map((i) => `• ${esc(i.name)}${i.color ? ` (${esc(i.color)})` : ''} × ${i.qty}`).join('\n');
  return `<b>Заказ #${id.slice(0, 6)}</b> — ${STATUS[o.status] || o.status}\n\n👤 ${esc(o.name)}\n📞 ${esc(o.phone)}${o.tg?.username ? `\n✈️ @${esc(o.tg.username)}` : ''}\n📍 ${esc(o.address)}${o.comment ? `\n💬 ${esc(o.comment)}` : ''}\n\n${items}\n\n<b>Итого: ${Number(o.total).toLocaleString('ru-RU')} сум</b>`;
}
function orderKeyboard(id, o) {
  const row = (s) => ({ text: STATUS[s], callback_data: `st:${id}:${s}` });
  const kb = [[row('confirmed'), row('shipped')], [row('done'), row('cancelled')]];
  if (o.lat) kb.push([{ text: '🗺 Открыть на карте', url: `https://yandex.com/maps/?pt=${o.lng},${o.lat}&z=17&l=map` }]);
  return { inline_keyboard: kb };
}

// Новый заказ → админам (с кнопками статуса) и клиенту, если он оформил заказ из Telegram.
exports.notifyNewOrder = onDocumentCreated({ document: 'orders/{id}', database: 'default', secrets }, async (e) => {
  const o = e.data.data(), id = e.params.id;
  await Promise.all(admins().map((chat_id) => api('sendMessage', { chat_id, text: orderText(id, o), parse_mode: 'HTML', reply_markup: orderKeyboard(id, o) })));
  if (o.tg?.id) await api('sendMessage', { chat_id: o.tg.id, text: `Спасибо! Заказ #${id.slice(0, 6)} принят. Скоро мы свяжемся с вами.` });
  await e.data.ref.update({ 'telegram.notified': true });
});

// Статус изменился (в админке или кнопкой в боте) → сообщение клиенту.
exports.notifyStatus = onDocumentUpdated({ document: 'orders/{id}', database: 'default', secrets }, async (e) => {
  const a = e.data.before.data(), b = e.data.after.data();
  if (a.status === b.status || !b.tg?.id) return;
  await api('sendMessage', { chat_id: b.tg.id, text: `Заказ #${e.params.id.slice(0, 6)}: ${STATUS[b.status]}` });
});

// Webhook бота (адрес /tg-webhook на вашем сайте, см. firebase.json).
exports.bot = onRequest({ secrets }, async (req, res) => {
  if (req.get('x-telegram-bot-api-secret-token') !== WEBHOOK_SECRET.value()) return res.status(403).send('forbidden');
  const u = req.body;
  try {
    if (u.message?.text?.startsWith('/start')) {
      await api('sendMessage', { chat_id: u.message.chat.id, text: 'Добро пожаловать в Kospet.uz! Откройте магазин прямо в Telegram 👇',
        reply_markup: { inline_keyboard: [[{ text: '⌚ Открыть магазин', web_app: { url: SITE } }]] } });
    }
    if (u.callback_query) {
      const q = u.callback_query;
      if (!admins().includes(String(q.from.id))) return res.send(await api('answerCallbackQuery', { callback_query_id: q.id, text: 'Нет доступа', show_alert: true }) && 'ok');
      const [, id, status] = q.data.split(':');
      const ref = db.doc(`orders/${id}`);
      await ref.update({ status });
      const o = (await ref.get()).data();
      await api('editMessageText', { chat_id: q.message.chat.id, message_id: q.message.message_id, text: orderText(id, o), parse_mode: 'HTML', reply_markup: orderKeyboard(id, o) });
      await api('answerCallbackQuery', { callback_query_id: q.id, text: STATUS[status] });
    }
  } catch (err) { console.error(err); }
  res.send('ok');
});
