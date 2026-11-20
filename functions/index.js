// ЗАГОТОВКА под Telegram-бота. Нужен тариф Blaze. Затем: cd functions && npm i firebase-functions firebase-admin
// firebase functions:secrets:set BOT_TOKEN ; firebase functions:secrets:set ADMIN_CHAT_ID
const { onDocumentCreated } = require('firebase-functions/v2/firestore');
const { defineSecret } = require('firebase-functions/params');
const BOT_TOKEN = defineSecret('BOT_TOKEN');
const ADMIN_CHAT_ID = defineSecret('ADMIN_CHAT_ID');

exports.notifyNewOrder = onDocumentCreated({ document: 'orders/{id}', secrets: [BOT_TOKEN, ADMIN_CHAT_ID] }, async (e) => {
  const o = e.data.data();
  const lines = o.items.map((i) => `• ${i.name} × ${i.qty}`).join('\n');
  const text = `🆕 Заказ #${e.params.id.slice(0, 6)}\n${o.name}, ${o.phone}\n${o.address}\n${lines}\nИтого: ${o.total.toLocaleString('ru-RU')} сум`;
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN.value()}/sendMessage`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: ADMIN_CHAT_ID.value(), text }),
  });
});
