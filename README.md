# Kospet.uz — интернет-магазин часов (React + SCSS + Firebase)

## Запуск
1. `npm install`
2. `npm run dev` → магазин на `/`, админка на `/admin` (конфиг Firebase уже в `src/lib/firebase.js`).
3. В консоли Firebase: Firestore (база `default`), Authentication (Email/Password, по желанию Google), правила из `firestore.rules`.
4. Админ: создайте пользователя в Authentication и документ `admins/{UID}` в Firestore.
5. Контакты и соцсети — в `src/config.js`.

## Цвета, фото
В админке «Товары» отмечаются доступные цвета (палитра в `src/lib/colors.js`). Неотмеченные покупатель видит серыми и выбрать не может. Фото перетаскиваются в зону загрузки, хранятся сжатыми в документе товара.

## Деплой (Firebase Hosting)
`npm run build` → `firebase deploy --only hosting,firestore:rules`

## Telegram-бот + Mini App
1. @BotFather → `/newbot` → получите токен. Затем `/setmenubutton` → выберите бота → URL сайта (HTTPS, после деплоя) → название «Магазин». Так сайт откроется как Mini App.
2. Узнайте свой chat id (бот @userinfobot). Для нескольких админов — через запятую.
3. Тариф **Blaze**, затем:
   ```
   cd functions && npm install && cd ..
   firebase functions:secrets:set BOT_TOKEN
   firebase functions:secrets:set ADMIN_CHAT_IDS
   firebase functions:secrets:set WEBHOOK_SECRET   # любая длинная случайная строка
   firebase deploy --only functions,hosting
   ```
4. Подключите webhook (один раз, подставьте токен, домен и секрет):
   `https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://<ваш-домен>/tg-webhook&secret_token=<WEBHOOK_SECRET>`
5. В `functions/index.js` поменяйте `SITE` на свой адрес.

Что умеет: новый заказ приходит админам в Telegram с кнопками «Подтверждён / Отправлен / Выполнен / Отменён» и ссылкой на карту; смена статуса (в боте или в админке) уведомляет клиента, если заказ оформлен из Mini App; `/start` открывает магазин.
Заметка: данные пользователя Telegram берутся из Mini App без серверной проверки подписи — для уведомлений этого достаточно, но не используйте их для авторизации.

## Заказы
`orders/{id}`: `name, phone, address, lat, lng, comment, items[{id,name,price,qty,color}], total, status, uid, tg{id,username,name}, source, createdAt`.

## SEO (следующий этап)
Уже есть: title/description/OG/canonical, JSON-LD Product, robots.txt, noindex на 404. Далее: пререндер страниц и `sitemap.xml`.
